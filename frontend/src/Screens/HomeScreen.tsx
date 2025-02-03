import { motion, useScroll, useTransform } from 'framer-motion';
import { FiDownload, FiSend, } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import FeatureCard from '@/components/home/FeatureCard';
import Footer from '@/components/home/Footer';
import { Icons } from '@/constant';

function HomeScreen() {
    const router = useNavigate();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    const floatingAnimation = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div ref={targetRef} className="min-h-screen bg-[#0E0E0E] text-[#D9D9D9] relative overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-[#0E0E0E] via-[#1a1a1a] to-[#0E0E0E] animate-gradient"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/5 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#A020F0]/5 rounded-full filter blur-3xl animate-pulse delay-700"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
                <motion.div style={{ opacity, scale }} className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <h2 className="text-[#FFD700] text-xl mb-4">SECURE FILE SHARING</h2>
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#A020F0] bg-clip-text text-transparent"
                        >
                            Share Files Instantly
                        </motion.h1>
                        <motion.p
                            className="text-xl md:text-2xl mb-6 text-[#D9D9D9]/90"
                        >
                            No limits. No sign-up. Just share.
                        </motion.p>
                        <motion.p className="text-lg text-[#D9D9D9]/70 max-w-2xl mx-auto">
                            Experience lightning-fast peer-to-peer file sharing with end-to-end encryption.
                            Your files never touch our servers, ensuring complete privacy.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={floatingAnimation}
                        animate="animate"
                        className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                    >
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router('/send')}
                            className="group flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r 
                                     from-[#FFD700] to-[#FFA500] text-[#0E0E0E] rounded-lg font-semibold 
                                     transition-all duration-300 shadow-lg relative overflow-hidden"
                        >
                            <FiSend className="group-hover:rotate-12 transition-transform duration-300" />
                            Send Files
                            <span className="absolute inset-0 bg-white/20 transform -translate-x-full 
                                         group-hover:translate-x-full transition-transform duration-700"></span>
                        </motion.button>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(160, 32, 240, 0.3)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router('/receive')}
                            className="group flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r 
                                     from-[#A020F0] to-[#8010C0] text-[#D9D9D9] rounded-lg font-semibold 
                                     transition-all duration-300 shadow-lg relative overflow-hidden"
                        >
                            <FiDownload className="group-hover:-translate-y-1 transition-transform duration-300" />
                            Receive Files
                            <span className="absolute inset-0 bg-white/10 transform -translate-x-full 
                                         group-hover:translate-x-full transition-transform duration-700"></span>
                        </motion.button>
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto"
                    >
                        {Icons.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="flex flex-col items-center gap-2 p-4 text-[#FFD700]"
                            >
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <div className="text-sm text-[#D9D9D9]">{item.text}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                
                <FeatureCard/>
                <Footer/>

            </div>
        </div>
    );
}

export default HomeScreen;
