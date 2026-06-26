package guestbook

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
)

func newTestHandler(t *testing.T) *Handler {
	t.Helper()
	path := filepath.Join(t.TempDir(), "guestbook.json")
	return NewHandler(NewStore(path))
}

func postSign(h *Handler, ip, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/api/guestbook", strings.NewReader(body))
	req.RemoteAddr = ip + ":12345"
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHandlerSignAndList(t *testing.T) {
	h := newTestHandler(t)

	rec := postSign(h, "1.1.1.1", `{"name":"Alice","message":"hello"}`)
	if rec.Code != http.StatusCreated {
		t.Fatalf("POST status = %d, want 201; body=%s", rec.Code, rec.Body.String())
	}
	var created Entry
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode created: %v", err)
	}
	if created.Name != "Alice" || created.Message != "hello" {
		t.Fatalf("created = %+v", created)
	}
	if created.ID == "" || created.Color == "" || created.Ts == 0 {
		t.Fatalf("server fields not populated: %+v", created)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/guestbook", nil)
	rec = httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET status = %d, want 200", rec.Code)
	}
	var list []Entry
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode list: %v", err)
	}
	if len(list) != 1 || list[0].Name != "Alice" {
		t.Fatalf("list = %+v, want one Alice", list)
	}
}

func TestHandlerEmptyNameDefaultsAnonymous(t *testing.T) {
	h := newTestHandler(t)
	rec := postSign(h, "2.2.2.2", `{"name":"   ","message":"hi"}`)
	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201", rec.Code)
	}
	var e Entry
	_ = json.Unmarshal(rec.Body.Bytes(), &e)
	if e.Name != "Anonymous" {
		t.Fatalf("name = %q, want Anonymous", e.Name)
	}
}

func TestHandlerEmptyMessageRejected(t *testing.T) {
	h := newTestHandler(t)
	rec := postSign(h, "3.3.3.3", `{"name":"Bob","message":"   "}`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}

func TestHandlerBadJSONRejected(t *testing.T) {
	h := newTestHandler(t)
	rec := postSign(h, "4.4.4.4", `{not json`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}

func TestHandlerPerIPCooldown(t *testing.T) {
	h := newTestHandler(t)
	if rec := postSign(h, "5.5.5.5", `{"message":"one"}`); rec.Code != http.StatusCreated {
		t.Fatalf("first POST status = %d, want 201", rec.Code)
	}
	if rec := postSign(h, "5.5.5.5", `{"message":"two"}`); rec.Code != http.StatusTooManyRequests {
		t.Fatalf("second POST status = %d, want 429", rec.Code)
	}
	// A different IP is unaffected by the first IP's cooldown.
	if rec := postSign(h, "6.6.6.6", `{"message":"other"}`); rec.Code != http.StatusCreated {
		t.Fatalf("different-IP POST status = %d, want 201", rec.Code)
	}
}

func TestHandlerMethodNotAllowed(t *testing.T) {
	h := newTestHandler(t)
	req := httptest.NewRequest(http.MethodDelete, "/api/guestbook", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", rec.Code)
	}
}

func TestHandlerOversizedBodyRejected(t *testing.T) {
	h := newTestHandler(t)
	big := strings.Repeat("a", maxBodyBytes+100)
	rec := postSign(h, "7.7.7.7", `{"message":"`+big+`"}`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400 for oversized body", rec.Code)
	}
}
