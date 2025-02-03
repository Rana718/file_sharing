import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi';

interface InputBoxProps {
    roomID: string[];
    connecting: boolean;
    setRoomID: React.Dispatch<React.SetStateAction<string[]>>;
    handleJoinRoom: () => void;
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

function InputBox({ roomID, connecting, setRoomID, handleJoinRoom, inputRefs }: InputBoxProps) {

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


    return (
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
                            ref={(el) => inputRefs.current && (inputRefs.current[index] = el)}
                            type="text"
                            maxLength={1}
                            value={roomID[index]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            aria-label={`Room code digit ${index + 1}`}
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
    )
}

export default InputBox
