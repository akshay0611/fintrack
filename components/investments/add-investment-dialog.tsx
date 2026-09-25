"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { usePreferences } from "@/lib/preferences-context"
import { createInvestmentPurchase } from "@/lib/actions/investments"
import { getActiveAccounts } from "@/lib/actions/accounts"
import { toast } from "sonner"

const investmentCategories = [
  { value: "stocks", label: "Stocks" },
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "real_estate", label: "Real Estate" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "bonds", label: "Bonds" },
  { value: "gold", label: "Gold" },
  { value: "other", label: "Other" },
]

interface AddInvestmentDialogProps { open: boolean; onOpenChange: (open: boolean) => void }

export function AddInvestmentDialog({ open, onOpenChange }: AddInvestmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { preferences } = usePreferences()
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [accountId, setAccountId] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("stocks")
  const [units, setUnits] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }

  useEffect(() => {
    const loadAccounts = async () => {
      const result = await getActiveAccounts()
      if (result.data) {
        const investmentAccounts = result.data.filter((a: any) => a.type === 'investment')
        setAccounts(investmentAccounts.map((a: any) => ({ id: a.id, name: a.name })))
        if (investmentAccounts.length === 1) {
          setAccountId(investmentAccounts[0].id)
        }
      }
    }
    loadAccounts()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await createInvestmentPurchase({ account_id: accountId, name, category: category as any, units: parseFloat(units), unit_price: parseFloat(unitPrice) })
      if (result.error) { toast.error(result.error) } else { toast.success("Investment added successfully!"); onOpenChange(false); window.dispatchEvent(new CustomEvent("fintrack:investments-changed")) }
    } catch (error: any) { toast.error(error.message || "Failed to add investment") }
    finally { setIsSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Investment</DialogTitle><DialogDescription>Create a new investment purchase.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium">Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full border rounded px-3 py-2" required>
              <option value="">Select an investment account</option>
              {accounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </select>
          </div>
          <div><label className="text-sm font-medium">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required /></div>
          <div><label className="text-sm font-medium">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
              {investmentCategories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div><label className="text-sm font-medium">Units</label><input type="number" step="0.000001" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full border rounded px-3 py-2" required /></div>
          <div><label className="text-sm font-medium">Unit Price ({currencySymbols[preferences.currency]})</label><input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full border rounded px-3 py-2" required /></div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>Add Investment</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}