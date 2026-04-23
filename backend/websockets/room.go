package websockets

import (
	"log"
	"math/rand"

	"github.com/gorilla/websocket"
)

func generateRoomID() string {
	const digits = "0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = digits[rand.Intn(len(digits))]
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

	host.WriteJSON(Message{Type: "room_created", RoomID: roomID})
}

func JoinRoom(client *websocket.Conn, roomID string) {
	roomsMu.RLock()
	room, exists := rooms[roomID]
	roomsMu.RUnlock()

	if !exists {
		client.WriteJSON(Message{Type: "error", FileData: "Room not found"})
		return
	}

	room.mu.Lock()
	room.Clients[client] = true
	count := len(room.Clients)
	host := room.Host
	room.mu.Unlock()

	if host != nil {
		host.WriteJSON(Message{Type: "participants_count", Participants: count})
	}
}

func ReceiveFileChunk(host *websocket.Conn, roomID string, fileData string, fileName, relativePath, fileType string, fileSize int64, chunkIndex, totalChunks int, isEncrypted, isLastChunk, isFirstChunk bool) {
	roomsMu.RLock()
	room, ok := rooms[roomID]
	roomsMu.RUnlock()

	if !ok || room.Host != host {
		log.Printf("Invalid room or host for room %s", roomID)
		return
	}

	room.mu.Lock()
	if isFirstChunk {
		log.Printf("Starting file: %s (%s, %d bytes) in room %s", fileName, fileType, fileSize, roomID)
		room.FileName = fileName
		room.FileType = fileType
		room.FileSize = fileSize
	}
	room.TotalChunks = totalChunks

	// Build message and snapshot clients under lock to avoid race
	msg := Message{
		Type:        "file_chunk",
		RoomID:      roomID,
		FileData:    fileData,
		ChunkIndex:  chunkIndex,
		TotalChunks: totalChunks,
		IsEncrypted: isEncrypted,
		IsLastChunk: isLastChunk,
	}
	if isFirstChunk {
		msg.FileName = fileName
		msg.RelativePath = relativePath
		msg.FileType = fileType
		msg.FileSize = fileSize
		msg.IsFirstChunk = true
	}

	// Snapshot clients to avoid holding lock during writes
	clients := make([]*websocket.Conn, 0, len(room.Clients))
	for c := range room.Clients {
		clients = append(clients, c)
	}
	room.mu.Unlock()

	// Send to each client; remove failed ones
	var failed []*websocket.Conn
	for _, client := range clients {
		if err := client.WriteJSON(msg); err != nil {
			log.Printf("Error sending to client: %v", err)
			client.Close()
			failed = append(failed, client)
		}
	}

	if len(failed) > 0 {
		room.mu.Lock()
		for _, c := range failed {
			delete(room.Clients, c)
		}
		room.mu.Unlock()
	}

	if isLastChunk {
		log.Printf("Completed file stream in room %s: %s (%d chunks)", roomID, fileName, totalChunks)
	}
}
