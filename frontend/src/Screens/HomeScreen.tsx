import { Feature } from '@/constant';
import { motion } from 'framer-motion';
import { FiSend, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function HomeScreen() {
    const router = useNavigate();

    return (
        <div className="min-h-screen bg-[#0E0E0E] text-[#D9D9D9]">
            <nav className="border-b border-[#FFD700]/10 px-8 py-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-[#FFD700]"
                >
                    PeerDrop
                </motion.h1>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] to-[#A020F0] bg-clip-text text-transparent">
                        Share Files Instantly
                    </h1>
                    <p className="text-xl mb-8">No limits. No sign-up. Just share.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router('/send')}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FFD700] text-[#0E0E0E] rounded-lg font-semibold hover:bg-[#B8860B] transition-colors"
                        >
                            <FiSend /> Send Files
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#A020F0] text-[#D9D9D9] rounded-lg font-semibold hover:bg-[#8010C0] transition-colors"
                        >
                            <FiDownload /> Receive Files
                        </motion.button>
                    </div>
                </motion.div>

                <section className="features">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4"
                    >
                        {Feature.map((feature, index) => (
                            <div key={index} className="p-6 rounded-xl border border-[#FFD700]/10 bg-[#FFD700]/5 hover:transform hover:-translate-y-1 transition-transform duration-300">
                                <h3 className="text-[#FFD700] text-xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-[#D9D9D9] leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </section>
            </main>
        </div>
    );
}

export default HomeScreen;
