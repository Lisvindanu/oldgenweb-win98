package hub

import (
	"encoding/json"
	"log"
	"sync"
	"time"
)

const maxConnsPerIP = 6

// Hub maintains the set of active clients and broadcasts messages.
type Hub struct {
	mu         sync.RWMutex
	clients    map[*Client]bool
	ipCounts   map[string]int
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
}

func New() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		ipCounts:   make(map[string]int),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte, 256),
	}
}

// tryAddIP reserves a connection slot for an IP. It returns false when the IP
// already holds the maximum number of concurrent connections.
func (h *Hub) tryAddIP(ip string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.ipCounts[ip] >= maxConnsPerIP {
		return false
	}
	h.ipCounts[ip]++
	return true
}

func (h *Hub) removeIP(ip string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.ipCounts[ip] > 0 {
		h.ipCounts[ip]--
		if h.ipCounts[ip] == 0 {
			delete(h.ipCounts, ip)
		}
	}
}

// Run is the hub's event loop. Call it in its own goroutine.
func (h *Hub) Run() {
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = true
			h.mu.Unlock()

		case c := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
			}
			h.mu.Unlock()
			h.broadcastJSON(map[string]any{"type": TypeLeave, "id": c.id})
			h.broadcastPresence()

		case msg := <-h.broadcast:
			h.sendToAll(msg)
		}
	}
}

func (h *Hub) sendToAll(msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.clients {
		select {
		case c.send <- msg:
		default:
			// Slow client: drop the message rather than block the hub.
		}
	}
}

func (h *Hub) broadcastJSON(v any) {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("hub: marshal error: %v", err)
		return
	}
	h.broadcast <- data
}

func (h *Hub) broadcastPresence() {
	h.mu.RLock()
	users := make([]User, 0, len(h.clients))
	for c := range h.clients {
		users = append(users, User{ID: c.id, Name: c.name, Color: c.color})
	}
	h.mu.RUnlock()
	h.broadcastJSON(map[string]any{"type": TypePresence, "users": users})
}

func nowMillis() int64 {
	return time.Now().UnixMilli()
}
