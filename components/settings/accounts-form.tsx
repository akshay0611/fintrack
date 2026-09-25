"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getAccounts, getAccountBalances, createAccount, updateAccount, archiveAccount } from "@/lib/actions/accounts"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency } from "@/lib/format-utils"
import { Plus, Archive, Pencil } from "lucide-react"

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["checking", "savings", "credit_card", "cash", "investment"], {
    required_error: "Please select an account type.",
  }),
  currency: z.enum(["USD", "EUR", "GBP", "INR"], {
    required_error: "Please select a currency.",
  }),
  initial_balance: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Initial balance must be a number" }).min(0).optional()
  ),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const accountTypeLabels: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
}

export function AccountsForm() {
  const { preferences } = usePreferences()
  const [accounts, setAccounts] = useState<any[]>([])
  const [balances, setBalances] = useState<Map<string, number>>(new Map())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "checking",
      currency: "USD",
      initial_balance: undefined as number | undefined,
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [accountsResult, balancesResult] = await Promise.all([
        getAccounts(),
        getAccountBalances(),
      ])
      if (accountsResult.data) {
        setAccounts(accountsResult.data)
      }
      if (balancesResult.data) {
        const balanceMap = new Map()
        balancesResult.data.forEach((b: any) => {
          balanceMap.set(b.account_id, b.current_balance)
        })
        setBalances(balanceMap)
      }
    } catch (error) {
      toast.error("Failed to load accounts")
    }
  }

  async function onSubmit(values: AccountFormValues) {
    setIsSubmitting(true)
    try {
      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, {
          name: values.name,
          currency: values.currency,
          initial_balance: values.initial_balance,
        })
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Account updated successfully!")
          setIsDialogOpen(false)
          setEditingAccount(null)
          loadData()
        }
      } else {
        const result = await createAccount({
          name: values.name,
          type: values.type,
          currency: values.currency,
          initial_balance: values.initial_balance,
        })
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Account created successfully!")
          setIsDialogOpen(false)
          form.reset()
          loadData()
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save account")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (account: any) => {
    const balance = balances.get(account.id) || account.initial_balance || 0
    setEditingAccount(account)
    form.setValue("name", account.name)
    form.setValue("type", account.type)
    form.setValue("currency", account.currency)
    form.setValue("initial_balance", account.initial_balance || undefined)
    setIsDialogOpen(true)
  }

  const handleArchive = async (account: any) => {
    const newArchivedState = !account.is_archived
    const result = await archiveAccount(account.id, newArchivedState)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Account ${newArchivedState ? "archived" : "unarchived"} successfully!`)
      loadData()
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAccount(null)
form.reset({ name: "", type: "checking", currency: "USD", initial_balance: undefined })
  }

  const accountTypes = ["checking", "savings", "credit_card", "cash", "investment"]
  const currencies = ["USD", "EUR", "GBP", "INR"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                Manage your financial accounts. Transactions require an account.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAccount(null)
form.reset({ name: "", type: "checking", currency: "USD", initial_balance: undefined })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />New Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Edit Account" : "Create Account"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Main Checking" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select account type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type} value={type}>{accountTypeLabels[type]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="currency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {currencies.map((cur) => (
                              <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="initial_balance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Balance ({preferences.currency})</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                        <FormDescription>Starting balance for this account</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Saving..." : (editingAccount ? "Update Account" : "Create Account")}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No accounts yet. Create your first account to get started.</p>
              <p className="text-sm mt-1">You'll need an account before creating transactions.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Initial Balance</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const currentBalance = balances.get(account.id) ?? (account.initial_balance as number) ?? 0
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <span className="capitalize">{accountTypeLabels[account.type] || account.type}</span>
                      </TableCell>
                      <TableCell>{account.currency}</TableCell>
                      <TableCell>{formatCurrency(account.initial_balance || 0, account.currency || preferences.currency)}</TableCell>
                      <TableCell>
                        <span className={account.is_archived ? "text-muted-foreground line-through" : ""}>
                          {formatCurrency(currentBalance, account.currency || preferences.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_archived ? "secondary" : "default"} className={account.is_archived ? "bg-gray-500" : ""}>
                          {account.is_archived ? "Archived" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(account)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(account)}
                            title={account.is_archived ? "Unarchive" : "Archive"}
                          >
                            <Archive className={`h-4 w-4 ${account.is_archived ? "text-green-600" : "text-orange-600"}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
          <CardDescription>
            Archiving an account prevents new transactions from being created against it. Historical transactions and balances are preserved. Archived accounts can be unarchived at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• All transactions require an account. Create at least one account before adding transactions.</li>
            <li>• Investment accounts are required for investment purchases.</li>
            <li>• Account currency is immutable after creation.</li>
            <li>• Archived accounts retain their full transaction history and balances.</li>
            <li>• The database prevents transactions on archived accounts.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}