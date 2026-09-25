"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/lib/preferences-context"
import { createSubscription } from "@/lib/actions/subscriptions-v2"
import { getCategories } from "@/lib/actions/categories"
import { toast } from "sonner"

interface AddSubscriptionDialogProps { open: boolean; onOpenChange: (open: boolean) => void }

export function AddSubscriptionDialog({ open, onOpenChange }: AddSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { preferences } = usePreferences()
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [cycle, setCycle] = useState("monthly")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [nextRenewalDate, setNextRenewalDate] = useState(new Date().toISOString().split("T")[0])
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    const loadCats = async () => {
      const result = await getCategories("expense")
      if (result.data) {
        setCategories(result.data.map((c: any) => ({ id: c.id, name: c.name })))
      }
    }
    loadCats()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await createSubscription({ name, amount: parseFloat(amount), cycle, start_date: startDate, next_renewal_date: nextRenewalDate, notes: undefined, category_id: categoryId || undefined })
      if (result.error) { toast.error(result.error) } else { toast.success("Subscription added successfully!"); onOpenChange(false) }
    } catch (error: any) { toast.error(error.message || "Failed to add subscription") }
    finally { setIsSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Add Subscription</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required /></div>
          <div><label className="text-sm font-medium">Amount ({currencySymbols[preferences.currency]})</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded px-3 py-2" required /></div>
          <div><label className="text-sm font-medium">Cycle</label><select value={cycle} onChange={(e) => setCycle(e.target.value)} className="w-full border rounded px-3 py-2"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div><label className="text-sm font-medium">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="text-sm font-medium">Next Renewal Date</label><input type="date" value={nextRenewalDate} onChange={(e) => setNextRenewalDate(e.target.value)} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="text-sm font-medium">Category</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2"><option value="">None</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>Add Subscription</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}