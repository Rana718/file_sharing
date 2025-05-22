package websockets

import (
	"encoding/base64"
	"log"
	"math/rand"

	"github.com/gorilla/websocket"
)

func generateRoomID() string {
	const letters = "0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func CreateRoom(host *websocket.Conn) {
	roomID := generateRoomID()

	room := &Room{
		ID:      roomID,
		Host:    host,
		Clients: make(map[*websocket.Conn]bool),
	}

	roomsMu.Lock()
	rooms[roomID] = room
	roomsMu.Unlock()

	host.WriteJSON(Message{
		Type:   "room_created",
		RoomID: roomID,
	})
}

func JoinRoom(client *websocket.Conn, roomID string) {
	roomsMu.Lock()
	room, exists := rooms[roomID]
	roomsMu.Unlock()

	if !exists {
		client.WriteJSON(Message{
			Type:     "error",
			FileData: "Room not found",
		})
		return
	}

	room.mu.Lock()
	room.Clients[client] = true
	room.mu.Unlock()

	UpdateParticipants(room)
}

func ReceiveFileChunk(host *websocket.Conn, roomID string, fileData []byte, fileName, fileType string, fileSize, chunkIndex, totalChunks int, isLastChunk, isFirstChunk bool) {
	roomsMu.Lock()
	room, ok := rooms[roomID]
	roomsMu.Unlock()

	if !ok || room.Host != host {
		log.Printf("Invalid room ID or host connection: %s", roomID)
		return
	}

	room.mu.Lock()
	if isFirstChunk {
		log.Printf("Starting file stream: %s (%s, %d bytes) in room %s", fileName, fileType, fileSize, roomID)
		room.FileName = fileName
		room.FileType = fileType
		room.FileSize = fileSize
	}
	room.TotalChunks = totalChunks
	room.mu.Unlock()

	for client := range room.Clients {
		msg := Message{
			Type:        "file_chunk",
			RoomID:      roomID,
			FileData:    base64.RawURLEncoding.EncodeToString(fileData),
			ChunkIndex:  chunkIndex,
			TotalChunks: totalChunks,
			IsLastChunk: isLastChunk,
		}

		if isFirstChunk {
			msg.FileName = fileName
			msg.FileType = fileType
			msg.FileSize = fileSize
			msg.IsFirstChunk = true
		}

		if err := client.WriteJSON(msg); err != nil {
			log.Printf("Error sending chunk to client: %v", err)
			client.Close()
			delete(room.Clients, client)
		}
	}

	if isLastChunk {
		log.Printf("Completed file stream in room %s: %s (%d/%d chunks)", roomID, fileName, chunkIndex, totalChunks)
	}
}
