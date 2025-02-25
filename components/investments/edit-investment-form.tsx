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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useInvestmentStore, InvestmentEntry } from "@/lib/investments-data"
import { Pencil } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"

// Define the form schema with `z.number()` for `units` and `price`
const formSchema = z.object({
  name: z.string().min(1, "Investment name is required"),
  date: z.string().min(1, "Date is required"),
  units: z.number().min(1, "Number of units is required"), // Use `z.number()`
  price: z.number().min(1, "Price per unit is required"), // Use `z.number()`
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
})

interface EditInvestmentFormProps {
  investment: InvestmentEntry
}

export function EditInvestmentForm({ investment }: EditInvestmentFormProps) {
  const [open, setOpen] = useState(false)
  const editInvestment = useInvestmentStore((state) => state.editInvestment)
  const { preferences } = usePreferences()
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    // Add other currencies as needed
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: investment.name,
      date: investment.date,
      units: investment.units, // Pass as number
      price: investment.price, // Pass as number
      category: investment.category,
      notes: investment.notes,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Calculate the amount dynamically
    const amount = values.units * values.price;

    // Call editInvestment with the updated values and calculated amount
    editInvestment(investment.id, {
      ...values,
      amount, // Include the calculated amount
    });

    toast.success("Investment updated successfully!")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit investment</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="HDFC Bank Stock..." {...field} />
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
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Units</FormLabel>
                  <FormControl>
                    <Input
                      type="number" // Ensure input type is number
                      placeholder="10"
                      {...field}
                      value={field.value} // Pass the number value directly
                      onChange={(e) => field.onChange(e.target.valueAsNumber)} // Use `valueAsNumber`
                    />
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
                    <Input
                      type="number" // Ensure input type is number
                      placeholder="100.00"
                      {...field}
                      value={field.value} // Pass the number value directly
                      onChange={(e) => field.onChange(e.target.valueAsNumber)} // Use `valueAsNumber`
                    />
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
                        <SelectValue placeholder="Select investment category" />
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
            <Button type="submit" className="w-full">Update Investment</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}