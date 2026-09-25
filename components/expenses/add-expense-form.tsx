"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { createTransaction } from "@/lib/actions/transactions"
import { getAccounts } from "@/lib/actions/accounts"
import { getCategories } from "@/lib/actions/categories"
import { useState, useEffect } from "react"
import { categoryToEmoji } from '@/utils/category-emojis';

const formSchema = z.object({
  account_id: z.string().min(1, "Account is required"),
  amount: z.string().min(1, "Amount is required").transform(Number),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidVia: z.string().min(1, "Payment method is required"),
})

interface AddExpenseFormProps {
  onSuccess?: () => void
}

export function AddExpenseForm({ onSuccess }: AddExpenseFormProps) {
  const { preferences } = usePreferences()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [expenseCategories, setExpenseCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_id: "",
      amount: 0,
      category_id: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      paidVia: "",
    },
  })

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹'
  }

  useEffect(() => {
    const loadData = async () => {
      const accountsResult = await getAccounts()
      if (accountsResult.data) {
        setAccounts(accountsResult.data.map((a: any) => ({ id: a.id, name: a.name })))
      }
      const catsResult = await getCategories("expense")
      if (catsResult.data) {
        setExpenseCategories(catsResult.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })))
      }
    }
    loadData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const expenseData = {
      account_id: values.account_id,
      type: "expense" as const,
      amount: values.amount,
      category_id: values.category_id,
      description: values.description || "",
      transaction_date: values.date,
      notes: values.paidVia,
    }

    setIsSubmitting(true)
    try {
      const result = await createTransaction(expenseData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Expense added successfully!")
        form.reset()
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add expense")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Groceries..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paidVia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid Via</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem><SelectItem value="credit_card">Credit Card</SelectItem><SelectItem value="debit_card">Debit Card</SelectItem><SelectItem value="e_wallet">E-Wallet</SelectItem><SelectItem value="net_banking">NetBanking</SelectItem><SelectItem value="upi">UPI</SelectItem>
                </SelectContent></Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>Add Expense</Button>
      </form>
    </Form>
  )
}
