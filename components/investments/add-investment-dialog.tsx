"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddInvestmentForm } from "./add-investment-form"

interface AddInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddInvestmentDialog({ open, onOpenChange }: AddInvestmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Investment</DialogTitle>
        </DialogHeader>
        <AddInvestmentForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

