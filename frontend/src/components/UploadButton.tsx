import { motion } from 'framer-motion'
import React from 'react'
import { FiUpload } from 'react-icons/fi'


interface UploadButtonProps {
    SendFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadButton({ SendFile }: UploadButtonProps) {
    return (
        <div className="relative group">
            <input
                type="file"
                onChange={SendFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#A020F0] text-[#D9D9D9] p-8 rounded-lg cursor-pointer
                           flex flex-col items-center gap-4 border-2 border-dashed border-[#A020F0]/50"
            >
                <FiUpload className="w-8 h-8" />
                <p className="font-semibold">Click or drag files to upload</p>
                <p className="text-sm opacity-75">Share files of any size</p>
            </motion.div>
        </div>
    )
}

export default UploadButton
