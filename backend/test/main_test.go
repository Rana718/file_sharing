package main

import (
	"Server/utils"
	"encoding/base64"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	websockets "Server/websockets"

	"github.com/gorilla/websocket"
)

func TestHelloHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/hello", nil)
	rr := httptest.NewRecorder()

	utils.HelloHandler(rr, req)

	res := rr.Result()
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, res.StatusCode)
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("error reading response body: %v", err)
	}

	expected := `{"message": "Hello from PeerDrop Server!"}`
	if string(body) != expected {
		t.Errorf("expected body %q, got %q", expected, body)
	}
}

func newTestServer() *httptest.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", websockets.HandeleWebSocket)
	mux.HandleFunc("/hello", utils.HelloHandler)
	return httptest.NewServer(mux)
}

func TestWebSocketCreateRoom(t *testing.T) {
	server := newTestServer()
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"

	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("WebSocket dial error: %v", err)
	}
	defer wsConn.Close()

	createMsg := websockets.Message{Type: "create"}
	if err := wsConn.WriteJSON(createMsg); err != nil {
		t.Fatalf("error writing create message: %v", err)
	}

	var resp websockets.Message
	if err := wsConn.ReadJSON(&resp); err != nil {
		t.Fatalf("error reading room_created response: %v", err)
	}
	if resp.Type != "room_created" || resp.RoomID == "" {
		t.Errorf("unexpected room creation response: %+v", resp)
	}
}

func TestWebSocketJoinRoom(t *testing.T) {
	server := newTestServer()
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"

	hostConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("host WebSocket dial error: %v", err)
	}
	defer hostConn.Close()

	if err := hostConn.WriteJSON(websockets.Message{Type: "create"}); err != nil {
		t.Fatalf("host write error: %v", err)
	}

	var createResp websockets.Message
	if err := hostConn.ReadJSON(&createResp); err != nil {
		t.Fatalf("host read error: %v", err)
	}
	roomID := createResp.RoomID
	if roomID == "" {
		t.Fatalf("expected a valid roomID, got empty string")
	}

	clientConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("client WebSocket dial error: %v", err)
	}
	defer clientConn.Close()

	joinMsg := websockets.Message{Type: "join", RoomID: roomID}
	if err := clientConn.WriteJSON(joinMsg); err != nil {
		t.Fatalf("client write join error: %v", err)
	}

	hostConn.SetReadDeadline(time.Now().Add(2 * time.Second))
	var updateResp websockets.Message
	if err := hostConn.ReadJSON(&updateResp); err != nil {
		t.Fatalf("host read error (participants update): %v", err)
	}
	if updateResp.Type != "participants_count" {
		t.Errorf("expected message type 'participants_count', got %q", updateResp.Type)
	}
	if updateResp.Participants != 1 {
		t.Errorf("expected 1 participant, got %d", updateResp.Participants)
	}
}

func TestWebSocketFileChunk(t *testing.T) {
	server := newTestServer()
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws"

	hostConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("host WebSocket dial error: %v", err)
	}
	defer hostConn.Close()

	if err := hostConn.WriteJSON(websockets.Message{Type: "create"}); err != nil {
		t.Fatalf("host write error: %v", err)
	}

	var createResp websockets.Message
	if err := hostConn.ReadJSON(&createResp); err != nil {
		t.Fatalf("host read error: %v", err)
	}
	roomID := createResp.RoomID

	clientConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("client WebSocket dial error: %v", err)
	}
	defer clientConn.Close()

	joinMsg := websockets.Message{Type: "join", RoomID: roomID}
	if err := clientConn.WriteJSON(joinMsg); err != nil {
		t.Fatalf("client write join error: %v", err)
	}

	var dummy websockets.Message
	_ = hostConn.ReadJSON(&dummy)

	fileData := []byte("this is a test file chunk")
	encodedData := base64.RawURLEncoding.EncodeToString(fileData)

	fileChunkMsg := websockets.Message{
		Type:         "file_chunk",
		RoomID:       roomID,
		FileData:     encodedData,
		FileName:     "test.txt",
		FileType:     "text/plain",
		FileSize:     len(fileData),
		ChunkIndex:   1,
		TotalChunks:  1,
		IsLastChunk:  true,
		IsFirstChunk: true,
	}

	if err := hostConn.WriteJSON(fileChunkMsg); err != nil {
		t.Fatalf("host write file_chunk error: %v", err)
	}

	clientConn.SetReadDeadline(time.Now().Add(2 * time.Second))
	var fileResp websockets.Message
	if err := clientConn.ReadJSON(&fileResp); err != nil {
		t.Fatalf("client read error (file_chunk): %v", err)
	}

	receivedData, err := base64.RawURLEncoding.DecodeString(fileResp.FileData)
	if err != nil {
		t.Fatalf("error decoding received file data: %v", err)
	}
	if string(receivedData) != string(fileData) {
		t.Errorf("expected file data %q, got %q", fileData, receivedData)
	}
}
