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
import { useExpenseStore } from "@/lib/expenses-data"
import { usePreferences } from "@/lib/preferences-context"

import { categoryToEmoji } from '@/utils/category-emojis';

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidVia: z.string().min(1, "Payment method is required"),
})

interface AddExpenseFormProps {
  onSuccess?: () => void
}

export function AddExpenseForm({ onSuccess }: AddExpenseFormProps) {
  const addExpense = useExpenseStore((state) => state.addExpense)
  const { preferences } = usePreferences()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0, // Initialize as a number
      category: "",
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const expenseData = {
      ...values,
      description: values.description || "", // Ensure description is always a string
    };
  
    // Await the addExpense call to handle errors appropriately
    try {
      addExpense(expenseData);
      toast.success("Expense added successfully!");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add expense");
    }
  }
  

  return (
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
    <SelectItem value="food">{categoryToEmoji.food} Food</SelectItem>
    <SelectItem value="grocery">{categoryToEmoji.grocery} Grocery</SelectItem>
    <SelectItem value="medical">{categoryToEmoji.medical} Medical</SelectItem>
  </SelectGroup>
  <SelectSeparator className="my-2" />
  <SelectGroup>
    <SelectLabel className="text-blue-500 dark:text-blue-400 font-semibold uppercase text-xs tracking-wider">
      Expenses
    </SelectLabel>
    <SelectItem value="bills">{categoryToEmoji.bills} Bills</SelectItem>
    <SelectItem value="education">{categoryToEmoji.education} Education</SelectItem>
    <SelectItem value="online_order">{categoryToEmoji.online_order} Online Order</SelectItem>
    <SelectItem value="rent">{categoryToEmoji.rent} Rent</SelectItem>
  </SelectGroup>
  <SelectSeparator className="my-2" />
  <SelectGroup>
    <SelectLabel className="text-purple-500 dark:text-purple-400 font-semibold uppercase text-xs tracking-wider">
      Leisure
    </SelectLabel>
    <SelectItem value="entertainment">{categoryToEmoji.entertainment} Entertainment</SelectItem>
    <SelectItem value="shopping">{categoryToEmoji.shopping} Shopping</SelectItem>
    <SelectItem value="travel">{categoryToEmoji.travel} Travel</SelectItem>
    <SelectItem value="sports">{categoryToEmoji.sports} Sports</SelectItem>
  </SelectGroup>
  <SelectSeparator className="my-2" />
  <SelectGroup>
    <SelectLabel className="text-orange-500 dark:text-orange-400 font-semibold uppercase text-xs tracking-wider">
      Payments
    </SelectLabel>
    <SelectItem value="emi">{categoryToEmoji.emi} EMI</SelectItem>
    <SelectItem value="savings">{categoryToEmoji.savings} Savings</SelectItem>
    <SelectItem value="debt">{categoryToEmoji.debt} Debt</SelectItem>
    <SelectItem value="loan">{categoryToEmoji.loan} Loan</SelectItem>
  </SelectGroup>
  <SelectSeparator className="my-2" />
  <SelectGroup>
    <SelectLabel className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs tracking-wider">
      Other
    </SelectLabel>
    <SelectItem value="others">{categoryToEmoji.others} Others</SelectItem>
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
        <Button type="submit" className="w-full">Add Expense</Button>
      </form>
    </Form>
  )
}

