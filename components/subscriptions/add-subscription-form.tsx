"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { createSubscription } from "@/lib/actions/subscriptions-v2"
import { getCategories } from "@/lib/actions/categories"

const formSchema = z.object({
  name: z.string().min(1, "Subscription name is required"),
  amount: z.string().min(1, "Amount is required").transform(Number),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  startDate: z.string().min(1, "Start date is required"),
  category_id: z.string().optional(),
  notes: z.string().optional(),
})

interface AddSubscriptionFormProps { onSuccess?: () => void }

export function AddSubscriptionForm({ onSuccess }: AddSubscriptionFormProps) {
  const { preferences } = usePreferences()
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", amount: 0, billingCycle: "monthly", startDate: new Date().toISOString().split('T')[0], category_id: "", notes: "" },
  })

  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }

  useEffect(() => {
    const loadCats = async () => {
      const result = await getCategories("expense")
      if (result.data) {
        setCategories(result.data.map((c: any) => ({ id: c.id, name: c.name })))
      }
    }
    loadCats()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createSubscription({ name: values.name, amount: values.amount, cycle: values.billingCycle, start_date: values.startDate, next_renewal_date: values.startDate, notes: values.notes, category_id: values.category_id || undefined })
      if (result.error) { toast.error(result.error) } else { toast.success("Subscription added successfully!"); form.reset(); onSuccess?.() }
    } catch (error: any) { toast.error(error.message || "Failed to add subscription") }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Subscription Name</FormLabel><FormControl><Input placeholder="Netflix..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="billingCycle" render={({ field }) => (<FormItem><FormLabel>Billing Cycle</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select billing cycle" /></SelectTrigger></FormControl><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category_id" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Input placeholder="Additional details..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="w-full">Add Subscription</Button>
      </form>
    </Form>
  )
}