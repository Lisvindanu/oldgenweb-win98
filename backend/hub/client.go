package hub

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

var palette = []string{
	"#000080", "#008080", "#800000", "#808000",
	"#008000", "#800080", "#0000ff", "#ff00ff",
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow any origin: this is a public retro toy, tighten for production.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Client is a single websocket connection.
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
	ip   string

	id    string
	name  string
	color string

	// Per-connection rate limiters guard against abuse from public users.
	msgLimiter  *tokenBucket // overall flood guard (cursor + paint + chat)
	chatLimiter *tokenBucket // stricter limit just for chat messages
}

// ServeWS upgrades an HTTP request to a websocket and registers the client.
func ServeWS(h *Hub, w http.ResponseWriter, r *http.Request) {
	ip := clientIP(r)
	if !h.tryAddIP(ip) {
		http.Error(w, "too many connections", http.StatusTooManyRequests)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.removeIP(ip)
		log.Printf("client: upgrade error: %v", err)
		return
	}

	id := randomID()
	c := &Client{
		hub:         h,
		conn:        conn,
		send:        make(chan []byte, 256),
		ip:          ip,
		id:          id,
		name:        "Guest",
		color:       palette[int(id[0])%len(palette)],
		msgLimiter:  newTokenBucket(200, 100), // ~100 msgs/sec sustained, burst 200 (covers paint+cursor)
		chatLimiter: newTokenBucket(5, 0.5),  // 5 burst, then 1 msg / 2s
	}
	h.register <- c

	welcome, _ := json.Marshal(map[string]any{"type": TypeWelcome, "id": c.id, "color": c.color})
	c.send <- welcome

	go c.writePump()
	go c.readPump()
}

// clientIP extracts the best-effort remote IP, honoring a single proxy hop.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		first, _, _ := strings.Cut(xff, ",")
		return strings.TrimSpace(first)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.hub.removeIP(c.ip)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("client: read error: %v", err)
			}
			break
		}

		var in Inbound
		if err := json.Unmarshal(raw, &in); err != nil {
			continue
		}
		c.handle(in)
	}
}

func (c *Client) handle(in Inbound) {
	// Overall flood guard: silently drop anything past the sustained rate.
	if !c.msgLimiter.allow() {
		return
	}

	switch in.Type {
	case TypeHello:
		name := sanitizeText(in.Name, 24)
		if name == "" {
			name = "Guest"
		}
		c.name = name
		c.hub.broadcastPresence()
		c.hub.broadcastJSON(map[string]any{
			"type": TypeSystem,
			"text": c.name + " has joined.",
			"ts":   nowMillis(),
		})

	case TypeChat:
		if !c.chatLimiter.allow() {
			return
		}
		text := sanitizeText(in.Text, 1000)
		if text == "" {
			return
		}
		c.hub.broadcastJSON(map[string]any{
			"type":  TypeChatMsg,
			"id":    c.id,
			"name":  c.name,
			"color": c.color,
			"text":  text,
			"ts":    nowMillis(),
		})

	case TypeCursor:
		c.hub.broadcastJSON(map[string]any{
			"type": TypeCursorMsg,
			"id":   c.id,
			"x":    in.X,
			"y":    in.Y,
		})

	case TypePaint:
		color, ok := validHexColor(in.Color)
		if !ok {
			return
		}
		c.hub.broadcastJSON(map[string]any{
			"type":  TypePaintMsg,
			"px":    clamp01(in.PX),
			"py":    clamp01(in.PY),
			"x":     clamp01(in.X),
			"y":     clamp01(in.Y),
			"color": color,
			"size":  clampFloat(in.Size, 1, 40),
		})

	case TypePaintClear:
		c.hub.broadcastJSON(map[string]any{"type": TypePaintWipe})
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func randomID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "00000000"
	}
	return hex.EncodeToString(b)
}
