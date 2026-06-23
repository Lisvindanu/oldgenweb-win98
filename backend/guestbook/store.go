package guestbook

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

// maxEntries caps how many entries we keep on disk. Older entries are dropped
// once the cap is exceeded so an abusive flood can't grow the file unbounded.
const maxEntries = 500

// Entry is a single signed guestbook record.
type Entry struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Message string `json:"message"`
	Color   string `json:"color"`
	Ts      int64  `json:"ts"`
}

// Store is a thread-safe, file-backed list of guestbook entries.
type Store struct {
	mu      sync.RWMutex
	path    string
	entries []Entry
}

// NewStore loads any existing entries from path. A missing or unreadable file
// starts an empty store rather than failing — the guestbook is a toy feature.
func NewStore(path string) *Store {
	s := &Store{path: path, entries: []Entry{}}
	if data, err := os.ReadFile(path); err == nil {
		var loaded []Entry
		if json.Unmarshal(data, &loaded) == nil {
			s.entries = loaded
		}
	}
	return s
}

// Add appends an entry, trims to the cap, and persists to disk.
func (s *Store) Add(e Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.entries = append(s.entries, e)
	if len(s.entries) > maxEntries {
		s.entries = s.entries[len(s.entries)-maxEntries:]
	}
	return s.persistLocked()
}

// List returns up to limit of the most recent entries, newest first.
func (s *Store) List(limit int) []Entry {
	s.mu.RLock()
	defer s.mu.RUnlock()
	n := len(s.entries)
	if limit <= 0 || limit > n {
		limit = n
	}
	out := make([]Entry, 0, limit)
	for i := n - 1; i >= n-limit; i-- {
		out = append(out, s.entries[i])
	}
	return out
}

// persistLocked writes entries to disk atomically. Caller must hold s.mu.
func (s *Store) persistLocked() error {
	data, err := json.Marshal(s.entries)
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func nowMillis() int64 {
	return time.Now().UnixMilli()
}
