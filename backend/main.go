package main

import (
	"Server/utils"
	"Server/websockets"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", websockets.HandeleWebSocket)
	mux.HandleFunc("/hello", utils.HelloHandler)
	mux.HandleFunc("/health", utils.HelloHandler)

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"*"},
	}).Handler(mux)

	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
