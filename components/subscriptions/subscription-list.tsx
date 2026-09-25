"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditSubscriptionForm } from "./edit-subscription-form"
import { Plus, Search, Trash2, ChevronDown, ArrowUpDown } from 'lucide-react'
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency, formatDate } from "@/lib/format-utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddSubscriptionDialog } from "./add-subscription-dialog"
import { getSubscriptions, deleteSubscription } from "@/lib/actions/subscriptions-v2"
import { getCategories } from "@/lib/actions/categories"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subWeeks, subMonths, isWithinInterval } from "date-fns"

type TimeFilter = 'all' | 'this_week' | 'this_month' | 'past_week' | 'past_month'
type SortDirection = 'asc' | 'desc'
type SortField = 'name' | 'price' | 'renewalDate' | 'startDate' | 'notes' | 'status'

interface Column { id: SortField; label: string; isVisible: boolean }
interface SortState { field: SortField; direction: SortDirection }
interface Subscription { id: string; name: string; amount: number; cycle: string; start_date: string; next_renewal_date: string; status: string; notes: string; category_id: string; category_name?: string }

export function SubscriptionList() {
  const [search, setSearch] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sort, setSort] = useState<SortState>({ field: 'name', direction: 'asc' })
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Name', isVisible: true },
    { id: 'price', label: 'Price', isVisible: true },
    { id: 'renewalDate', label: 'Renewal Date', isVisible: true },
    { id: 'startDate', label: 'Start/Cancel Date', isVisible: true },
    { id: 'notes', label: 'Notes', isVisible: true },
    { id: 'status', label: 'Status', isVisible: true },
  ])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])
  const { preferences } = usePreferences()

  async function loadData() {
    try {
      const result = await getSubscriptions()
      if (result.data) { setSubscriptions(result.data) }
    } catch (error) { console.error("Failed to load subscriptions:", error); toast.error("Failed to load subscriptions") }
    try {
      const catsResult = await getCategories("expense")
      if (catsResult.data) {
        setCategories(catsResult.data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon })))
      }
    } catch { }
  }

  useEffect(() => {
    loadData()
  }, [])

  const notifyChanged = () => {
    loadData()
    window.dispatchEvent(new CustomEvent("fintrack:subscriptions-changed"))
  }

  const sortSubscriptions = (items: Subscription[]) => {
    return [...items].sort((a, b) => {
      const modifier = sort.direction === 'asc' ? 1 : -1
      switch (sort.field) {
        case 'name': return a.name.localeCompare(b.name) * modifier
        case 'price': return (a.amount - b.amount) * modifier
        case 'renewalDate': return (new Date(a.next_renewal_date).getTime() - new Date(b.next_renewal_date).getTime()) * modifier
        case 'startDate': return (new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) * modifier
        case 'notes': return (a.notes || '').localeCompare(b.notes || '') * modifier
        case 'status': return a.status.localeCompare(b.status) * modifier
        default: return 0
      }
    })
  }

  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    return sortSubscriptions(filtered)
  }, [subscriptions, search, sort])

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteSubscription(id)
      if (result.error) { toast.error(result.error) } else { setSubscriptions(subscriptions.filter(s => s.id !== id)); toast.success("Subscription deleted successfully!"); notifyChanged() }
    } catch (error) { console.error("Error deleting subscription:", error); toast.error("Failed to delete subscription") }
  }

  const toggleColumn = (columnId: SortField) => {
    setColumns(columns.map(col => col.id === columnId ? { ...col, isVisible: !col.isVisible } : col))
  }
  const toggleSort = (field: SortField) => {
    setSort(current => ({ field, direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc' }))
  }
  const visibleColumns = columns.filter(col => col.isVisible)

  return (
    <Card className="col-span-full">
      <CardHeader><CardTitle>Subscription History</CardTitle><CardDescription>View and manage your subscriptions</CardDescription></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1"><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Filter by name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" /></div></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{columns.map((column) => (<DropdownMenuCheckboxItem key={column.id} checked={column.isVisible} onCheckedChange={() => toggleColumn(column.id)}>{column.label}</DropdownMenuCheckboxItem>))}</DropdownMenuContent></DropdownMenu>
          </div>
          <div className="rounded-md border"><Table><TableHeader><TableRow>{visibleColumns.map((column) => (<TableHead key={column.id} className="cursor-pointer" onClick={() => toggleSort(column.id)}><div className="flex items-center gap-1">{column.label} <ArrowUpDown className="h-4 w-4" /></div></TableHead>))}<TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
            {filteredSubscriptions.length === 0 ? (<TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center text-muted-foreground">No subscription entries found</TableCell></TableRow>) : (
              filteredSubscriptions.map((item) => (
                <TableRow key={item.id}>
                  {columns.find(col => col.id === 'name')?.isVisible && <TableCell>{item.name}</TableCell>}
                  {columns.find(col => col.id === 'price')?.isVisible && <TableCell>{formatCurrency(item.amount, preferences.currency)}</TableCell>}
                  {columns.find(col => col.id === 'renewalDate')?.isVisible && <TableCell>{formatDate(item.next_renewal_date, preferences.dateFormat)}</TableCell>}
                  {columns.find(col => col.id === 'startDate')?.isVisible && <TableCell>{formatDate(item.start_date, preferences.dateFormat)}</TableCell>}
                  {columns.find(col => col.id === 'notes')?.isVisible && <TableCell>{item.notes}</TableCell>}
                  {columns.find(col => col.id === 'status')?.isVisible && <TableCell><Badge variant="secondary" className={`${item.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>{item.status}</Badge></TableCell>}
                  <TableCell className="text-right"><EditSubscriptionForm subscription={item} onSuccess={notifyChanged} /><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete subscription</span></Button></TableCell>
                </TableRow>
              ))
            )}
          </TableBody></Table></div>
        </div>
      </CardContent>
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-8 sm:right-8"><Button onClick={() => setIsAddDialogOpen(true)} size="icon" className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"><Plus className="h-6 w-6" /><span className="sr-only">Add subscription</span></Button></div>
      <AddSubscriptionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={notifyChanged} />
    </Card>
  )
}