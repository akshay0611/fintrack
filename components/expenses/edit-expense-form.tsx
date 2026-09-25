"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil } from 'lucide-react'
import { usePreferences } from "@/lib/preferences-context"
import { updateTransaction } from "@/lib/actions/transactions"
import { getCategories } from "@/lib/actions/categories"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidVia: z.string().min(1, "Payment method is required"),
})

interface EditExpenseFormProps {
  expense: { id: string; description: string; amount: number; category_id: string; date: string; paidVia: string }
}

export function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const { preferences } = usePreferences()
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])

  useEffect(() => {
    const loadCats = async () => {
      const result = await getCategories("expense")
      if (result.data) {
        setCategories(result.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })))
      }
    }
    loadCats()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense.amount,
      category_id: expense.category_id,
      description: expense.description,
      date: expense.date,
      paidVia: expense.paidVia || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateTransaction(expense.id, {
      amount: values.amount,
      category_id: values.category_id,
      description: values.description || "",
      transaction_date: values.date,
      notes: values.paidVia,
    })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Expense updated successfully!")
      setOpen(false)
      window.dispatchEvent(new CustomEvent("fintrack:transactions-changed"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /><span className="sr-only">Edit expense</span></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Expense</DialogTitle><DialogDescription>Update this expense transaction.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel>
                <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input placeholder="Groceries..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="paidVia" render={({ field }) => (
              <FormItem>
                <FormLabel>Paid Via</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="net_banking">NetBanking</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">Update Expense</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}