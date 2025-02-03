import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number;
}

function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="w-full h-4 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#FFD700] to-[#A020F0]"
            />
        </div>
    );
}

export default ProgressBar;
