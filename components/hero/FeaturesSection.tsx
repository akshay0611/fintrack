"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Lock, Zap, PieChart, Shield, ChevronDown } from "lucide-react"

const features = [
  {
    name: "Privacy",
    description: "Your private data, such as name, price, and notes, etc., is securely encrypted in the database.",
    icon: <Lock className="w-6 h-6 text-white" />,
    gradient: "from-purple-600 to-pink-600",
    screenshotUrl: "/demo/sync.jpg",
  },
  {
    name: "Cross-Platform Sync",
    description: "Access your data anywhere, anytime, on any device.",
    icon: <Zap className="w-6 h-6 text-white" />,
    gradient: "from-blue-600 to-cyan-600",
    screenshotUrl: "/demo/sync.jpg",
  },
  {
    name: "Custom Reports",
    description: "Generate detailed reports tailored to your needs.",
    icon: <PieChart className="w-6 h-6 text-white" />,
    gradient: "from-green-600 to-lime-600",
    screenshotUrl: "/demo/reports.jpg",
  },
  {
    name: "Team Collaboration",
    description: "Share and collaborate with your financial team.",
    icon: <Shield className="w-6 h-6 text-white" />,
    gradient: "from-orange-600 to-amber-600",
    screenshotUrl: "/demo/collaboration.jpg",
  },
]

export default function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(0)

  return (
    <motion.div
      className="mt-24 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent text-center">
        Powerful Features
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3 flex flex-col gap-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              className={`p-1 rounded-xl ${selectedFeature === index ? 'bg-gradient-to-r ' + feature.gradient : ''}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFeature(index)}
            >
              <div
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                  selectedFeature === index
                    ? 'bg-white dark:bg-gray-900 shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.gradient}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold dark:text-white">{feature.name}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                    selectedFeature === index ? 'rotate-180' : ''
                  }`}
                />
              </div>
              <motion.p
                className="text-white-600 dark:text-gray-300 px-4 py-2 text-sm"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: selectedFeature === index ? 'auto' : 0,
                  opacity: selectedFeature === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="w-full lg:w-2/3 rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={features[selectedFeature].screenshotUrl}
            alt={`${features[selectedFeature].name} preview`}
            className="w-full h-[400px] object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}