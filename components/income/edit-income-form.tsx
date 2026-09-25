"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"
import { updateTransaction } from "@/lib/actions/transactions"
import { getCategories } from "@/lib/actions/categories"

const formSchema = z.object({ amount: z.number().min(1, "Amount is required"), category_id: z.string().min(1, "Category is required"), description: z.string().optional(), date: z.string().min(1, "Date is required") })

interface EditIncomeFormProps { income: { id: string; amount: number; category_id: string; description: string; date: string } }

export function EditIncomeForm({ income }: EditIncomeFormProps) {
  const [open, setOpen] = useState(false)
  const { preferences } = usePreferences()
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])

  useEffect(() => {
    const loadCats = async () => {
      const result = await getCategories("income")
      if (result.data) {
        setCategories(result.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })))
      }
    }
    loadCats()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { amount: income.amount, category_id: income.category_id, description: income.description, date: income.date } })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateTransaction(income.id, { amount: values.amount, category_id: values.category_id, description: values.description || "", transaction_date: values.date })
    if (result.error) { toast.error(result.error) } else { toast.success("Income updated successfully!"); setOpen(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /><span className="sr-only">Edit income</span></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Edit Income</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="category_id" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Monthly salary..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" className="w-full">Update Income</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}