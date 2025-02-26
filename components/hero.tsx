"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, PieChart, TrendingUp, CheckCircle, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"

export default function Hero() {
  const [mounted, setMounted] = useState(false)
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

        {/* Features Grid */}
        <motion.div
  className="mt-24 w-full"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1, duration: 0.5 }}
>
  <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
    Powerful Features
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <FeatureDetailCard 
      title="AI-Powered Insights"
      description="Get smart recommendations powered by machine learning algorithms."
      icon={<TrendingUp className="w-6 h-6 text-white" />}
      gradient="from-purple-600 to-pink-600"
    />
    <FeatureDetailCard
      title="Cross-Platform Sync"
      description="Access your data anywhere, anytime, on any device."
      icon={<Zap className="w-6 h-6 text-white" />}
      gradient="from-blue-600 to-cyan-600"
    />
    <FeatureDetailCard
      title="Custom Reports"
      description="Generate detailed reports tailored to your needs."
      icon={<PieChart className="w-6 h-6 text-white" />}
      gradient="from-green-600 to-lime-600"
    />
    <FeatureDetailCard
      title="Team Collaboration"
      description="Share and collaborate with your financial team."
      icon={<Shield className="w-6 h-6 text-white" />}
      gradient="from-orange-600 to-amber-600"
    />
  </div>
</motion.div>
      </motion.div>
    </div>
  )
}

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

function FeatureDetailCard({ title, description, icon, gradient }: { title: string; description: string; icon?: React.ReactNode; gradient?: string }) {
  return (
    <motion.div
      className="group relative h-full p-1 rounded-xl bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-gray-800 hover:shadow-lg transition-shadow"
      whileHover={{ y: -3 }}
    >
      {gradient && (
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />
      )}
      <div className="relative p-6 bg-white dark:bg-gray-900 rounded-xl h-full">
        {icon && (
          <div className={`mb-4 inline-block p-3 rounded-lg ${gradient} bg-gradient-to-r`}>
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </motion.div>
  )
}