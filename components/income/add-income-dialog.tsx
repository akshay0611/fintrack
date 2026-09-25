"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddIncomeForm } from "./add-income-form"

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddIncomeDialog({ open, onOpenChange }: AddIncomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>Create a new income transaction.</DialogDescription>
        </DialogHeader>
        <AddIncomeForm onSuccess={() => { onOpenChange(false); window.dispatchEvent(new CustomEvent("fintrack:transactions-changed")) }} />
      </DialogContent>
    </Dialog>
  )
}

