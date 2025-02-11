"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddExpenseForm } from "./add-expense-form"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <AddExpenseForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

