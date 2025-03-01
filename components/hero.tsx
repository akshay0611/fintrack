"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, PieChart, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import LogoSection from "./hero/LogoSection"
import WhyFinTrackSection from "./hero/WhyFinTrackSection"
import FeaturesSection from "./hero/FeaturesSection"
import OpenSourceSection from "./hero/opensource"

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
      <div className="max-w-6xl mx-auto text-center">
        <LogoSection />

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
          <p className="text-sm mt-4 text-gamma-600 dark:text-gamma-300">
            No credit card required • 14-day free trial
          </p>
        </motion.div>

        <WhyFinTrackSection />
        <FeaturesSection />
        <OpenSourceSection />
      </div>
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