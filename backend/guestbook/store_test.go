package guestbook

import (
	"path/filepath"
	"testing"
)

func tempStore(t *testing.T) (*Store, string) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "guestbook.json")
	return NewStore(path), path
}

func TestStoreAddAndListNewestFirst(t *testing.T) {
	s, _ := tempStore(t)
	for i, msg := range []string{"first", "second", "third"} {
		if err := s.Add(Entry{ID: string(rune('a' + i)), Message: msg, Ts: int64(i)}); err != nil {
			t.Fatalf("Add: %v", err)
		}
	}
	got := s.List(0)
	if len(got) != 3 {
		t.Fatalf("List returned %d entries, want 3", len(got))
	}
	if got[0].Message != "third" || got[2].Message != "first" {
		t.Fatalf("List not newest-first: %+v", got)
	}
}

func TestStoreListLimit(t *testing.T) {
	s, _ := tempStore(t)
	for i := range 5 {
		_ = s.Add(Entry{ID: string(rune('a' + i)), Message: "m"})
	}
	if got := s.List(2); len(got) != 2 {
		t.Fatalf("List(2) returned %d, want 2", len(got))
	}
	if got := s.List(100); len(got) != 5 {
		t.Fatalf("List(100) returned %d, want 5", len(got))
	}
}

func TestStoreCapsAtMaxEntries(t *testing.T) {
	s, _ := tempStore(t)
	for range maxEntries + 50 {
		_ = s.Add(Entry{ID: "x", Message: "m"})
	}
	if got := len(s.List(0)); got != maxEntries {
		t.Fatalf("store kept %d entries, want cap %d", got, maxEntries)
	}
}

func TestStorePersistsToDisk(t *testing.T) {
	s, path := tempStore(t)
	if err := s.Add(Entry{ID: "1", Name: "Alice", Message: "hi", Ts: 42}); err != nil {
		t.Fatalf("Add: %v", err)
	}
	// New store over the same path should reload the persisted entry.
	reloaded := NewStore(path)
	got := reloaded.List(0)
	if len(got) != 1 || got[0].Name != "Alice" || got[0].Message != "hi" {
		t.Fatalf("reloaded entries = %+v, want one Alice entry", got)
	}
}

func TestNewStoreMissingFileIsEmpty(t *testing.T) {
	s := NewStore(filepath.Join(t.TempDir(), "does-not-exist.json"))
	if got := s.List(0); len(got) != 0 {
		t.Fatalf("missing-file store has %d entries, want 0", len(got))
	}
}
