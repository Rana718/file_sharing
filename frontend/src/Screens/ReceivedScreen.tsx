import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { base64ToUint8Array } from '@/utils/encoding';
import InputBox from '@/components/receive/InputBox';
import ReceiveCard from '@/components/receive/ReceiveCard';


function ReceivedScreen() {
    const [roomID, setRoomID] = useState(['', '', '', '', '', '']);
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState("");
    const [receivedFile, setReceivedFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileSize, setFileSize] = useState(0);
    const [connecting, setConnecting] = useState(false);
    const navigate = useNavigate();
    const receivedChunksRef = useRef<Uint8Array[]>([]);
    const [progress, setProgress] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [receivedChunks, setReceivedChunks] = useState(0);
    const [transferStatus, setTransferStatus] = useState<'waiting' | 'receiving' | 'completed' | 'error'>('waiting');

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "error") {
                    handleError("Failed to join room. Please try again.");
                    setIsRoomJoined(false);
                    alert("Failed to join room. Please try again.");
                    setRoomID(['', '', '', '', '', '']);
                    return;
                }

                if (data.type === "file_chunk") {

                    if (data.isFirstChunk) {
                        setFileName(data.fileName);
                        setFileSize(data.fileSize);
                        setTotalChunks(data.totalChunks);
                        setReceivedChunks(0);
                        setTransferStatus('receiving');
                        receivedChunksRef.current = [];
                    }

                    const chunkArray = base64ToUint8Array(data.fileData);
                    receivedChunksRef.current.push(chunkArray);
                    setReceivedChunks(prev => prev + 1);
                    setProgress((receivedChunksRef.current.length / data.totalChunks) * 100);

                    if (data.isLastChunk) {
                        const completeFile = new Blob(receivedChunksRef.current, {
                            type: data.fileType
                        });
                        setReceivedFile(URL.createObjectURL(completeFile));
                        setTransferStatus('completed');
                    }

                } else if (data.type === "room_closed") {
                    alert("Host has disconnected. Room closed.");
                    receivedChunksRef.current = [];
                    setSocket(null);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected");
                setConnecting(false);
            };
        }
    }, [socket]);

    const ConnectWebSocket = () => {
        return new Promise<WebSocket>((resolve, reject) => {
            const ws = new WebSocket(import.meta.env.VITE_SERVER_URL);

            ws.onopen = () => {
                setError("");
                console.log("Connected to WebSocket");
                setSocket(ws);
                resolve(ws);
            };

            ws.onerror = (error) => {
                handleError("Failed to connect to server. Please try again.");
                reject(error);
            };
        });
    };

    const handleError = (message: string) => {
        setError(message);
        if (socket) socket.close();
        setSocket(null);
        setConnecting(false);
    };

    const resetRoom = () => {
        setError("");
        setIsRoomJoined(false);
        setRoomID(['', '', '', '', '', '']);
        setReceivedFile(null);
        setFileName("");
        inputRefs.current[0]?.focus();
    };

    const handleJoinRoom = () => {
        const roomCode = roomID.join('');
        if (roomCode.length === 6) {
            setConnecting(true);
            setError("");
            setIsRoomJoined(true);
            joinRoom(roomCode);
        }
    };

    const joinRoom = async (roomCode: string) => {
        try {
            const ws = await ConnectWebSocket();
            ws.send(JSON.stringify({ type: "join", roomId: roomCode }));
        } catch (error) {
            console.error("Failed to join room:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0E0E0E] to-[#1a1a1a] text-[#D9D9D9] p-6 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full filter blur-3xl animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto relative backdrop-blur-sm"
            >
                <motion.button
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#FFD700] hover:text-[#B8860B] mb-8 transition-all duration-300"
                >
                    <FiArrowLeft className="animate-pulse" /> Back to Home
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#A020F0] bg-clip-text text-transparent">
                        Receive Files
                    </h1>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#3E0000] text-[#FF0000] p-4 rounded-lg mb-6"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <span>{error}</span>
                            <button
                                onClick={resetRoom}
                                className="bg-[#FF0000]/20 hover:bg-[#FF0000]/30 text-[#FF0000] 
                                         px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FiRefreshCw /> Try Again
                            </button>
                        </div>
                    </motion.div>
                )}

                {!isRoomJoined || error ? (
                    <InputBox roomID={roomID} connecting={connecting} handleJoinRoom={handleJoinRoom} setRoomID={setRoomID} inputRefs={inputRefs} />
                ) : (
                    <ReceiveCard receivedFile={receivedFile} fileName={fileName} fileSize={fileSize} progress={progress} totalChunks={totalChunks} receivedChunks={receivedChunks} transferStatus={transferStatus} isRoomJoined={isRoomJoined} error={error} roomID={roomID} />
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center text-[#D9D9D9]/60"
            >
                <p>Keep this tab open while waiting for files</p>
                <p className="text-sm mt-2">Files are transferred securely peer-to-peer</p>
            </motion.div>
        </div>
    );
}

export default ReceivedScreen;