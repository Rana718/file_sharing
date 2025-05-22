package main

import (
	"Server/utils"
	"Server/websockets"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/rs/cors"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", websockets.HandeleWebSocket)
	mux.HandleFunc("/hello", utils.HelloHandler)
	mux.HandleFunc("/health", utils.HelloHandler)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(mux)

	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
