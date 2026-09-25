"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/lib/preferences-context"
import { toast } from "sonner"

interface EditInvestmentFormProps { investment: { id: string; name: string; units: number; unit_price: number; amount: number; category: string; purchase_date: string; notes: string } }

export function EditInvestmentForm({ investment }: EditInvestmentFormProps) {
  const [open, setOpen] = useState(false)
  const { preferences } = usePreferences()
  const currencySymbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

  const handleClick = () => {
    toast.info("Investment records are immutable in V2. Edit purchases through a new transaction.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" onClick={handleClick}><Pencil className="h-4 w-4" /><span className="sr-only">Edit investment</span></Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Investment</DialogTitle><DialogDescription>Investment records are immutable in V2.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><p className="text-sm">{investment.name}</p></div>
          <div><label className="text-sm font-medium">Amount ({currencySymbols[preferences.currency]})</label><p className="text-sm">{investment.amount.toFixed(2)}</p></div>
          <div><label className="text-sm font-medium">Description</label><p className="text-sm">{investment.notes}</p></div>
          <p className="text-xs text-muted-foreground">Investment purchases are immutable in V2. To adjust a holding, create a new purchase or contact support.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}