import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiCopy } from 'react-icons/fi';
import UploadButton from '@/components/UploadButton';
import { arrayBufferToBase64 } from '@/utils/encoding';

function SendScreen() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [roomId, setRoomId] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const CHUNK_SIZE = 64 * 1024;

    useEffect(() => {
        setIsLoading(true);
        try {
            CreateRoom();
        } catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
        return () => {
            if (socket) socket.close();
        };
    }, []);

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
                resolve(ws);
            };

            ws.onerror = (error) => {
                handleError("Failed to connect to server. Please try again.");
                reject(error);
            };
        });
    }

    const CreateRoom = async () => {
        setIsLoading(true);
        try {
            const ws = await ConnectWebSocket();
            ws.send(JSON.stringify({ type: "create" }));
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "room_created") {
                    setRoomId(data.roomId);
                    setIsHost(true);
                }
            }
        } catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }

    const SendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files?.[0];

        if (!files || !socket) return;

        setError("");

        socket.send(
            JSON.stringify({
                type: "file_info",
                roomId,
                fileName: files.name,
                fileType: files.type,
            })
        );

        const reader = new FileReader();
        let offset = 0;

        reader.onload = (e) => {
            try {
                const chunk = e.target?.result as ArrayBuffer;
                const base64Chunk = arrayBufferToBase64(chunk);
                const isLastChunk = offset + chunk.byteLength >= files.size;

                socket.send(
                    JSON.stringify({
                        type: "file_chunk",
                        roomId,
                        fileData: base64Chunk,
                        isLastChunk,
                    })
                );

                offset += chunk.byteLength;
                if (!isLastChunk) {
                    readNextChunk();
                }
            } catch (err) {
                setError("Failed to process file. Please try again.");
            }
        };
        const readNextChunk = () => {
            const slice = files.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
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
        <div className="min-h-screen bg-[#0E0E0E] text-[#D9D9D9] p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center"
            >
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-[#A020F0] bg-clip-text text-transparent">
                    Send Files Securely
                </h1>
                <p className="text-lg mb-8 text-[#D9D9D9]/80">
                    Create a room and share the room ID with the recipient to start sharing files.
                </p>

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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                        onClick={CreateRoom}
                        className="bg-[#FFD700] text-[#0E0E0E] px-8 py-4 rounded-lg font-semibold 
                     hover:bg-[#B8860B] transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        {isLoading ? (
                            <FiRefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Create Room</>
                        )}
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 p-6 bg-[#FFD700]/5 rounded-xl border border-[#FFD700]/10"
                    >
                        <div className="space-y-2">
                            <p className="text-lg">Room ID:</p>
                            <div className="flex items-center justify-center gap-2">
                                <code className="bg-[#0E0E0E] px-4 py-2 rounded-lg font-mono text-[#FFD700]">
                                    {roomId}
                                </code>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={copyRoomId}
                                    className="text-[#FFD700] hover:text-[#B8860B] p-2"
                                >
                                    <FiCopy className="w-5 h-5" />
                                </motion.button>
                            </div>
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
                            <UploadButton SendFile={SendFile} />
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default SendScreen;
