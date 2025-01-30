import { FormatFileSize } from '@/constant';
import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import { FiUpload, FiX, FiFile } from 'react-icons/fi'

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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ display: selectedFile ? 'none' : 'block' }}
            />
            <AnimatePresence>
                {selectedFile ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#A020F0] text-[#D9D9D9] p-6 rounded-lg
                                 border-2 border-dashed border-[#A020F0]/50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FiFile className="w-8 h-8 text-[#FFD700]" />
                                <div>
                                    <p className="font-semibold truncate max-w-[200px]">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm opacity-75">
                                        {FormatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDelete}
                                className="p-2 hover:bg-[#8010C0] rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#A020F0] text-[#D9D9D9] p-8 rounded-lg cursor-pointer
                                 flex flex-col items-center gap-4 border-2 border-dashed border-[#A020F0]/50"
                    >
                        <FiUpload className="w-8 h-8" />
                        <p className="font-semibold">Click or drag files to upload</p>
                        <p className="text-sm opacity-75">Share files of any size</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UploadButton;
