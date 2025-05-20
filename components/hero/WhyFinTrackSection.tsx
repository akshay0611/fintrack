"use client"

import { motion } from "framer-motion"
import { CheckCircle, Zap, Shield, Star, ArrowRight } from "lucide-react"

export default function WhyFinTrackSection() {
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
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const reasons = [
    {
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      title: "Intuitive Design",
      description: "Enjoy a seamless experience crafted for financial clarity. Our user-friendly interface makes tracking your finances effortless.",
      gradient: "from-green-500 to-cyan-500",
      highlight: "98% of users report improved financial awareness"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Real-time Sync",
      description: "Instant updates across all your devices. Never worry about outdated information when making financial decisions.",
      gradient: "from-purple-500 to-pink-500",
      highlight: "Sync takes less than 2 seconds across devices"
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "High Encryption",
      description: "Your data stays private and secure. We use bank-level encryption to ensure your financial information is protected.",
      gradient: "from-blue-500 to-indigo-500",
      highlight: "Military-grade 256-bit encryption"
    }
  ]

  return (
    <motion.section
      className="py-24 w-full relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div className="mb-16 text-center" variants={itemVariants}>
          <motion.div 
            className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Star className="w-4 h-4 mr-2 text-amber-500" />
            Trusted by 10,000+ users
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300">
              Why Choose FinTrack?
            </span>
          </h2>
          
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how our platform stands out from the competition with these powerful advantages.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {reasons.map((reason, index) => (
            <ReasonCard 
              key={index}
              icon={reason.icon}
              title={reason.title}
              description={reason.description}
              gradient={reason.gradient}
              highlight={reason.highlight}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <motion.button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Start Your Financial Journey <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}

function ReasonCard({ 
  icon, 
  title, 
  description, 
  gradient, 
  highlight,
  delay = 0 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  highlight: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="h-full"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.5, delay }
        }
      }}
    >
      <motion.div
        className={`group h-full p-[2px] rounded-2xl bg-gradient-to-r ${gradient}`}
        whileHover={{ 
          y: -8,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
      >
        <div className="relative flex flex-col h-full p-8 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-r from-white/5 to-white/0 dark:from-white/5 dark:to-white/0 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Icon */}
          <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg mb-6 relative z-10`}>
            {icon}
          </div>
          
          {/* Content */}
          <h3 className="text-2xl font-bold dark:text-white mb-4">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{description}</p>
          
          {/* Highlight */}
          <div className="mt-auto">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10 dark:bg-opacity-20`}>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{highlight}</p>
            </div>
          </div>
          
          {/* Footer with link */}
          <motion.div 
            className="mt-6 flex items-center gap-2 text-sm font-medium"
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
              Learn more
            </span>
            <ArrowRight className={`w-3 h-3 bg-clip-text text-transparent bg-gradient-to-r ${gradient}`} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}