package websockets

import (
	"encoding/base64"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

type Room struct {
	ID          string
	Host        *websocket.Conn
	Clients     map[*websocket.Conn]bool
	FileChunks  [][]byte
	FileName    string
	FileType    string
	FileSize    int
	TotalChunks int
	mu          sync.Mutex
}

type Message struct {
	Type         string `json:"type"`
	RoomID       string `json:"roomId,omitempty"`
	FileData     string `json:"fileData,omitempty"`
	FileName     string `json:"fileName,omitempty"`
	FileType     string `json:"fileType,omitempty"`
	FileSize     int    `json:"fileSize,omitempty"`
	ChunkIndex   int    `json:"chunkIndex,omitempty"`
	TotalChunks  int    `json:"totalChunks,omitempty"`
	IsLastChunk  bool   `json:"isLastChunk,omitempty"`
	IsFirstChunk bool   `json:"isFirstChunk,omitempty"`
}

var (
	rooms    = make(map[string]*Room)
	roomsMu  sync.Mutex
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	ChunkSize = 1024 * 64
)

func HandeleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		handleDisconnect(conn)
		return
	}
	defer conn.Close()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)

		if err != nil {
			handleDisconnect(conn)
			log.Println(err)
			break
		}

		switch msg.Type {
		case "create":
			CreateRoom(conn)

		case "join":
			JoinRoom(conn, msg.RoomID)

		case "file_chunk":
			fileDataStr := msg.FileData
			fileDataStr = strings.ReplaceAll(fileDataStr, "-", "+")
			fileDataStr = strings.ReplaceAll(fileDataStr, "_", "/")

			if padding := len(fileDataStr) % 4; padding != 0 {
				fileDataStr += strings.Repeat("=", 4-padding)
			}

			fileData, err := base64.StdEncoding.DecodeString(fileDataStr)

			if err != nil {
				log.Println("Error decoding file chunk:", err)
				continue
			}

			ReceiveFileChunk(conn, msg.RoomID, fileData, msg.FileName, msg.FileType, msg.FileSize, msg.ChunkIndex, msg.TotalChunks, msg.IsLastChunk, msg.IsFirstChunk)
		}
	}
}

func handleDisconnect(conn *websocket.Conn) {
	roomsMu.Lock()
	defer roomsMu.Unlock()

	for roomID, room := range rooms {
		room.mu.Lock()

		if room.Host == conn {
			for client := range room.Clients {
				client.WriteJSON(Message{Type: "room_closed"})
				client.Close()
			}

			delete(rooms, roomID)
			room.mu.Unlock()
			return
		}

		delete(room.Clients, conn)
		room.mu.Unlock()
	}
}
