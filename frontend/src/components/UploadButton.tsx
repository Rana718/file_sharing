import { formatFileSize } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { FiUpload, FiX, FiFile, FiFolder, FiSend } from "react-icons/fi";

export interface SelectedEntry {
  name: string;
  size: number;
  relativePath: string;
}

interface UploadButtonProps {
  onSelectFiles: (files: FileList | null) => void;
  onSelectFolder: (files: FileList | null) => void;
  onStartTransfer: () => void;
  onClearSelection: () => void;
  selectedEntries: SelectedEntry[];
  isDisabled: boolean;
  isSending: boolean;
}

function UploadButton({
  onSelectFiles,
  onSelectFolder,
  onStartTransfer,
  onClearSelection,
  selectedEntries,
  isDisabled,
  isSending,
}: UploadButtonProps) {
  const filesInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const totalSize = selectedEntries.reduce((acc, file) => acc + file.size, 0);
  const canStartTransfer =
    !isDisabled && !isSending && selectedEntries.length > 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    selector: (files: FileList | null) => void,
  ) => {
    selector(e.target.files);
    e.target.value = "";
  };

  const isFolderEntry = (entry: SelectedEntry) => {
    return entry.relativePath.includes("/");
  };

  const openFilesPicker = () => {
    if (!isSending) {
      filesInputRef.current?.click();
    }
  };

  const openFolderPicker = () => {
    if (!isSending) {
      folderInputRef.current?.click();
    }
  };

  return (
    <div className="relative group">
      <input
        ref={filesInputRef}
        type="file"
        multiple
        onChange={(e) => handleInputChange(e, onSelectFiles)}
        className="hidden"
        disabled={isSending}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        onChange={(e) => handleInputChange(e, onSelectFolder)}
        className="hidden"
        disabled={isSending}
        {...({
          webkitdirectory: "",
          directory: "",
        } as React.InputHTMLAttributes<HTMLInputElement>)}
      />

      <AnimatePresence mode="wait">
        {selectedEntries.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-[rgba(179,71,245,0.5)] to-[rgba(153,50,204,0.5)] text-[#D9D9D9] p-6 rounded-lg
                        border-2 border-dashed border-[#FFD700]/30 group-hover:border-[#FFD700]/50 shadow-lg shadow-[#B347F5]/20 
                        backdrop-blur-sm transition-all duration-300 hover:from-[rgba(197,102,255,0.5)] hover:to-[rgba(170,92,228,0.5)]"
          >
            <motion.div
              className="flex items-start justify-between gap-4"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-full">
                <p className="font-semibold text-[#FFD700]">
                  {selectedEntries.length} item(s) ready •{" "}
                  {formatFileSize(totalSize)}
                </p>
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 peerdrop-scrollbar-hidden">
                  {selectedEntries.map((entry, index) => (
                    <div
                      key={`${entry.relativePath}-${index}`}
                      className="flex items-center justify-between rounded bg-[#0E0E0E]/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isFolderEntry(entry) ? (
                          <FiFolder className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                        ) : (
                          <FiFile className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                        )}
                        <span className="truncate text-sm text-[#D9D9D9]">
                          {entry.relativePath}
                        </span>
                      </div>
                      <span className="text-xs text-[#D9D9D9]/70 ml-3 flex-shrink-0">
                        {formatFileSize(entry.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={openFilesPicker}
                disabled={isSending}
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 text-sm hover:border-[#FFD700]/60 disabled:opacity-50"
              >
                Add Files
              </button>
              <button
                onClick={openFolderPicker}
                disabled={isSending}
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 text-sm hover:border-[#FFD700]/60 disabled:opacity-50"
              >
                Add Folder
              </button>
              <button
                onClick={onClearSelection}
                disabled={isSending}
                className="px-4 py-2 rounded-lg border border-[#FF8080]/40 text-sm text-[#FFB3B3] hover:border-[#FF8080] disabled:opacity-50 inline-flex items-center gap-2"
              >
                <FiX className="w-4 h-4" /> Clear
              </button>
              <button
                onClick={onStartTransfer}
                disabled={!canStartTransfer}
                className="ml-auto px-5 py-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0E0E0E] font-semibold disabled:opacity-50 inline-flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />{" "}
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: isSending ? 1 : 1.02 }}
            className={`
                            relative bg-gradient-to-br from-[rgba(179,71,245,0.5)] to-[rgba(153,50,204,0.5)] p-8 rounded-lg flex flex-col items-center gap-4 
                            border-2 border-dashed border-[#FFD700]/30 group-hover:border-[#FFD700]/50 shadow-lg shadow-[#B347F5]/20 backdrop-blur-sm
                            transition-all duration-300 overflow-hidden ${
                              isSending
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:from-[rgba(197,102,255,0.5)] hover:to-[rgba(170,92,228,0.5)] cursor-pointer"
                            }
                        `}
          >
            {!isSending && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent 
                                -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              />
            )}

            <motion.div
              animate={
                !isSending
                  ? {
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
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
                {isSending
                  ? "Transfer in progress..."
                  : "Choose files or folder"}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-[#D9D9D9]/75 mt-2"
              >
                {isDisabled
                  ? "You can select now; Send unlocks once a receiver joins"
                  : "Selection does not start transfer until you press Send"}
              </motion.p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-2 z-10">
              <button
                onClick={openFilesPicker}
                disabled={isSending}
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 text-sm hover:border-[#FFD700]/60 disabled:opacity-50"
              >
                Select Files
              </button>
              <button
                onClick={openFolderPicker}
                disabled={isSending}
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 text-sm hover:border-[#FFD700]/60 disabled:opacity-50"
              >
                Select Folder
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDisabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-[#FFD700] bg-[#FFD700]/10 p-3 rounded-lg border border-[#FFD700]/20 text-sm"
        >
          ⚠️ A receiver must join before Send is enabled
        </motion.div>
      )}
    </div>
  );
}

export default UploadButton;
