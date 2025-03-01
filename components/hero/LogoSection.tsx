"use client"

import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"

export default function LogoSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-16 items-center"
    >
      <motion.div
        className="flex gap-4 justify-center items-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <DollarSign className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient-x">
          FinTrack
        </h1>
      </motion.div>

      <motion.p
        className="text-4xl lg:text-5xl !leading-tight mx-auto max-w-2xl font-medium text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Transform your{" "}
        <span className="relative inline-block">
          <span className="z-10 relative">financial journey</span>
          <span className="absolute bottom-0 left-0 w-full h-4 bg-blue-100/80 dark:bg-blue-900/40 -rotate-1"></span>
        </span>{" "}
        with intuitive tracking for{" "}
        <span className="font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
          incomes
        </span>
        ,{" "}
        <span className="font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          expenses
        </span>
        , and{" "}
        <span className="font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          investments
        </span>
      </motion.p>
    </motion.div>
  )
}