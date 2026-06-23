package main

import (
	"log"
	"net/http"
	"os"

	"oldgenweb/backend/guestbook"
	"oldgenweb/backend/hub"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	h := hub.New()
	go h.Run()

	gbPath := os.Getenv("GUESTBOOK_PATH")
	if gbPath == "" {
		gbPath = "guestbook.json"
	}
	gb := guestbook.NewHandler(guestbook.NewStore(gbPath))

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		hub.ServeWS(h, w, r)
	})
	mux.Handle("/api/guestbook", gb)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// Serve the built frontend if it exists (production single-binary mode).
	if _, err := os.Stat("./public"); err == nil {
		mux.Handle("/", http.FileServer(http.Dir("./public")))
	}

	log.Printf("oldgenweb backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

// withCORS allows the Vite dev server (different origin) to call the API in dev.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
