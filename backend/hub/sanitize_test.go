package hub

import "testing"

func TestSanitizeText(t *testing.T) {
	tests := []struct {
		name     string
		in       string
		maxRunes int
		want     string
	}{
		{"trims whitespace", "  hello  ", 100, "hello"},
		{"empty stays empty", "   ", 100, ""},
		{"newline becomes space", "a\nb", 100, "a b"},
		{"tab becomes space", "a\tb", 100, "a b"},
		{"drops control chars", "a\x00\x07b", 100, "ab"},
		{"caps to maxRunes", "abcdef", 3, "abc"},
		{"invalid utf8 rejected", "\xff\xfe", 100, ""},
		{"keeps unicode", "héllo🎉", 100, "héllo🎉"},
		{"cap counts runes not bytes", "🎉🎉🎉🎉", 2, "🎉🎉"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := sanitizeText(tt.in, tt.maxRunes); got != tt.want {
				t.Errorf("sanitizeText(%q, %d) = %q, want %q", tt.in, tt.maxRunes, got, tt.want)
			}
		})
	}
}

func TestValidHexColor(t *testing.T) {
	tests := []struct {
		in     string
		want   string
		wantOk bool
	}{
		{"#fff", "#fff", true},
		{"#FFFFFF", "#ffffff", true},
		{"  #AbC123  ", "#abc123", true},
		{"#0000ff", "#0000ff", true},
		{"fff", "", false},
		{"#gggggg", "", false},
		{"#12345", "", false},
		{"#1234567", "", false},
		{"", "", false},
		{"red", "", false},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, ok := validHexColor(tt.in)
			if ok != tt.wantOk || got != tt.want {
				t.Errorf("validHexColor(%q) = (%q, %v), want (%q, %v)", tt.in, got, ok, tt.want, tt.wantOk)
			}
		})
	}
}

func TestClampFloat(t *testing.T) {
	tests := []struct {
		v, lo, hi, want float64
	}{
		{0.5, 0, 1, 0.5},
		{-0.2, 0, 1, 0},
		{1.5, 0, 1, 1},
		{0, 0, 1, 0},
		{1, 0, 1, 1},
	}
	for _, tt := range tests {
		if got := clampFloat(tt.v, tt.lo, tt.hi); got != tt.want {
			t.Errorf("clampFloat(%v, %v, %v) = %v, want %v", tt.v, tt.lo, tt.hi, got, tt.want)
		}
	}
}

func TestClamp01(t *testing.T) {
	if got := clamp01(2); got != 1 {
		t.Errorf("clamp01(2) = %v, want 1", got)
	}
	if got := clamp01(-1); got != 0 {
		t.Errorf("clamp01(-1) = %v, want 0", got)
	}
}
