

"use client"

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <motion.div 
      className="flex-1 flex flex-col min-w-64 max-w-md p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <form className="flex flex-col gap-8">
        <div className="space-y-2 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reset Password
            </h1>
          </motion.div>
          
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Remember your password?{" "}
            <Link 
              className="font-medium text-blue-600 hover:text-purple-600 transition-colors underline hover:no-underline"
              href="/sign-in"
            >
              Sign in instead
            </Link>
          </motion.p>
        </div>

        <div className="flex flex-col gap-6">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600/90" />
              Email
            </Label>
            <Input 
              name="email" 
              placeholder="you@example.com" 
              required
              className="py-6 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
          <SubmitButton
  formAction={forgotPasswordAction}
  className="mt-4 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-600/90 hover:to-purple-600/90 text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 group flex items-center justify-center gap-2"
>
  Reset Password
</SubmitButton>
          </motion.div>
          <FormMessage message={searchParams} />
        </div>
      </form>
 {/* Matching decorative elements */}
 <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}
