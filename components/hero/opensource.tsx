"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function OpenSourceSection() {
  return (
    <motion.div
      className="mt-24 w-full text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 animate-gradient-x">
        Proudly Open Sourced!
      </h2>
      <motion.p
        className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        Source code is available on GitHub – feel free to read, review, or contribute to it!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <Button
          size="lg"
          className="mt-8 text-lg h-14 px-8 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={() => window.open('https://github.com/your-repo', '_blank')}
        >
          <span className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Star on GitHub
          </span>
        </Button>
      </motion.div>
    </motion.div>
  )
}