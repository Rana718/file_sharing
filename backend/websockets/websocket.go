package websockets

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Room struct {
	ID          string
	Host        *websocket.Conn
	Clients     map[*websocket.Conn]bool
	FileName    string
	FileType    string
	FileSize    int64 // int64 to support files > 2GB
	TotalChunks int
	mu          sync.Mutex
}

type Message struct {
	Type         string `json:"type"`
	RoomID       string `json:"roomId,omitempty"`
	FileData     string `json:"fileData,omitempty"`
	FileName     string `json:"fileName,omitempty"`
	RelativePath string `json:"relativePath,omitempty"`
	FileType     string `json:"fileType,omitempty"`
	FileSize     int64  `json:"fileSize,omitempty"`
	ChunkIndex   int    `json:"chunkIndex,omitempty"`
	TotalChunks  int    `json:"totalChunks,omitempty"`
	IsEncrypted  bool   `json:"isEncrypted,omitempty"`
	IsLastChunk  bool   `json:"isLastChunk,omitempty"`
	IsFirstChunk bool   `json:"isFirstChunk,omitempty"`
	Participants int    `json:"participants,omitempty"`
}

var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024 * 64,
		WriteBufferSize: 1024 * 64,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
)

func HandeleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer func() {
		handleDisconnect(conn)
		conn.Close()
	}()

	// No read limit — supports unlimited file size via chunking
	conn.SetReadLimit(-1)

	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("Read error:", err)
			break
		}

		switch msg.Type {
		case "create":
			CreateRoom(conn)
		case "join":
			JoinRoom(conn, msg.RoomID)
		case "file_chunk":
			ReceiveFileChunk(conn, msg.RoomID, msg.FileData, msg.FileName, msg.RelativePath, msg.FileType, msg.FileSize, msg.ChunkIndex, msg.TotalChunks, msg.IsEncrypted, msg.IsLastChunk, msg.IsFirstChunk)
		}
	}
}

func handleDisconnect(conn *websocket.Conn) {
	roomsMu.Lock()

	for roomID, room := range rooms {
		room.mu.Lock()

		if room.Host == conn {
			log.Printf("Host disconnected from room %s", roomID)
			for client := range room.Clients {
				client.WriteJSON(Message{Type: "room_closed"})
				client.Close()
			}
			room.Clients = nil
			delete(rooms, roomID)
			room.mu.Unlock()
			roomsMu.Unlock()
			return
		}

		if _, ok := room.Clients[conn]; ok {
			log.Printf("Client disconnected from room %s", roomID)
			delete(room.Clients, conn)
			count := len(room.Clients)
			host := room.Host
			room.mu.Unlock()
			roomsMu.Unlock()

			// Notify host outside of locks
			if host != nil {
				host.WriteJSON(Message{Type: "participants_count", Participants: count})
			}
			return
		}

		room.mu.Unlock()
	}

	roomsMu.Unlock()
}

func UpdateParticipants(room *Room) {
	if room.Host != nil {
		room.Host.WriteJSON(Message{
			Type:         "participants_count",
			Participants: len(room.Clients),
		})
	}
}
