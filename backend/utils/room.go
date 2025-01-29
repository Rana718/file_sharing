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
	room, ok := rooms[roomID]
	roomsMu.Unlock()

	if !ok {
		client.WriteJSON(Message{
			Type: "error",
			FileData: "Room not found",
		})
		return
	}

	room.mu.Lock()
	room.Clients[client] = true
	fileData := string(room.FileData)
	fileName := room.FileName
	fileType := room.FileType
	room.mu.Unlock()


	if len(fileData) > 0 {
		client.WriteJSON(Message{
			Type:     "file_data",
			FileData: base64.StdEncoding.EncodeToString(room.FileData),
			FileName: fileName,
			FileType: fileType,
		})
	}
}

func ShareFile(host *websocket.Conn, roomID string, fileData []byte, fileName, fileType string){
	roomsMu.Lock()
	room, ok := rooms[roomID]
	roomsMu.Unlock()

	if !ok || room.Host != host{
		return
	}

	room.mu.Lock()
	room.FileData = fileData
	room.FileName = fileName
	room.FileType = fileType

	for client := range room.Clients {
		client.WriteJSON(Message{
			Type:     "file",
			FileData: base64.StdEncoding.EncodeToString(fileData),
			FileName: fileName,
			FileType: fileType,
		})
	}
	room.mu.Unlock()
}