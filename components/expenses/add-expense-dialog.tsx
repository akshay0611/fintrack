"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddExpenseForm } from "./add-expense-form"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Expense</DialogTitle><DialogDescription>Create a new expense transaction.</DialogDescription></DialogHeader>
        <AddExpenseForm onSuccess={() => { onOpenChange(false); window.dispatchEvent(new CustomEvent("fintrack:transactions-changed")) }} />
      </DialogContent>
    </Dialog>
  )
}
