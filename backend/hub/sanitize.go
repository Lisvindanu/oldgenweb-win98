package hub

import (
	"strings"
	"unicode"
	"unicode/utf8"
)

// sanitizeText trims whitespace, drops control characters (except spaces),
// rejects invalid UTF-8, and caps the length to maxRunes.
// Output is plain text; the frontend renders it as text (never HTML),
// so this guards against control-char abuse and oversized payloads.
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

// validHexColor accepts only #rgb or #rrggbb hex colors (lowercased).
// Restricting to a strict format prevents any CSS/markup injection via color.
func validHexColor(s string) (string, bool) {
	s = strings.ToLower(strings.TrimSpace(s))
	if len(s) != 4 && len(s) != 7 {
		return "", false
	}
	if s[0] != '#' {
		return "", false
	}
	for _, r := range s[1:] {
		if !((r >= '0' && r <= '9') || (r >= 'a' && r <= 'f')) {
			return "", false
		}
	}
	return s, true
}

func clamp01(v float64) float64 {
	return clampFloat(v, 0, 1)
}

func clampFloat(v, lo, hi float64) float64 {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}
