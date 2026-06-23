package hub

// Inbound message types (client -> server)
const (
	TypeHello      = "hello"      // {type, name}
	TypeChat       = "chat"       // {type, text}
	TypeCursor     = "cursor"     // {type, x, y}
	TypePaint      = "paint"      // {type, px, py, x, y, color, size}
	TypePaintClear = "paintclear" // {type}
)

// Outbound message types (server -> client)
const (
	TypeWelcome   = "welcome"  // {type, id, color}
	TypePresence  = "presence" // {type, users}
	TypeChatMsg   = "chat"     // {type, id, name, color, text, ts}
	TypeCursorMsg = "cursor"   // {type, id, x, y}
	TypeLeave     = "leave"    // {type, id}
	TypeSystem    = "system"   // {type, text, ts}
	TypePaintMsg  = "paint"    // {type, px, py, x, y, color, size}
	TypePaintWipe = "paintclear"
)

// Inbound is a message decoded from a client.
type Inbound struct {
	Type  string  `json:"type"`
	Name  string  `json:"name,omitempty"`
	Text  string  `json:"text,omitempty"`
	X     float64 `json:"x,omitempty"`
	Y     float64 `json:"y,omitempty"`
	PX    float64 `json:"px,omitempty"`
	PY    float64 `json:"py,omitempty"`
	Color string  `json:"color,omitempty"`
	Size  float64 `json:"size,omitempty"`
}

// User is the public profile broadcast in presence updates.
type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
