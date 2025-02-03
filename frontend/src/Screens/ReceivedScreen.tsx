import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiRefreshCw, FiArrowLeft, FiFile } from 'react-icons/fi';
import { base64ToUint8Array } from '@/utils/encoding';
import { formatFileSize } from '@/utils';

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
                        receivedChunksRef.current = [];
                    }

                    const chunkArray = base64ToUint8Array(data.fileData);
                    receivedChunksRef.current.push(chunkArray);

                    if (data.isLastChunk) {
                        const completeFile = new Blob(receivedChunksRef.current, {
                            type: data.fileType
                        });
                        setReceivedFile(URL.createObjectURL(completeFile));
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

    const handleInputChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newRoomID = [...roomID];
            newRoomID[index] = value;
            setRoomID(newRoomID);
            if (value !== '' && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && roomID[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
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
            {/* Background effects */}
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
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-[#FFD700]/5 rounded-xl border border-[#FFD700]/20 p-8 backdrop-blur-md 
                        shadow-xl hover:border-[#FFD700]/30 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-medium"
                            >
                                Enter 6-digit Room Code
                            </motion.p>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-3 mb-6"
                            >
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <motion.input
                                        key={index}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={roomID[index]}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-14 h-14 text-center text-2xl font-bold bg-[#1A1A1A] border-2 
                                        border-[#FFD700]/30 rounded-lg focus:border-[#FFD700] focus:outline-none 
                                        text-[#FFD700] shadow-inner transition-all duration-300
                                        focus:shadow-[#FFD700]/20 focus:scale-110"
                                    />
                                ))}
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(160, 32, 240, 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleJoinRoom}
                                disabled={roomID.join('').length !== 6 || connecting}
                                className="bg-gradient-to-r from-[#A020F0] to-[#8010C0] text-white px-8 py-4 
                                rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 
                                disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
                            >
                                {connecting ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Join Room'
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-[#3E0000] text-[#FF0000] p-4 rounded-lg mb-6 flex items-center justify-between"
                                >
                                    <span>{error}</span>
                                    <button
                                        onClick={() => setError("")}
                                        className="text-[#FF0000] hover:text-[#FF0000]/80"
                                    >
                                        <FiRefreshCw className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="bg-[#FFD700]/5 rounded-xl border border-[#FFD700]/10 p-8">
                            {connecting && !receivedFile && !error ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="flex justify-center"
                                >
                                    <FiRefreshCw className="w-8 h-8 text-[#FFD700]" />
                                </motion.div>
                            ) : receivedFile ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-center gap-4">
                                        <FiFile className="w-12 h-12 text-[#FFD700]" />
                                        <div className="text-left">
                                            <h3 className="font-semibold text-xl">{fileName}</h3>
                                            <p className="text-[#D9D9D9]/60">
                                                {formatFileSize(fileSize)}
                                            </p>
                                        </div>
                                    </div>

                                    <motion.a
                                        href={receivedFile}
                                        download={fileName}
                                        className="inline-flex items-center gap-2 bg-[#A020F0] text-[#D9D9D9] px-6 py-3 
                                                 rounded-lg font-semibold hover:bg-[#8010C0] transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiDownload />
                                        Download File
                                    </motion.a>
                                </motion.div>
                            ) : (
                                <div className="text-center text-[#D9D9D9]/60">
                                    <FiFile className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Waiting to receive files...</p>
                                </div>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 text-center text-[#D9D9D9]/60"
                        >
                            <p>Keep this tab open while waiting for files</p>
                            <p className="text-sm mt-2">Files are transferred securely peer-to-peer</p>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default ReceivedScreen;


