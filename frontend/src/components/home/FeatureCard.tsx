import { Feature } from '@/constant'
import { motion } from 'framer-motion'
import React from 'react'

function FeatureCard() {
    return (
        <div className="features relative mb-32">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-4"
            >

                {Feature.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
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
        </div>
    )
}

export default React.memo(FeatureCard)
