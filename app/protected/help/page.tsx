"use client"

import { Suspense } from "react"
import { SideNav } from "@/components/side-nav"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, FileText, Github, Twitter } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex-1">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Read our detailed documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Community
                </CardTitle>
                <CardDescription>Join our community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button className="w-full" variant="outline">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about Finance Tracker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How do I add a new income entry?
                  </AccordionTrigger>
                  <AccordionContent>
                    To add a new income entry, navigate to the Income page using the sidebar menu. 
                    Fill out the form with the amount, category, description, and date. 
                    Click the "Add Income" button to save your entry.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How do I edit or delete a transaction?
                  </AccordionTrigger>
                  <AccordionContent>
                    Each transaction in the history tables has edit and delete buttons in the Actions column. 
                    Click the pencil icon to edit or the trash icon to delete a transaction. 
                    For editing, update the information in the form and save your changes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How do I change my currency preferences?
                  </AccordionTrigger>
                  <AccordionContent>
                    Go to the Settings page and select the Preferences tab. 
                    You can choose your preferred currency from the dropdown menu. 
                    The change will be applied across the entire application.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    How are my savings calculated?
                  </AccordionTrigger>
                  <AccordionContent>
                    Your total savings are calculated by subtracting your total expenses 
                    and monthly subscription costs from your total income. 
                    This gives you a clear picture of your net savings for the period.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    How do I manage my subscriptions?
                  </AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Subscriptions page to view, add, edit, or delete your subscriptions. 
                    You can track monthly, quarterly, or yearly subscriptions, and the system will 
                    calculate your total monthly subscription cost automatically.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    Can I export my financial data?
                  </AccordionTrigger>
                  <AccordionContent>
                    Currently, we&apos;re working on adding export functionality. 
                    In a future update, you&apos;ll be able to export your data in various formats 
                    including CSV and PDF for your records or analysis.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

         
        </div>
      </div>
    </div>
  )
}

