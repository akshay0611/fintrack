"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Lock, Zap, PieChart, Shield, ChevronDown, ExternalLink } from "lucide-react"

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
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }
  
  const imageVariants = {
    initial: { scale: 1.05, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      scale: 1.05,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }

  return (
    <motion.section
      className="py-24 w-full relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Powerful & Intuitive
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300">
              Features That Empower You
            </span>
          </h2>
          
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how our platform can transform your workflow with these powerful tools.
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <motion.div 
            className="w-full lg:w-1/3 flex flex-col gap-3"
            variants={itemVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className={`p-1 rounded-2xl ${
                  selectedFeature === index ? 'bg-gradient-to-r ' + feature.gradient : ''
                }`}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: selectedFeature !== index ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "none"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFeature(index)}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div
                  className={`flex items-center justify-between p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedFeature === index
                      ? 'bg-white dark:bg-gray-900 shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white">{feature.name}</h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                      selectedFeature === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: selectedFeature === index ? 'auto' : 0,
                    opacity: selectedFeature === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                 <p className="text-black dark:text-white px-5 py-3 text-base leading-relaxed">
  {feature.description}
</p>
                  <div className="px-5 pb-3">
                    <motion.button
                      className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline"
                      whileHover={{ x: 5 }}
                    >
                      Learn more <ExternalLink className="ml-1 w-3 h-3" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            className="w-full lg:w-2/3"
            variants={itemVariants}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <motion.div 
                className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {features[selectedFeature].name}
              </motion.div>
              
              <motion.img
                key={selectedFeature}
                src={features[selectedFeature].screenshotUrl}
                alt={`${features[selectedFeature].name} preview`}
                className="w-full h-[450px] object-cover"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={imageVariants}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8 pt-16">
                <h4 className="text-white text-xl font-bold mb-2">
                  {features[selectedFeature].name}
                </h4>
                <p className="text-gray-200 text-sm max-w-lg">
                  {features[selectedFeature].description}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center gap-2">
              {features.map((feature, index) => (
                <motion.button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    selectedFeature === index 
                      ? 'bg-gradient-to-r ' + feature.gradient + ' w-6' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFeature(index)}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}