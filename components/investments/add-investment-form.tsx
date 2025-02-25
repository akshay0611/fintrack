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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useInvestmentStore } from "@/lib/investments-data"
import { usePreferences } from "@/lib/preferences-context"

const formSchema = z.object({
  name: z.string().min(1, "Investment name is required"),
  units: z.string().min(1, "Number of units is required").transform(Number),
  price: z.string().min(1, "Price per unit is required").transform(Number),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  date: z.string().min(1, "Date is required"),
})

interface AddInvestmentFormProps {
  onSuccess?: () => void
}

export function AddInvestmentForm({ onSuccess }: AddInvestmentFormProps) {
  const addInvestment = useInvestmentStore((state) => state.addInvestment)
  const { preferences } = usePreferences()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      units: 0,
      price: 0,
      category: "",
      notes: "",
      date: new Date().toISOString().split('T')[0],
    },
  })

  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹'
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const amount = values.units * values.price
    addInvestment({
      name: values.name,
      units: values.units,
      price: values.price,
      amount,
      category: values.category,
      notes: values.notes,
      date: values.date,
    })
    toast.success("Investment added successfully!")
    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Name</FormLabel>
              <FormControl>
                <Input placeholder="HDFC Bank..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Units</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Unit ({currencySymbols[preferences.currency]})</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100.00" {...field} />
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
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="bonds">Bonds</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Additional details..." {...field} />
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
        <Button type="submit" className="w-full">Add Investment</Button>
      </form>
    </Form>
  )
}