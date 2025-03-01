"use client"

import { motion } from "framer-motion"
import { CheckCircle, Zap, Shield } from "lucide-react"

export default function WhyFinTrackSection() {
  return (
    <motion.div
      className="mt-24 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent text-center">
        Why Choose FinTrack?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReasonCard
          icon={<CheckCircle className="w-8 h-8 text-white" />}
          title="Intuitive Design"
          description="Enjoy a seamless experience crafted for financial clarity."
          gradient="from-green-500 to-cyan-500"
        />
        <ReasonCard
          icon={<Zap className="w-8 h-8 text-white" />}
          title="Real-time Sync"
          description="Instant updates across all your devices."
          gradient="from-purple-500 to-pink-500"
        />
        <ReasonCard
          icon={<Shield className="w-8 h-8 text-white" />}
          title="High Encryption"
          description="Your data stays private and secure."
          gradient="from-blue-500 to-indigo-500"
        />
      </div>
    </motion.div>
  )
}

function ReasonCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <motion.div
      className={`p-1 rounded-2xl bg-gradient-to-r ${gradient} hover:shadow-xl transition-shadow`}
      whileHover={{ y: -5 }}
    >
      <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-2xl h-full gap-4">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
      </div>
    </motion.div>
  )
}