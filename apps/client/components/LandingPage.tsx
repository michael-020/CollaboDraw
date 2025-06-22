"use client"
import { useEffect } from "react"
import Link from "next/link"
import { Users, Share2, Edit3, Sparkles, Zap, Palette } from "lucide-react"
import { motion, easeOut, easeInOut } from "motion/react"
import { FeatureCard } from "../components/FeatureCard"
import { useAuthStore } from "@/stores/authStore/authStore"
import { useRouter } from "next/navigation"

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

const LandingPage = () => {
  const { authUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (authUser) {
      router.replace("/home-page")
    } else {
      router.replace("/")
    }
  }, [authUser, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
      },
    },
  }

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
      },
    },
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-neutral-900 bg-[radial-gradient(circle,_rgb(46,46,46)_0%,_rgb(5,5,5)_100%)] text-white p-4 overflow-hidden">
      {/* Background Grid */}
      <BackgroundGrid />

      {/* Animated Background Elements */}
      <motion.div className="absolute top-20 left-20 text-emerald-400/20" variants={floatingVariants} animate="animate">
        <Palette size={60} />
      </motion.div>

      <motion.div
        className="absolute top-40 right-32 text-emerald-300/20"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      >
        <Edit3 size={40} />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-32 text-emerald-500/20"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
      >
        <Users size={50} />
      </motion.div>

      {/* Sparkle Effects */}
      <motion.div className="absolute top-32 right-20 text-emerald-400" variants={sparkleVariants} animate="animate">
        <Sparkles size={24} />
      </motion.div>

      <motion.div
        className="absolute bottom-40 right-40 text-emerald-300"
        variants={sparkleVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      >
        <Zap size={20} />
      </motion.div>

      <motion.main
        className="text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent"
            transition={{ type: "spring", stiffness: 300 }}
          >
            CollaboDraw
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1, delay: 1 }}
            className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 mx-auto rounded-full"
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div variants={itemVariants}>
          <motion.p
            className="text-xl md:text-2xl mb-4 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Collaborate Visually, <span className="text-emerald-400 font-semibold">Instantly</span>
          </motion.p>
          <motion.p
            className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Draw, brainstorm, and create together in real time. Perfect for teams, friends, educators, and creators.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div className="flex flex-row justify-center gap-4 mb-16" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signin"
              className="group relative bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-50 rounded-xl to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <span className="relative z-10">Sign In</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 hover:from-emerald-500 hover:to-emerald-600"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <FeatureCard icon={<Users size={28} />} title="Create Rooms" delay={0}>
              Start a drawing room and invite your friends to join instantly.
            </FeatureCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FeatureCard icon={<Share2 size={28} />} title="Share Instantly" delay={0.2}>
              Get an invite code to share with others for quick access.
            </FeatureCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FeatureCard icon={<Edit3 size={28} />} title="Draw Together" delay={0.4}>
              Collaborate in real-time and bring your ideas to life.
            </FeatureCard>
          </motion.div>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)",
            }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-emerald-300">Why Choose CollaboDraw?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Versatile drawing tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Secure room management</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Infinite canvas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Cross-platform support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-gray-300">Intuitive interface</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  )
}

export default LandingPage