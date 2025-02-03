import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import { arrayBufferToBase64 } from '@/utils/encoding';
import { FileChunkMessage } from '@/types';
import { Lightbulb } from "lucide-react";

function SendScreen() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [roomId, setRoomId] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [participantsCount, setParticipantsCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const CHUNK_SIZE = 64 * 1024;


    useEffect(() => {
        setIsLoading(true);
        CreateRoom();
        return () => {
            if (socket) socket.close();
        };
    }, []);


    const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === "room_created") {
            setRoomId(data.roomId);
            setIsHost(true);
        } else if (data.type === "participants_count") {
            setParticipantsCount(data.Participants || 0);
        }
    };

    const handleError = (message: string) => {
        setError(message);
        setIsLoading(false);
        if (socket) socket.close();
        setSocket(null);
        setRoomId("");
    };

    const ConnectWebSocket = () => {
        return new Promise<WebSocket>((resolve, reject) => {
            const ws = new WebSocket(import.meta.env.VITE_SERVER_URL);
            ws.onopen = () => {
                setError("");
                console.log("Connected to WebSocket");
                setSocket(ws);
                ws.onmessage = handleMessage;
                resolve(ws);
            };

            ws.onerror = (error) => {
                handleError("Failed to connect to server. Please try again.");
                reject(error);
            };
        });
    };

    const CreateRoom = async () => {
        setIsLoading(true);
        try {
            const ws = await ConnectWebSocket();
            ws.send(JSON.stringify({ type: "create" }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const SendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket) return;

        setError("");

        const reader = new FileReader();
        let offset = 0;
        let chunkIndex = 0;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            try {
                const chunk = e.target?.result as ArrayBuffer;
                const base64Chunk = arrayBufferToBase64(chunk);
                const isLastChunk = offset + chunk.byteLength >= file.size;

                const message: FileChunkMessage = {
                    type: "file_chunk",
                    roomId,
                    fileData: base64Chunk,
                    chunkIndex: chunkIndex,
                    totalChunks: totalChunks,
                    isLastChunk: isLastChunk,
                };

                if (chunkIndex === 0) {
                    message.fileName = file.name;
                    message.fileType = file.type;
                    message.fileSize = file.size;
                    message.isFirstChunk = true;
                }

                socket.send(JSON.stringify(message));

                offset += chunk.byteLength;
                chunkIndex++;
                if (!isLastChunk) {
                    readNextChunk();
                }
            } catch (err) {
                setError("Failed to process file. Please try again.");
            }
        };
        readNextChunk();
    };

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError("Failed to copy room ID");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0E0E0E] via-[#151515] to-[#1a1a1a] text-[#D9D9D9] p-6 relative overflow-hidden">
           
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#FFD700]/5 rounded-full filter blur-3xl animate-pulse delay-500" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl mx-auto text-center relative backdrop-blur-sm"
            >
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#A020F0] bg-clip-text text-transparent"
                >
                    Send Files Securely
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl mb-8 text-[#D9D9D9]/80"
                >
                    Create a room and share the room ID with the recipient to start sharing files.
                </motion.p>

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


                {!roomId ? (
                    <motion.button
                        whileHover={{ 
                            scale: 1.05, 
                            boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
                            textShadow: "0 0 10px rgba(255, 215, 0, 0.5)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        disabled={isLoading}
                        onClick={CreateRoom}
                        className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0E0E0E] 
                        px-8 py-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 
                        disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg
                        hover:bg-gradient-to-r hover:from-[#FFA500] hover:via-[#FFD700] hover:to-[#FFA500]"
                    >
                        {isLoading ? (
                            <FiRefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Create Room</>
                        )}
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6 p-8 bg-gradient-to-br from-[#FFD700]/10 to-transparent rounded-xl 
                        border border-[#FFD700]/20 backdrop-blur-md shadow-2xl hover:border-[#FFD700]/30 
                        transition-all duration-300"
                    >
                        <div className="space-y-3">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-medium"
                            >
                                Room ID:
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <code className="bg-[#0E0E0E]/80 px-6 py-3 rounded-lg font-mono text-[#FFD700] text-lg shadow-inner">
                                    {roomId}
                                </code>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={copyRoomId}
                                    className="text-[#FFD700] hover:text-[#FFA500] p-2 transition-colors duration-300"
                                >
                                    <FiCopy className="w-6 h-6" />
                                </motion.button>
                            </motion.div>
                            {copied && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm text-[#FFD700]"
                                >
                                    Copied to clipboard!
                                </motion.p>
                            )}
                        </div>

                        {isHost && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <UploadButton SendFile={SendFile} />
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg"
                                >
                                    Participants: {" "}
                                    <span className="font-bold text-[#FFD700]">{participantsCount}</span>
                                </motion.p>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-sm text-[#D9D9D9]/90 bg-gradient-to-r from-[#FFD700]/5 to-transparent p-5 rounded-lg 
                            border border-[#FFD700]/20 flex items-start gap-3 hover:border-[#FFD700]/30 transition-all duration-300"
                        >
                            <Lightbulb className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                            <p className="text-left leading-relaxed">
                                <span className="text-[#FFD700] font-medium">Note:</span>{' '}
                                Peer-to-peer transfer! Data isn't stored on the backend. Ensure the receiver joins the room before sharing the file.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default SendScreen;
