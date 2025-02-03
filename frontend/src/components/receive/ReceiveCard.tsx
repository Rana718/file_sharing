import { motion } from 'framer-motion'
import { FiDownload, FiFile } from 'react-icons/fi'
import ProgressBar from './ProgressBar'
import { formatFileSize } from '@/utils'


interface ReceiveCardProps {
    transferStatus: 'waiting' | 'receiving' | 'completed' | 'error';
    fileName: string;
    fileSize: number;
    progress: number;
    receivedChunks: number;
    totalChunks: number;
    receivedFile: string | null;
    isRoomJoined: boolean;
    error: string;
    roomID: string[];
}


function ReceiveCard({ transferStatus, fileName, fileSize, progress, receivedChunks, totalChunks, receivedFile, isRoomJoined, error, roomID }: ReceiveCardProps) {

    return (
        <motion.div
            layout
            className="bg-[#FFD700]/5 rounded-xl border border-[#FFD700]/10 p-8"
        >
            {isRoomJoined && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 bg-[#FFD700]/10 p-4 rounded-lg backdrop-blur-md"
                >
                    <p className="text-[#FFD700]">Room ID: {roomID.join('')}</p>
                    <p className="text-sm text-[#D9D9D9]/60">Connected</p>
                </motion.div>
            )}

            {transferStatus === 'waiting' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <FiFile className="w-16 h-16 mx-auto text-[#FFD700]/50" />
                    <p className="text-xl font-medium bg-gradient-to-r from-[#FFD700] to-[#A020F0] bg-clip-text text-transparent">
                        Waiting for files...
                    </p>
                    <p className="text-[#D9D9D9]/60">Sender will send files shortly</p>
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border-4 border-[#A020F0]/20 border-t-[#A020F0] rounded-full"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-4 h-4 bg-[#FFD700] rounded-full" />
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {transferStatus === 'receiving' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Receiving: {fileName}</h3>
                        <p>{Math.round(progress)}%</p>
                    </div>
                    <ProgressBar progress={progress} />
                    <p className="text-sm text-center text-[#D9D9D9]/60">
                        Received {receivedChunks} of {totalChunks} chunks
                    </p>
                </motion.div>
            )}

            {transferStatus === 'completed' && receivedFile && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-[#FFD700]/20 
                             rounded-full mx-auto flex items-center justify-center backdrop-blur-sm"
                    >
                        <FiDownload className="w-10 h-10 text-[#FFD700]" />
                    </motion.div>

                    <div className="bg-[#1A1A1A]/40 rounded-xl p-6 backdrop-blur-sm border border-[#FFD700]/10">
                        <div className="flex items-center gap-4 mb-4">
                            <FiFile className="w-12 h-12 text-[#FFD700]" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-xl text-[#FFD700]">{fileName}</h3>
                                <p className="text-[#D9D9D9]/60">
                                    {formatFileSize(fileSize)}
                                </p>
                            </div>
                        </div>

                        <motion.a
                            href={receivedFile}
                            download={fileName}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r 
                                 from-[#A020F0] to-[#8010C0] text-white px-6 py-4 rounded-lg font-semibold 
                                 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 
                                 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload className="w-5 h-5" />
                            Download File
                        </motion.a>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-[#D9D9D9]/60"
                    >
                        File received successfully! Click the button above to download.
                    </motion.p>
                </motion.div>
            )}
        </motion.div>
    )
}

export default ReceiveCard
