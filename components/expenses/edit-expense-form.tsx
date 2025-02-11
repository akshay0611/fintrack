"use client"

import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useExpenseStore, ExpenseEntry } from "@/lib/expenses-data"
import { Pencil } from 'lucide-react'
import { usePreferences } from "@/lib/preferences-context"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidVia: z.string().min(1, "Payment method is required"),
})

interface EditExpenseFormProps {
  expense: ExpenseEntry
}

export function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const editExpense = useExpenseStore((state) => state.editExpense)
  const { preferences } = usePreferences()
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expense.amount, // Initialize as a number
      category: expense.category,
      description: expense.description,
      date: expense.date,
      paidVia: expense.paidVia || "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const expenseData = {
      ...values,
      description: values.description || "", // Ensure description is always a string
    }
    editExpense(expense.id, expenseData)
    toast.success("Expense updated successfully!")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="category"
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
                      <SelectGroup>
                        <SelectLabel className="text-primary font-semibold uppercase text-xs tracking-wider">
                          Essentials
                        </SelectLabel>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="grocery">Grocery</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                      </SelectGroup>
                      <SelectSeparator className="my-2" />
                      <SelectGroup>
                        <SelectLabel className="text-blue-500 dark:text-blue-400 font-semibold uppercase text-xs tracking-wider">
                          Expenses
                        </SelectLabel>
                        <SelectItem value="bills">Bills</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="online_order">Online Order</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                      </SelectGroup>
                      <SelectSeparator className="my-2" />
                      <SelectGroup>
                        <SelectLabel className="text-purple-500 dark:text-purple-400 font-semibold uppercase text-xs tracking-wider">
                          Leisure
                        </SelectLabel>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectGroup>
                      <SelectSeparator className="my-2" />
                      <SelectGroup>
                        <SelectLabel className="text-orange-500 dark:text-orange-400 font-semibold uppercase text-xs tracking-wider">
                          Payments
                        </SelectLabel>
                        <SelectItem value="emi">EMI</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="debt">Debt</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                      </SelectGroup>
                      <SelectSeparator className="my-2" />
                      <SelectGroup>
                        <SelectLabel className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wider">
                          Other
                        </SelectLabel>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectGroup>
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
              )}
            />
            <Button type="submit" className="w-full">Update Expense</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

