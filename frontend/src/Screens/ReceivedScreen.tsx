import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiRefreshCw, FiArrowLeft, FiCheckCircle, FiFile } from 'react-icons/fi';
import { base64ToUint8Array } from '@/utils/encoding';
import { formatFileSize } from '@/utils';

function ReceivedScreen() {
    const { roomID } = useParams();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [receivedFile, setReceivedFile] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileType, setFileType] = useState<string>("");
    const [downloadStarted, setDownloadStarted] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const navigate = useNavigate();
    const receivedChunksRef = useRef([]);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "file_info") {
                    setFileName(data.fileName);
                    setFileType(data.fileType);
                    receivedChunksRef.current = [];
                } else if (data.type === "file_chunk") {
                    const chunkArray = base64ToUint8Array(data.fileData);
                    //@ts-expect-error
                    receivedChunksRef.current.push(chunkArray);

                    if (data.isLastChunk) {
                        const completeFile = new Blob(receivedChunksRef.current, { type: fileType });
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
            };
        }
    }, [socket]);

    useEffect(() => {
        joinRoom();
    }, []);

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
        setIsLoading(false);
        if (socket) socket.close();
        setSocket(null);
    };

    const joinRoom = async () => {
        try {
            const ws = await ConnectWebSocket();
            ws.send(JSON.stringify({ type: "join", roomId: roomID }));
        } catch (error) {
            console.error("Failed to join room:", error);
        }
    };

    const handleDownload = () => {
        if (!receivedFile) return;
        setDownloadStarted(true);
        setTimeout(() => setDownloadStarted(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0E0E0E] text-[#D9D9D9] p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto"
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#FFD700] hover:text-[#B8860B] mb-8 transition-colors"
                >
                    <FiArrowLeft /> Back to Home
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] to-[#A020F0] bg-clip-text text-transparent">
                        Receive Files
                    </h1>
                    <p className="text-lg text-[#D9D9D9]/80">
                        Room ID: <span className="font-mono text-[#FFD700]">{roomID}</span>
                    </p>
                </div>

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
                                onClick={joinRoom}
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
                                        {formatFileSize(receivedFile)}
                                    </p>
                                </div>
                            </div>

                            <motion.a
                                href={`data:${fileType};base64,${receivedFile}`}
                                download={fileName}
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 bg-[#A020F0] text-[#D9D9D9] px-6 py-3 
                                         rounded-lg font-semibold hover:bg-[#8010C0] transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {downloadStarted ? (
                                    <>
                                        <FiCheckCircle />
                                        Downloaded
                                    </>
                                ) : (
                                    <>
                                        <FiDownload />
                                        Download File
                                    </>
                                )}
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
            </motion.div>
        </div>
    );
}

export default ReceivedScreen;


