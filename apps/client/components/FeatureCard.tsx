"use client"
import type React from "react"
import { motion } from "motion/react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  delay?: number
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, children, delay = 0 }) => {
  return (
    <motion.div
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-300 hover:border-emerald-500/50 overflow-hidden"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: { duration: 0.2 },
      }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent)",
          filter: "blur(1px)",
        }}
        initial={false}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-6 mx-auto group-hover:shadow-lg group-hover:shadow-emerald-500/25"
          whileHover={{
            rotate: [0, -10, 10, 0],
            scale: 1.1,
          }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-white"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-xl font-bold mb-4 text-white group-hover:text-emerald-300 transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
        >
          {children}
        </motion.p>
      </div>

      {/* Floating particles effect */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"
        animate={{
          y: [0, -10, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          delay: delay,
        }}
      />
      <motion.div
        className="absolute bottom-4 left-4 w-1 h-1 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100"
        animate={{
          y: [0, -8, 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          delay: delay + 0.5,
        }}
      />
    </motion.div>
  )
}
