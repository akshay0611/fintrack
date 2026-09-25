"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { createTransaction } from "@/lib/actions/transactions"
import { getActiveAccounts } from "@/lib/actions/accounts"
import { getCategories } from "@/lib/actions/categories"
import { useState, useEffect } from "react"

const formSchema = z.object({
  account_id: z.string().min(1, "Account is required"),
  amount: z.preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number().min(1, "Amount is required")),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
})

interface AddIncomeFormProps { onSuccess?: () => void }

export function AddIncomeForm({ onSuccess }: AddIncomeFormProps) {
  const { preferences } = usePreferences()
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [incomeCategories, setIncomeCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { account_id: "", amount: 0, category_id: "", description: "", date: new Date().toISOString().split("T")[0] },
  })

  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" }

  useEffect(() => {
    const loadData = async () => {
      const accountsResult = await getActiveAccounts()
      if (accountsResult.data) {
        setAccounts(accountsResult.data.map((a: any) => ({ id: a.id, name: a.name })))
      }
      const catsResult = await getCategories("income")
      if (catsResult.data) {
        setIncomeCategories(catsResult.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })))
      }
    }
    loadData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const incomeData = { account_id: values.account_id, type: "income" as const, amount: values.amount, category_id: values.category_id, description: values.description || "", transaction_date: values.date }
    try {
      const result = await createTransaction(incomeData)
      if (result.error) { toast.error(result.error) } else { toast.success("Income added successfully!"); form.reset(); onSuccess?.() }
    } catch (error: any) { toast.error(error.message || "Failed to add income") }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="account_id" render={({ field }) => (<FormItem><FormLabel>Account</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger></FormControl><SelectContent>{accounts.map((account) => (<SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category_id" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{incomeCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Monthly salary..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="w-full">Add Income</Button>
      </form>
    </Form>
  );
}