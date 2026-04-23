import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { base64ToUint8Array } from "@/utils/encoding";
import InputBox from "@/components/receive/InputBox";
import ReceiveCard from "@/components/receive/ReceiveCard";
import { Helmet } from "react-helmet-async";
import {
  decryptChunk,
  generateEncryptionKeyHex,
  isValidEncryptionKeyHex,
} from "@/utils/crypto";
import { getWebSocketServerUrl } from "@/utils/websocket";

type StorageManagerWithDirectory = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandle>;
};

type TransferStorageMode = "opfs" | "memory";

type CurrentFileMeta = {
  fileName: string;
  relativePath: string;
  fileSize: number;
  fileType: string;
  isEncrypted: boolean;
};

function ReceivedScreen() {
  const location = useLocation();
  const [roomID, setRoomID] = useState(["", "", "", "", "", ""]);
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState("");
  const [receivedFile, setReceivedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [relativePath, setRelativePath] = useState<string>("");
  const [fileSize, setFileSize] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();
  const memoryChunksRef = useRef<ArrayBuffer[]>([]);
  const opfsWritableRef = useRef<FileSystemWritableFileStream | null>(null);
  const opfsFileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const transferModeRef = useRef<TransferStorageMode>("memory");
  const processingQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [progress, setProgress] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [receivedChunks, setReceivedChunks] = useState(0);
  const [receivedBytes, setReceivedBytes] = useState(0);
  const [transferStartedAt, setTransferStartedAt] = useState<number | null>(
    null,
  );
  const [isEncryptedTransfer, setIsEncryptedTransfer] = useState(false);
  const [transferStatus, setTransferStatus] = useState<
    "waiting" | "receiving" | "completed" | "error"
  >("waiting");
  const autoJoinAttemptedRef = useRef(false);

  const receiverSpeedBps = useMemo(() => {
    if (!transferStartedAt || receivedBytes <= 0) return 0;
    const elapsedSeconds = (Date.now() - transferStartedAt) / 1000;
    if (elapsedSeconds <= 0) return 0;
    return receivedBytes / elapsedSeconds;
  }, [receivedBytes, transferStartedAt]);

  const receiverEtaSeconds = useMemo(() => {
    if (
      transferStatus !== "receiving" ||
      fileSize <= 0 ||
      receiverSpeedBps <= 0 ||
      receivedBytes >= fileSize
    ) {
      return null;
    }

    return (fileSize - receivedBytes) / receiverSpeedBps;
  }, [transferStatus, fileSize, receiverSpeedBps, receivedBytes]);

  const searchParams = new URLSearchParams(location.search);
  const roomFromUrl = searchParams.get("room") || "";
  const secureKey = location.hash.replace(/^#/, "").trim().toLowerCase();
  const hasValidSecureKey = isValidEncryptionKeyHex(secureKey);
  const currentFileMetaRef = useRef<CurrentFileMeta>({
    fileName: "received-file",
    relativePath: "received-file",
    fileSize: 0,
    fileType: "application/octet-stream",
    isEncrypted: false,
  });

  const closeWriterIfOpen = async () => {
    if (!opfsWritableRef.current) return;
    try {
      await opfsWritableRef.current.close();
    } catch (_err) {
      // Ignore close errors during reset/disconnect.
    } finally {
      opfsWritableRef.current = null;
    }
  };

  const sanitizeFileName = (name: string) => {
    return name.replace(/[\\/:*?"<>|]/g, "_");
  };

  const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  };

  const initTransferStorage = async (
    incomingFileName: string,
    allowDiskStorage: boolean,
  ) => {
    transferModeRef.current = "memory";
    memoryChunksRef.current = [];
    opfsFileHandleRef.current = null;
    await closeWriterIfOpen();

    if (!allowDiskStorage) {
      return;
    }

    const storageManager = navigator.storage as StorageManagerWithDirectory;
    if (!storageManager.getDirectory) return;

    try {
      const root = await storageManager.getDirectory();
      const fileHandle = await root.getFileHandle(
        sanitizeFileName(incomingFileName),
        { create: true },
      );
      const writable = await fileHandle.createWritable({
        keepExistingData: false,
      });
      opfsFileHandleRef.current = fileHandle;
      opfsWritableRef.current = writable;
      transferModeRef.current = "opfs";
    } catch (_err) {
      transferModeRef.current = "memory";
    }
  };

  const finalizeTransfer = async (mimeType: string) => {
    if (transferModeRef.current === "opfs" && opfsFileHandleRef.current) {
      await closeWriterIfOpen();
      const fileFromDisk = await opfsFileHandleRef.current.getFile();
      return URL.createObjectURL(fileFromDisk);
    }

    const completeFile = new Blob(memoryChunksRef.current, { type: mimeType });
    return URL.createObjectURL(completeFile);
  };

  const handleIncomingChunk = async (data: any) => {
    if (data.isFirstChunk) {
      if (receivedFile) {
        URL.revokeObjectURL(receivedFile);
      }

      setReceivedFile(null);
      setFileName(data.fileName || "received-file");
      setRelativePath(data.relativePath || data.fileName || "received-file");
      setFileSize(data.fileSize || 0);
      currentFileMetaRef.current = {
        fileName: data.fileName || "received-file",
        relativePath: data.relativePath || data.fileName || "received-file",
        fileSize: data.fileSize || 0,
        fileType: data.fileType || "application/octet-stream",
        isEncrypted: !!data.isEncrypted,
      };
      setTotalChunks(data.totalChunks || 0);
      setReceivedChunks(0);
      setReceivedBytes(0);
      setTransferStartedAt(Date.now());
      setProgress(0);
      setIsEncryptedTransfer(currentFileMetaRef.current.isEncrypted);
      setTransferStatus("receiving");
      await initTransferStorage(
        currentFileMetaRef.current.fileName,
        !currentFileMetaRef.current.isEncrypted,
      );
    }

    const encryptedChunk = base64ToUint8Array(data.fileData);
    const chunkArray = currentFileMetaRef.current.isEncrypted
      ? await decryptChunk(encryptedChunk, secureKey)
      : encryptedChunk;
    const chunkBuffer = toArrayBuffer(chunkArray);

    if (transferModeRef.current === "opfs" && opfsWritableRef.current) {
      await opfsWritableRef.current.write(chunkBuffer);
    } else {
      memoryChunksRef.current.push(chunkBuffer);
    }

    setReceivedBytes((prev) => prev + chunkArray.byteLength);
    setReceivedChunks((prev) => prev + 1);
    setProgress(((data.chunkIndex + 1) / data.totalChunks) * 100);

    if (data.isLastChunk) {
      const fileUrl = await finalizeTransfer(
        currentFileMetaRef.current.fileType,
      );
      setReceivedFile(fileUrl);
      setFileName(currentFileMetaRef.current.fileName);
      setRelativePath(currentFileMetaRef.current.relativePath);
      setFileSize(currentFileMetaRef.current.fileSize);
      setTransferStatus("completed");
    }
  };

  const resetTransferState = async () => {
    await closeWriterIfOpen();
    memoryChunksRef.current = [];
    opfsFileHandleRef.current = null;
    transferModeRef.current = "memory";
  };

  useEffect(() => {
    if (autoJoinAttemptedRef.current) return;
    if (!/^\d{6}$/.test(roomFromUrl)) return;

    autoJoinAttemptedRef.current = true;
    const digits = roomFromUrl.split("").slice(0, 6);
    setRoomID(digits);
    setConnecting(true);
    setError("");
    setIsRoomJoined(true);
    void joinRoom(roomFromUrl);
  }, [roomFromUrl]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        processingQueueRef.current = processingQueueRef.current
          .then(async () => {
            if (data.type === "error") {
              handleError("Failed to join room. Please try again.");
              setIsRoomJoined(false);
              alert("Failed to join room. Please try again.");
              setRoomID(["", "", "", "", "", ""]);
              return;
            }

            if (data.type === "file_chunk") {
              if (data.isEncrypted && !hasValidSecureKey) {
                throw new Error("Missing decryption key in URL fragment");
              }
              await handleIncomingChunk(data);
              return;
            }

            if (data.type === "room_closed") {
              alert("Host has disconnected. Room closed.");
              await resetTransferState();
              setSocket(null);
            }
          })
          .catch(async () => {
            await resetTransferState();
            setTransferStatus("error");
            setError(
              "Transfer failed while processing file data. Please reconnect and try again.",
            );
          });
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setConnecting(false);
      };
    }

    return () => {
      if (receivedFile) {
        URL.revokeObjectURL(receivedFile);
      }
      void resetTransferState();
    };
  }, [socket]);

  const ConnectWebSocket = () => {
    return new Promise<WebSocket>((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(getWebSocketServerUrl());
      } catch (connectionError) {
        handleError(
          "WebSocket URL is not configured correctly. Check VITE_SERVER_URL.",
        );
        reject(connectionError);
        return;
      }

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
    void resetTransferState();
  };

  const resetRoom = () => {
    setError("");
    setIsRoomJoined(false);
    setRoomID(["", "", "", "", "", ""]);
    if (receivedFile) {
      URL.revokeObjectURL(receivedFile);
    }
    setReceivedFile(null);
    setFileName("");
    setRelativePath("");
    setProgress(0);
    setTotalChunks(0);
    setReceivedChunks(0);
    setReceivedBytes(0);
    setTransferStartedAt(null);
    setIsEncryptedTransfer(false);
    setTransferStatus("waiting");
    currentFileMetaRef.current = {
      fileName: "received-file",
      relativePath: "received-file",
      fileSize: 0,
      fileType: "application/octet-stream",
      isEncrypted: false,
    };
    void resetTransferState();
    inputRefs.current[0]?.focus();
  };

  const handleJoinRoom = () => {
    const roomCode = roomID.join("");
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

  const startUltraSecureRoom = () => {
    const newKey = generateEncryptionKeyHex();
    if (socket) {
      socket.close();
    }
    navigate(`/send?secure=1#${newKey}`);
  };

  return (
    <>
      <Helmet>
        <title>PeerDrop | Receive Files</title>
        <meta
          name="description"
          content="Receive files from a sender using a room code"
        />
        <link rel="canonical" href="/receive" />
      </Helmet>

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
            onClick={() => navigate("/")}
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
                  className="bg-[#FF0000]/20 hover:bg-[#FF0000]/30 text-[#FF0000] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiRefreshCw /> Try Again
                </button>
              </div>
            </motion.div>
          )}

          {!isRoomJoined || error ? (
            <div className="space-y-4">
              <InputBox
                roomID={roomID}
                connecting={connecting}
                handleJoinRoom={handleJoinRoom}
                setRoomID={setRoomID}
                inputRefs={inputRefs}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startUltraSecureRoom}
                className="w-full bg-gradient-to-r from-[#1A7F64] to-[#1F9D7A] text-white px-6 py-3 rounded-lg font-semibold"
              >
                Create New Secure Room
              </motion.button>
            </div>
          ) : (
            <ReceiveCard
              receivedFile={receivedFile}
              relativePath={relativePath}
              fileName={fileName}
              fileSize={fileSize}
              progress={progress}
              totalChunks={totalChunks}
              receivedChunks={receivedChunks}
              receivedBytes={receivedBytes}
              speedBytesPerSec={receiverSpeedBps}
              etaSeconds={receiverEtaSeconds}
              isEncrypted={isEncryptedTransfer}
              transferStatus={transferStatus}
              isRoomJoined={isRoomJoined}
              error={error}
              roomID={roomID}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-[#D9D9D9]/60"
        >
          <p>Keep this tab open while waiting for files</p>
          <p className="text-sm mt-2">
            Files are transferred in chunk-streaming mode to minimize RAM usage
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default ReceivedScreen;
