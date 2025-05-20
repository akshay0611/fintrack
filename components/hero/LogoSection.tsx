"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { DollarSign, ArrowUpRight, ChevronDown, BarChart2, Wallet, PieChart } from "lucide-react"

interface FinancialItemProps {
  text: string
  icon: ReactNode
  gradient: string
  delay?: number
}

export default function LogoSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-2 overflow-hidden"
    >
           
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center relative z-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-12 shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Financial Management Simplified</span>
        </motion.div>
        
        {/* Logo and name with effects */}
        <motion.div
          className="relative flex gap-5 justify-center items-center group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Logo container with animated background */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-80 blur-md"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, -5, 0, 5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl"
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            >
              <DollarSign className="w-14 h-14 text-white" />
            </motion.div>
            
            {/* Small decorative icons */}
            <motion.div 
              className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shadow-lg"
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <BarChart2 className="w-3 h-3 text-white" />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg"
              animate={{ 
                y: [0, 5, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
            >
              <Wallet className="w-3 h-3 text-white" />
            </motion.div>
          </div>
          
          {/* Text logo with shine effect */}
          <div className="relative">
            <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient-x">
              FinTrack
            </h1>
            
            {/* Shine animation */}
            <motion.div 
              className="absolute inset-0 w-1/5 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              animate={{
                x: [-200, 500],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5
              }}
            />
            
            {/* Subtle underline */}
            <motion.div 
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
        
        {/* Tagline with enhanced styling */}
        <motion.p
          className="text-3xl sm:text-4xl lg:text-5xl !leading-tight mx-auto max-w-3xl font-medium text-center mt-16 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Transform your{" "}
          <motion.span 
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="z-10 relative">financial journey</span>
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-5 bg-blue-100/80 dark:bg-blue-900/40 -rotate-1 rounded"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 0.6 }}
            ></motion.span>
          </motion.span>{" "}
          with intuitive tracking for
        </motion.p>
        
        {/* Financial categories with visual enhancements */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <FinancialItem 
            text="incomes" 
            icon={<ArrowUpRight className="w-5 h-5" />}
            gradient="from-green-500 to-cyan-500"
            delay={0.8}
          />
          
          <FinancialItem 
            text="expenses" 
            icon={<Wallet className="w-5 h-5" />}
            gradient="from-purple-500 to-pink-500"
            delay={1}
          />
          
          <FinancialItem 
            text="investments" 
            icon={<PieChart className="w-5 h-5" />}
            gradient="from-orange-500 to-yellow-500"
            delay={1.2}
          />
        </motion.div>
        
        {/* Call to action button */}
        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.button
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Get Started
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

function FinancialItem({ text, icon, gradient, delay = 0 }: FinancialItemProps) {
  return (
    <motion.div
      className={`group px-5 py-3 rounded-full bg-gradient-to-r ${gradient} flex items-center gap-2 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-1.5 bg-white/20 rounded-full">
        {icon}
      </div>
      <span className="font-semibold text-xl text-white">
        {text}
      </span>
    </motion.div>
  )
}