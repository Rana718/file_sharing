
# 🚀 PeerDrop - Secure File Sharing Platform

PeerDrop is a modern, secure, and easy-to-use file sharing platform featuring real-time, peer-to-peer transfers with end-to-end encryption. Built to ensure your files are shared safely and swiftly, PeerDrop is split into two main parts: a **Frontend** built with React and TypeScript, and a **Backend** written in Go to power real-time communication via WebSockets. Enjoy a seamless experience whether you're sharing sensitive documents or your latest creative project! 🔒💻

---

## 📜 Table of Contents

- [Features](#✨-features)
- [Tech Stack](#🛠️-tech-stack)
- [Getting Started](#🚀-getting-started)
  - [Frontend Setup](#frontend-guide)
  - [Backend Setup](#backend-setup)
- [Project Workflow](#📜-project-workflow)
- [API Endpoints](#🔥-api-endpoints)
- [Contributing](#🤝-contributing)
- [License](#📄-license)

---

## ✨ Features

- **No Registration Required** 📝 – Start sharing files instantly without any sign-up hassle.
- **Unlimited File Size** 📦 – Share files of any size effortlessly.
- **No User Limits** 👥 – Connect with as many peers as you need.
- **End-to-End Encryption** 🔒 – Your privacy is our top priority.
- **Real-Time Transfers** ⚡ – Experience lightning-fast file transfers.
- **Direct P2P Connection** 🔗 – Files go directly from sender to receiver.
- **Multi-Device Support** 📱 – Use PeerDrop on desktop, mobile, and more.
- **Cross-Platform Compatible** 🖥️ – Enjoy a seamless experience on any operating system.

---

## 🛠️ Tech Stack

### Frontend
- **React** ⚛️
- **TypeScript** 📝
- **Tailwind CSS** 🎨
- **Vite** 🚀
- **Framer Motion** 🎞️
- **React Router DOM** 🔀

### Backend
- **Go (Golang)** 🦫
- **Gorilla WebSockets** 🔌
- **CORS Middleware** 🌐
- **Docker** 🐳 (Optional)

---

## 🚀 Getting Started

Get up and running in no time with our straightforward setup guides:

1. **Clone the Repository** 📥  
   ```bash
   git clone https://github.com/Rana718/file_sharing.git
   cd file_sharing
   ```

- For the **Frontend**, follow the [Frontend Guide](frontend/README.md/#-getting-started) to set up your development environment and start creating amazing user interfaces.
- For the **Backend**, check out our [Backend Setup](backend/README.md/#-getting-started) instructions to power up the server and handle real-time file transfers.

---

## 📜 Project Workflow

### 1. User Interaction Flow

- **Room Creation** 🏠  
  The host creates a room, and a unique 6-digit room ID is automatically generated. This ID is used to invite others to join the session.
  
- **Joining a Room** 👥  
  Clients can easily join an existing room using the room ID. The host is promptly notified when new participants join.
  
- **File Transfer** 📂  
  The host sends files in chunks (Base64 encoded), and these chunks are instantly broadcast to all connected clients, ensuring a real-time sharing experience.
  
- **Room Closure** 🚪  
  When the host disconnects, all clients receive a notification, and the room is gracefully closed.

### 2. Real-Time Communication

- **WebSockets** 🌐  
  Real-time data transfer is achieved using the WebSocket protocol. Our backend efficiently manages room creation, participant management, and file chunk broadcasting to ensure a smooth and synchronized experience for all users.

---

## 🔥 API Endpoints

- **WebSocket Endpoint**  
  `ws://localhost:8080/ws`  
  This endpoint is used for all room operations, including creation, joining, and file transfers.
  
- **Test Endpoint**  
  `http://localhost:8080/hello`  
  Use this endpoint to perform a quick health check and ensure that the backend server is up and running. It returns a JSON message confirming server connectivity.

---

## 🤝 Contributing

We love contributions! If you have ideas for improvements or new features, please consider helping us enhance PeerDrop:

1. **Fork the Repo** 🍴  
2. **Create a Feature Branch** 🌿  
   ```bash
   git checkout -b feature-branch
   ```
3. **Commit Your Changes** 📌  
   ```bash
   git commit -m "Add awesome feature"
   ```
4. **Push to Your Branch** 🚀  
   ```bash
   git push origin feature-branch
   ```
5. **Submit a Pull Request** 🔥


---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and share PeerDrop as you see fit! 📜📝

---

Happy coding and secure file sharing! 🎉🚀🔒
