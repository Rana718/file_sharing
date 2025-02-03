import { FormatFileSize } from '@/constant';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';

interface UploadButtonProps {
    SendFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadButton({ SendFile }: UploadButtonProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            SendFile(e);
        }
    };

    const handleDelete = () => {
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="relative group">
            <input
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{ display: selectedFile ? 'none' : 'block' }}
            />
            <AnimatePresence mode="wait">
                {selectedFile ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-br from-[rgba(179,71,245,0.5)] to-[rgba(153,50,204,0.5)] text-[#D9D9D9] p-6 rounded-lg
                                   border-2 border-dashed border-[#FFD700]/30 group-hover:border-[#FFD700]/50
                                   shadow-lg shadow-[#B347F5]/20 backdrop-blur-sm transition-all duration-300
                                   hover:from-[rgba(197,102,255,0.5)] hover:to-[rgba(170,92,228,0.5)]"
                    >
                        <motion.div
                            className="flex items-center justify-between"
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 10, 0] }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <FiFile className="w-8 h-8 text-[#FFD700]" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="font-semibold truncate max-w-[200px] text-[#FFD700]"
                                    >
                                        {selectedFile.name}
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-[#D9D9D9]/75"
                                    >
                                        {FormatFileSize(selectedFile.size)}
                                    </motion.p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDelete}
                                className="p-2 hover:bg-[#FFD700]/10 rounded-full transition-all duration-300
                                           hover:shadow-lg hover:shadow-[#FFD700]/20"
                            >
                                <FiX className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative bg-gradient-to-br from-[rgba(179,71,245,0.5)] to-[rgba(153,50,204,0.5)] p-8 rounded-lg cursor-pointer
                                   flex flex-col items-center gap-4 border-2 border-dashed border-[#FFD700]/30 
                                   group-hover:border-[#FFD700]/50 shadow-lg shadow-[#B347F5]/20 backdrop-blur-sm
                                   transition-all duration-300 overflow-hidden hover:from-[rgba(197,102,255,0.5)] hover:to-[rgba(170,92,228,0.5)]"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent
                                       -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                        />

                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <FiUpload className="w-10 h-10 text-[#FFD700]" />
                        </motion.div>

                        <div className="relative z-10">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="font-semibold text-lg"
                            >
                                Click or drag files to upload
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-sm text-[#D9D9D9]/75 mt-2"
                            >
                                Share files of any size
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UploadButton;
