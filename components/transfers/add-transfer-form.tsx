"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { createTransaction } from "@/lib/actions/transactions"
import { getActiveAccounts } from "@/lib/actions/accounts"
import { useState, useEffect } from "react"

const formSchema = z
  .object({
    source_account_id: z.string().min(1, "Source account is required"),
    destination_account_id: z.string().min(1, "Destination account is required"),
    amount: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number().min(0.01, "Amount must be greater than 0")
    ),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
  })
  .refine((data) => data.source_account_id !== data.destination_account_id, {
    message: "Source and destination accounts must be different",
    path: ["destination_account_id"],
  })

interface AddTransferFormProps {
  onSuccess?: () => void
}

export function AddTransferForm({ onSuccess }: AddTransferFormProps) {
  const { preferences } = usePreferences()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source_account_id: "",
      destination_account_id: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
  }

  useEffect(() => {
    const loadData = async () => {
      const accountsResult = await getActiveAccounts()
      if (accountsResult.data) {
        setAccounts(accountsResult.data.map((a: any) => ({ id: a.id, name: a.name })))
      }
    }
    loadData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const transferData = {
      account_id: values.source_account_id,
      type: "transfer" as const,
      amount: values.amount,
      category_id: undefined,
      description: values.description || "",
      transaction_date: values.date,
      destination_account_id: values.destination_account_id,
    }

    setIsSubmitting(true)
    try {
      const result = await createTransaction(transferData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Transfer added successfully!")
        form.reset()
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add transfer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="source_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destination_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount ({currencySymbols[preferences.currency]})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Transfer to savings..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Add Transfer
        </Button>
      </form>
    </Form>
  )
}