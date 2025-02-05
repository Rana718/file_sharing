import { AnimatePresence, motion } from 'framer-motion'
import { FiGithub, FiHome, FiSend, FiDownload, FiMenu, FiX } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: <FiHome className="w-5 h-5" /> },
        { path: '/send', label: 'Send', icon: <FiSend className="w-5 h-5" /> },
        { path: '/receive', label: 'Receive', icon: <FiDownload className="w-5 h-5" /> },
    ];

    return (
        <div className="sticky top-0 z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#1a1a1a] to-[#0E0E0E] opacity-95"></div>

            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative border-b border-[#FFD700]/10 px-4 sm:px-8 py-4 backdrop-blur-md shadow-lg"
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.05 }}
                                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] 
                                bg-clip-text text-transparent hover:from-[#FFA500] hover:to-[#FFD700] transition-all duration-300"
                            >
                                PeerDrop
                            </motion.h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <motion.div
                            className="hidden md:flex items-center gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative group"
                                >
                                    <span className="flex items-center gap-2 text-[#D9D9D9] hover:text-[#FFD700] transition-colors">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                    {location.pathname === item.path && (
                                        <motion.div
                                            layoutId="underline"
                                            className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700]"
                                            initial={false}
                                        />
                                    )}
                                </Link>
                            ))}
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-4">

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", delay: 0.3 }}
                            className="relative group"
                        >
                            <motion.a
                                href="https://github.com/Rana718/file_sharing"
                                target="_blank"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFD700]/10 to-transparent 
                                hover:from-[#FFD700]/20 text-[#FFD700] transition-all duration-300"
                            >
                                <FiGithub size={20} />
                                <span className="hidden sm:inline">GitHub</span>
                            </motion.a>
                        </motion.div>


                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-[#FFD700] p-2"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden absolute left-0 right-0 top-full bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#FFD700]/10"
                        >
                            <div className="py-4 px-6 flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                    >
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 p-2 rounded-lg transition-colors
                                                ${location.pathname === item.path
                                                ? 'text-[#FFD700] bg-[#FFD700]/10'
                                                : 'text-[#D9D9D9] hover:text-[#FFD700]'}
                                            `}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </div>
    )
}

export default Navbar
