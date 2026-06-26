package hub

import (
	"testing"
	"time"
)

func TestTokenBucketAllowsUpToCapacity(t *testing.T) {
	b := newTokenBucket(3, 0) // no refill
	for i := range 3 {
		if !b.allow() {
			t.Fatalf("call %d: expected allow within capacity", i)
		}
	}
	if b.allow() {
		t.Fatal("expected deny after capacity exhausted")
	}
}

func TestTokenBucketRefills(t *testing.T) {
	b := newTokenBucket(1, 100) // refills fast: 100 tokens/sec
	if !b.allow() {
		t.Fatal("first call should be allowed")
	}
	if b.allow() {
		t.Fatal("second immediate call should be denied")
	}
	time.Sleep(20 * time.Millisecond) // ~2 tokens refilled
	if !b.allow() {
		t.Fatal("call after refill window should be allowed")
	}
}

func TestTokenBucketRefillCappedAtCapacity(t *testing.T) {
	b := newTokenBucket(2, 1000)
	time.Sleep(20 * time.Millisecond) // would refill ~20 tokens, capped at 2
	allowed := 0
	for range 5 {
		if b.allow() {
			allowed++
		}
	}
	if allowed > 2 {
		t.Fatalf("allowed %d, expected at most capacity (2)", allowed)
	}
}

func TestTokenBucketConcurrentSafe(t *testing.T) {
	b := newTokenBucket(100, 0)
	done := make(chan bool)
	for range 10 {
		go func() {
			for range 50 {
				b.allow()
			}
			done <- true
		}()
	}
	for range 10 {
		<-done
	}
	// No assertion beyond not panicking / -race detecting no data race.
}
