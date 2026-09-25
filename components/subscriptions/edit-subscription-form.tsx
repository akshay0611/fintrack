"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/lib/preferences-context"
import { updateSubscription } from "@/lib/actions/subscriptions-v2"
import { toast } from "sonner"

interface EditSubscriptionFormProps { subscription: { id: string; name: string; amount: number; cycle: string; start_date: string; next_renewal_date: string; status: string; notes: string }; onSuccess?: () => void }

export function EditSubscriptionForm({ subscription, onSuccess }: EditSubscriptionFormProps) {
  const [open, setOpen] = useState(false)
  const { preferences } = usePreferences()
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const result = await updateSubscription(subscription.id, {
        name: formData.get("name") as string,
        amount: parseFloat(formData.get("amount") as string),
        cycle: formData.get("cycle") as string,
        next_renewal_date: formData.get("next_renewal_date") as string,
        notes: formData.get("notes") as string,
      })
      if (result.error) { toast.error(result.error) } else { toast.success("Subscription updated successfully!"); onSuccess?.(); setOpen(false) }
    } catch (error: any) { toast.error(error.message || "Failed to update subscription") }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /><span className="sr-only">Edit subscription</span></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Subscription</DialogTitle><DialogDescription>Update this subscription.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><input type="text" name="name" defaultValue={subscription.name} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="text-sm font-medium">Amount ({currencySymbols[preferences.currency]})</label><input type="number" name="amount" defaultValue={subscription.amount} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="text-sm font-medium">Cycle</label><select name="cycle" defaultValue={subscription.cycle} className="w-full border rounded px-3 py-2"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select></div>
          <div><label className="text-sm font-medium">Next Renewal Date</label><input type="date" name="next_renewal_date" defaultValue={subscription.next_renewal_date} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="text-sm font-medium">Notes</label><textarea name="notes" defaultValue={subscription.notes} className="w-full border rounded px-3 py-2" /></div>
          <Button type="submit" className="w-full" disabled={loading}>Update Subscription</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
