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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-background to-background/80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-16 items-center max-w-4xl mx-auto text-center"
      >
        {/* Logo Section */}
        <motion.div
          className="flex gap-4 justify-center items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <DollarSign className="w-12 h-12 text-primary" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            FinTrack
          </h1>
        </motion.div>

        {/* Screen Reader Only Title */}
        <h2 className="sr-only">FinTrack - Manage Your Finances</h2>

        {/* Tagline / Description */}
        <motion.p
          className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Track and manage your <span className="font-semibold text-primary">incomes</span>,{" "}
          <span className="font-semibold text-primary">expenses</span>, and{" "}
          <span className="font-semibold text-primary">investments</span> effortlessly.
        </motion.p>

        {/* Features */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <FeatureCard icon={<DollarSign />} title="Track Expenses" />
          <FeatureCard icon={<TrendingUp />} title="Analyze Growth" />
          <FeatureCard icon={<PieChart />} title="Visualize Data" />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button size="lg" className="mt-8 text-lg" onClick={() => router.push("/sign-in")}>
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Why use FinTrack? Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8">Why use FinTrack?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ReasonCard
              icon={<CheckCircle className="w-8 h-8 text-primary" />}
              title="Easy to Use"
              description="Intuitive interface for hassle-free financial management."
            />
            <ReasonCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Secure"
              description="Bank-level encryption to keep your financial data safe."
            />
            <ReasonCard
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Real-time Updates"
              description="Get instant insights into your financial health."
            />
          </div>
        </motion.div>

        {/* Simple yet Powerful Features Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8">Simple yet Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureDetailCard
              title="Expense Categorization"
              description="Automatically categorize your expenses for better insights."
            />
            <FeatureDetailCard
              title="Budget Planning"
              description="Set and track budgets for different expense categories."
            />
            <FeatureDetailCard
              title="Investment Tracking"
              description="Monitor your investments and their performance over time."
            />
            <FeatureDetailCard
              title="Financial Reports"
              description="Generate comprehensive reports to analyze your financial trends."
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <motion.div
      className="flex flex-col items-center p-4 bg-card rounded-lg shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </motion.div>
  )
}

function ReasonCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </motion.div>
  )
}

function FeatureDetailCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div className="p-6 bg-card rounded-lg shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}