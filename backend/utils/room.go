package websockets

import (
	"encoding/base64"
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
		FileChunks: make([][]byte, 0),
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
}

func ShareFile(host *websocket.Conn, roomID string, fileData []byte, fileName, fileType string, chunkIndex, totalChunks int, isLastChunk bool) {
	roomsMu.Lock()
	room, ok := rooms[roomID]
	roomsMu.Unlock()

	if !ok || room.Host != host {
		return
	}

	room.mu.Lock()
	room.FileChunks = append(room.FileChunks, fileData)
	room.FileName = fileName
	room.FileType = fileType
	room.TotalChunks = totalChunks

	for client := range room.Clients {
		client.WriteJSON(Message{
			Type:        "file_chunk",
			RoomID:      roomID,
			FileData:    base64.RawURLEncoding.EncodeToString(fileData),
			ChunkIndex:  chunkIndex,
			TotalChunks: totalChunks,
			IsLastChunk: isLastChunk,
		})
	}
	room.mu.Unlock()
}
