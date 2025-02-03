import { Feature } from '@/constant';
import { motion } from 'framer-motion';
import { FiDownload, FiSend, FiGithub } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function HomeScreen() {
    const router = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0E0E0E] text-[#D9D9D9] relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0E0E0E] via-[#1a1a1a] to-[#0E0E0E] animate-gradient"></div>

            {/* Navigation */}
            <nav className="relative z-10 border-b border-[#FFD700]/10 px-8 py-4 backdrop-blur-sm bg-[#0E0E0E]/50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-[#FFD700]"
                    >
                        PeerDrop
                    </motion.h1>
                    <motion.a
                        href="https://github.com/Rana718/file_sharing"
                        target="_blank"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="text-[#FFD700] hover:text-[#B8860B] transition-colors"
                    >
                        <FiGithub size={24} />
                    </motion.a>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 py-16">
               
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-16"
                >
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#A020F0] bg-clip-text text-transparent"
                    >
                        Share Files Instantly
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl mb-12 text-[#D9D9D9]/90"
                    >
                        No limits. No sign-up. Just share.
                    </motion.p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router('/send')}
                            className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0E0E0E] rounded-lg font-semibold transition-all duration-300 shadow-lg"
                        >
                            <FiSend /> Send Files
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(160, 32, 240, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-[#A020F0] to-[#8010C0] text-[#D9D9D9] rounded-lg font-semibold transition-all duration-300 shadow-lg"
                            onClick={() => router('/receive')}
                        >
                            <FiDownload /> Receive Files
                        </motion.button>
                    </div>
                </motion.div>

                {/* Features Section */}
                <section className="features">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-4"
                    >
                        {Feature.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 0 25px rgba(255, 215, 0, 0.1)",
                                    backgroundColor: "rgba(255, 215, 0, 0.08)"
                                }}
                                className="p-8 rounded-xl border border-[#FFD700]/10 bg-[#FFD700]/5 backdrop-blur-sm transition-all duration-300 ease-in-out"
                            >
                                <h3 className="text-[#FFD700] text-2xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-[#D9D9D9]/80 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </main>
        </div>
    );
}

export default HomeScreen;
