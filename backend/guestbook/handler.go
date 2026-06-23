package guestbook

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	maxNameRunes    = 24
	maxMessageRunes = 280
	listLimit       = 100
	maxBodyBytes    = 4096
	postCooldown    = 10 * time.Second // one signing per IP per cooldown window
)

var palette = []string{
	"#000080", "#008080", "#800000", "#808000",
	"#008000", "#800080", "#0000ff", "#c00000",
}

// Handler serves the guestbook REST endpoint (GET list, POST sign).
type Handler struct {
	store *Store

	mu       sync.Mutex
	lastPost map[string]time.Time // per-IP cooldown to throttle public abuse
}

func NewHandler(store *Store) *Handler {
	return &Handler{store: store, lastPost: make(map[string]time.Time)}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.handleList(w)
	case http.MethodPost:
		h.handleSign(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *Handler) handleList(w http.ResponseWriter) {
	writeJSON(w, http.StatusOK, h.store.List(listLimit))
}

func (h *Handler) handleSign(w http.ResponseWriter, r *http.Request) {
	ip := clientIP(r)
	if !h.allow(ip) {
		http.Error(w, "slow down — one entry per 10s", http.StatusTooManyRequests)
		return
	}

	var in struct {
		Name    string `json:"name"`
		Message string `json:"message"`
	}
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBodyBytes))
	if err := dec.Decode(&in); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	name := sanitizeText(in.Name, maxNameRunes)
	if name == "" {
		name = "Anonymous"
	}
	msg := sanitizeText(in.Message, maxMessageRunes)
	if msg == "" {
		http.Error(w, "message is empty", http.StatusBadRequest)
		return
	}

	e := Entry{
		ID:      randomID(),
		Name:    name,
		Message: msg,
		Color:   palette[int(time.Now().UnixNano())%len(palette)],
		Ts:      nowMillis(),
	}
	if err := h.store.Add(e); err != nil {
		http.Error(w, "could not save", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, e)
}

// allow enforces a per-IP cooldown between POSTs.
func (h *Handler) allow(ip string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	now := time.Now()
	if last, ok := h.lastPost[ip]; ok && now.Sub(last) < postCooldown {
		return false
	}
	h.lastPost[ip] = now
	return true
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// sanitizeText trims, drops control chars, rejects invalid UTF-8, caps length.
// Output is plain text; the frontend renders it as text, never HTML.
func sanitizeText(s string, maxRunes int) string {
	if !utf8.ValidString(s) {
		return ""
	}
	var b strings.Builder
	count := 0
	for _, r := range s {
		if count >= maxRunes {
			break
		}
		if r == '\n' || r == '\t' {
			b.WriteRune(' ')
			count++
			continue
		}
		if unicode.IsControl(r) {
			continue
		}
		b.WriteRune(r)
		count++
	}
	return strings.TrimSpace(b.String())
}

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

func randomID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "00000000"
	}
	return hex.EncodeToString(b)
}
