"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, DollarSign, PieChart, TrendingUp, CheckCircle, Shield, Zap, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"

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

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-16 items-center max-w-6xl mx-auto text-center"
      >
        {/* Logo Section */}
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

        {/* Tagline / Description */}
        <motion.p
          className="text-4xl lg:text-5xl !leading-tight mx-auto max-w-2xl font-medium"
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

        {/* Features */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-white" />}
            title="Smart Analytics"
            gradient="from-green-500 to-cyan-500"
          />
          <FeatureCard
            icon={<PieChart className="w-8 h-8 text-white" />}
            title="Visual Reports"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-white" />}
            title="Bank Security"
            gradient="from-blue-500 to-indigo-500"
          />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="mt-8 text-lg h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => router.push("/sign-in")}
          >
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 animate-in fade-in slide-in-from-right-4" />
            </span>
          </Button>
          <p className="text-sm mt-4 text-gray-600 dark:text-gray-300">
            No credit card required • 14-day free trial
          </p>
        </motion.div>

        {/* Why use FinTrack? Section */}
        <motion.div
          className="mt-24 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
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

        {/* Interactive Features Section */}
        <motion.div
          className="mt-24 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Feature List */}
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
            {/* Preview Panel */}
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
      </motion.div>
    </div>
  )
}

// Existing components remain unchanged
function FeatureCard({ icon, title, gradient }: { icon: React.ReactNode; title: string; gradient: string }) {
  return (
    <motion.div
      className={`p-1 rounded-xl bg-gradient-to-r ${gradient} shadow-xl hover:shadow-2xl transition-shadow`}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-xl gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold dark:text-white">{title}</h3>
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