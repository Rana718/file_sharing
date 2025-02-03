import { motion } from 'framer-motion'


function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-gradient-to-t from-[#0E0E0E] to-transparent"
        >

            <motion.div
                className="max-w-7xl mx-auto py-6 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >

                <motion.div
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >

                    <motion.span
                        className="text-[#D9D9D9]/60"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        Made with
                    </motion.span>

                    <motion.span
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-red-500 mx-1"
                    >
                        ❤️
                    </motion.span>

                    <motion.span className="text-[#D9D9D9]/60">by</motion.span>

                    <motion.a
                        href="https://github.com/Rana718"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent relative group"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >

                        <span className="relative inline-block">
                            <p className='bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#f08b20] bg-clip-text text-transparent'>
                                Rana
                            </p>
                            <motion.span
                                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] transform scale-x-0 origin-left"
                                animate={{ scaleX: [0, 1, 0] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </span>

                    </motion.a>

                </motion.div>
            </motion.div>
        </motion.footer>
    )
}

export default Footer
