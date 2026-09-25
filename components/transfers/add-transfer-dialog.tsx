"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AddTransferForm } from "./add-transfer-form"

interface AddTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransferDialog({ open, onOpenChange }: AddTransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[min(85vh,32rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transfer</DialogTitle>
          <DialogDescription>Create a new transfer between accounts.</DialogDescription>
        </DialogHeader>
        <AddTransferForm onSuccess={() => { onOpenChange(false); window.dispatchEvent(new CustomEvent("fintrack:transactions-changed")) }} />
      </DialogContent>
    </Dialog>
  )
}