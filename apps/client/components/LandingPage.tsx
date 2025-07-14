"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Edit3, Sparkles, Zap, Palette, Loader2, ChevronDown, Star, Play, Bot } from "lucide-react"
import { motion, easeOut, useScroll, useTransform } from "motion/react"
import { FeatureCard } from "../components/FeatureCard"
import { useAuthStore } from "@/stores/authStore/authStore"
import { redirect, useRouter } from "next/navigation"
import { createPortal } from "react-dom"

const MeshGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-cyan-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  )
}

const BackgroundGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

const FloatingShapes = () => {
  return (
    <>
      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-6 h-6 border-2 border-emerald-300/30 rotate-45"
        animate={{
          rotate: [45, 135, 45],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-32 w-8 h-8 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-lg"
        animate={{
          rotate: [0, 180, 360],
          y: [-15, 15, -15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Floating Icons */}
      <motion.div 
        className="absolute top-32 left-1/4 text-emerald-400/10" 
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Palette size={48} />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-20 text-teal-400/10"
        animate={{
          y: [-15, 15, -15],
          x: [-5, 5, -5],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        <Edit3 size={36} />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-16 text-cyan-400/10"
        animate={{
          y: [-12, 12, -12],
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        <Users size={42} />
      </motion.div>

      {/* Sparkle Effects */}
      <motion.div 
        className="absolute top-24 right-1/4 text-emerald-400/40" 
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 1, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={20} />
      </motion.div>

      <motion.div
        className="absolute bottom-40 right-1/3 text-teal-400/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
          y: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <Zap size={16} />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-12 text-emerald-300/30"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      >
        <Star size={14} />
      </motion.div>
    </>
  )
}

const ScrollIndicator = () => {
  return (
    <motion.div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-emerald-300/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="text-sm font-light mb-2 tracking-wide">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={20} />
      </motion.div>
    </motion.div>
  )
}

type TypewriterTextProps = {
  text: string;
  delay?: number;
};

const TypewriterText = ({ text, delay = 0 }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }
    }, delay + currentIndex * 0.0000001)

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay])

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-emerald-400"
      >
        |
      </motion.span>
    </span>
  )
}

const LandingPage = () => {
  const { authUser, checkAuth, isLoggingOut } = useAuthStore()
  const router = useRouter()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authUser) {
      redirect("/home-page")
    }
  }, [authUser, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeOut,
      },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easeOut,
      },
    },
  }

  return (
    <>
      {isLoggingOut &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 flex flex-col items-center space-y-4">
              <Loader2 className="size-12 animate-spin text-emerald-400" />
              <p className="text-white font-medium">Signing out...</p>
            </div>
          </div>,
          document.body
        )
      }
      
      <div className="relative min-h-screen bg-neutral-900 bg-[radial-gradient(circle,_rgb(46,46,46)_0%,_rgb(5,5,5)_100%)] text-white overflow-hidden">
        {/* Background Elements */}
        <MeshGradient />
        <BackgroundGrid />
        <FloatingShapes />
        
        {/* Main Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <motion.div 
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
            style={{ y: y1 }}
          >
            <motion.main
              className="text-center max-w-7xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Hero Title */}
              <motion.div variants={itemVariants} className="mb-8">
                <motion.h1
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent tracking-tight leading-none"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  CollaboDraw
                </motion.h1>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "280px", opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                  className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto rounded-full shadow-lg shadow-emerald-500/50"
                />
              </motion.div>

              {/* Subtitle */}
              <motion.div variants={itemVariants} className="mb-12">
                <motion.p
                  className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light text-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                >
                  Collaborate Visually, <span className="text-emerald-400 font-medium">Instantly</span>
                </motion.p>
                <motion.p
                  className="text-lg md:text-xl mb-4 text-gray-300 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 1 }}
                >
                  <TypewriterText 
                    text="Draw, brainstorm, and create together in real time. Perfect for teams, friends, educators, and creators."
                    delay={100}
                  />
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-20" 
                variants={itemVariants}
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href="/signin"
                    className="group relative bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center min-w-[140px] focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <span className="relative z-10">Sign In</span>
                  </Link>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    href="/signup"
                    className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 inline-flex items-center justify-center min-w-[140px] focus:ring-4 focus:ring-emerald-500/20 focus:outline-none group"
                  >
                    <span className="mr-2">Get Started</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Play size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.main>
            
            <ScrollIndicator />
          </motion.div>

          {/* Feature Cards Section */}
          <motion.div 
            className="py-20 px-4 sm:px-6 lg:px-8"
            style={{ y: y2 }}
          >
            <motion.div 
              className="max-w-7xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
            >
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  Why Choose CollaboDraw?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Everything you need for seamless collaborative drawing
                </p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
              >
                <motion.div 
                  variants={featureVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <FeatureCard 
                    icon={<Bot size={32} />} 
                    title="AI Drawing Generator" 
                    className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:from-emerald-500/20 hover:to-teal-500/20"
                  >
                    Generate stunning artwork with AI-powered drawing tools and creative assistance.
                  </FeatureCard>
                </motion.div>

                <motion.div 
                  variants={featureVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <FeatureCard 
                    icon={<Users size={32} />} 
                    title="Create & Share Rooms" 
                    className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:from-emerald-500/20 hover:to-teal-500/20"
                  >
                    Start drawing rooms and share instantly with secure invite codes for seamless collaboration.
                  </FeatureCard>
                </motion.div>

                <motion.div 
                  variants={featureVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <FeatureCard 
                    icon={<Edit3 size={32} />} 
                    title="Draw Together" 
                    className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:from-emerald-500/20 hover:to-teal-500/20"
                  >
                    Collaborate in real-time with powerful drawing tools.
                  </FeatureCard>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Info Section */}
          <motion.div 
            className="py-20 pt-4 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-500/10"
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 25px 50px rgba(16, 185, 129, 0.15)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                    Powerful Features
                  </h3>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Everything you need for professional collaborative drawing
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-6">
                    {[
                      "AI Drawing Generator",
                      "Real-time collaboration",
                      "Versatile drawing tools",
                    ].map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-4 group"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-lg shadow-emerald-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                        <span className="text-gray-200 text-lg group-hover:text-white transition-colors duration-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    {[
                      "Secure room management",
                      "Cross-platform support",
                      "Intuitive interface",
                    ].map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-4 group"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full shadow-lg shadow-teal-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                        <span className="text-gray-200 text-lg group-hover:text-white transition-colors duration-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <motion.h4 
                  className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  CollaboDraw
                </motion.h4>
                <motion.p 
                  className="text-gray-400 mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Collaborate Visually, Instantly
                </motion.p>
                <motion.div 
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  © 2024 CollaboDraw. All rights reserved.
                </motion.div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

export default LandingPage