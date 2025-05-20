"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Github, Code, Star, GitBranch } from "lucide-react"

export default function OpenSourceSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }

  return (
    <motion.section
      className="py-24 w-full relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Floating icons */}
        <motion.div 
          className="absolute -left-4 lg:left-10 top-20"
          variants={floatingIconVariants}
          animate="animate"
        >
          <Code className="w-10 h-10 text-blue-400/40 dark:text-blue-400/20" />
        </motion.div>
        
        <motion.div 
          className="absolute right-10 lg:right-20 bottom-20"
          variants={floatingIconVariants}
          animate="animate"
        >
          <GitBranch className="w-12 h-12 text-cyan-400/40 dark:text-cyan-400/20" />
        </motion.div>
        
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium text-sm"
            variants={pulseVariants}
            animate="pulse"
          >
            <Github className="w-4 h-4 mr-2" />
            Open Source Project
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 animate-gradient-x">
              Proudly Open Sourced!
            </span>
          </h2>
        </motion.div>
        
        {/* Description */}
        <motion.p
          className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto text-center leading-relaxed"
          variants={itemVariants}
        >
          Source code is available on GitHub – feel free to read, review, or contribute to this project and make it even better!
        </motion.p>
        
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 max-w-lg mx-auto mt-12 gap-4"
          variants={itemVariants}
        >
          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <Star className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="text-lg font-bold mt-2 text-center">500+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Stars</p>
          </div>
          
          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <GitBranch className="w-6 h-6 text-indigo-500 mx-auto" />
            <p className="text-lg font-bold mt-2 text-center">120+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Forks</p>
          </div>
          
          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <Code className="w-6 h-6 text-blue-500 mx-auto" />
            <p className="text-lg font-bold mt-2 text-center">50+</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Contributors</p>
          </div>
        </motion.div>
        
        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <Button
            size="lg"
            className="text-lg h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30"
            onClick={() => window.open('https://github.com/your-repo', '_blank')}
          >
            <span className="flex items-center gap-3">
              <Github className="w-5 h-5" />
              Star on GitHub
            </span>
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Join our growing community of developers
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}