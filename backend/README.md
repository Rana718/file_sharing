# 🚀 PeerDrop Backend

Welcome to the backend of **PeerDrop** - the engine that powers real-time, peer-to-peer file sharing using WebSockets. This backend handles everything from room management to file transfer, ensuring a smooth and secure experience for users. 🔥💻

## 🛠️ Tech Stack

- **Go (Golang)** 🦫: A robust language for building efficient, high-performance server applications.
- **Gorilla WebSockets** 🔌: Provides real-time, full-duplex communication channels.
- **CORS Middleware** 🌐: Manages cross-origin requests to secure your API.
- **Docker** 🐳 (Optional): Simplifies deployment with containerization if you prefer using containers.

## 📜 System Architecture

### Room Management
- **Creation**: Automatically generates unique 6-digit room IDs to ensure quick and secure session creation. 🔢
- **Joining**: Validates room existence, seamlessly managing participants as they join. 👥
- **Cleanup**: Ensures automatic room closure and cleanup when the host disconnects, maintaining system integrity and resource efficiency. 🚪

### File Transfer Protocol
- **Chunk Transfer**: Uses Base64 encoding to safely transmit file chunks. 🔠
- **Real-Time Broadcasting**: Sends data instantly to all connected participants, ensuring everyone stays synchronized. 📡
- **Client Synchronization**: Automatically manages file reconstruction on the client side for a smooth transfer experience. 🔄


## 🚀 Getting Started

### Local Development

1. **Change Directory:** 🔽
   ```bash
   cd backend
   ```

2. **Install Dependencies** 📦
   ```bash
   go mod tidy
   ```

3. **Run the Server** ▶️
   ```bash
   go run main.go
   ```

### Docker Deployment

1. **Build the Image** 🏗️
   ```bash
   docker build -t peerdrop-backend .
   ```

2. **Run the Container** 🚀
   ```bash
   docker run -p 8080:8080 peerdrop-backend
   ```

## 🔥 API Endpoints

- **WebSocket**: `ws://localhost:8080/ws` 🌐
  - Handles room operations and file transfers
- **Health Check**: `http://localhost:8080/hello` ✅
  - Server status verification

## 🤝 Contributing

Contributions are welcome! For detailed guidelines, please see our [Contributing Guidelines](../README.md/#-contributing). Feel free to submit a Pull Request and help make this project even better! 🎉🚀
