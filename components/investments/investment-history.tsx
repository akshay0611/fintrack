"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditInvestmentForm } from "./edit-investment-form"
import { Plus, Search, Trash2, ChevronDown, ArrowUpDown } from 'lucide-react'
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency, formatDate } from "@/lib/format-utils"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddInvestmentDialog } from "./add-investment-dialog"
import { createInvestmentPurchase, deleteInvestmentHolding, getInvestmentHoldings } from "@/lib/actions/investments"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subWeeks, subMonths, isWithinInterval } from "date-fns"

const categoryToEmoji: Record<string, string> = { stocks: '📈', mutual_funds: '📊', real_estate: '🏢', crypto: '₿', bonds: '📜', gold: '🥇', other: '📦' }

type TimeFilter = 'all' | 'this_week' | 'this_month' | 'past_week' | 'past_month'
type SortDirection = 'asc' | 'desc'
type SortField = 'name' | 'units' | 'price' | 'amount' | 'date' | 'category' | 'notes'

interface Column { id: SortField; label: string; isVisible: boolean }
interface SortState { field: SortField; direction: SortDirection }
interface Investment { id: string; name: string; units: number; unit_price: number; amount: number; purchase_date: string; category: string; notes: string }

export function InvestmentHistory() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [sort, setSort] = useState<SortState>({ field: 'date', direction: 'desc' })
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Name', isVisible: true },
    { id: 'units', label: 'Units', isVisible: true },
    { id: 'price', label: 'Single Stock Price', isVisible: true },
    { id: 'amount', label: 'Total Amount', isVisible: true },
    { id: 'date', label: 'Bought Date', isVisible: true },
    { id: 'category', label: 'Category', isVisible: true },
    { id: 'notes', label: 'Notes', isVisible: true },
  ])
  const [investments, setInvestments] = useState<Investment[]>([])
  const { preferences } = usePreferences()

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const result = await getInvestmentHoldings()
        if (result.data) { setInvestments(result.data) }
      } catch (error) { console.error("Failed to fetch investments:", error) }
    }
    loadInvestments()
  }, [])

  const getTimeFilteredInvestments = (items: Investment[], filter: TimeFilter) => {
    const now = new Date()
    const isDateInRange = (date: Date, start: Date, end: Date) => isWithinInterval(date, { start, end })
    return items.filter(inv => {
      const investmentDate = new Date(inv.purchase_date)
      switch (filter) {
        case 'this_week': return isDateInRange(investmentDate, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))
        case 'this_month': return isDateInRange(investmentDate, startOfMonth(now), endOfMonth(now))
        case 'past_week': return isDateInRange(investmentDate, startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }))
        case 'past_month': return isDateInRange(investmentDate, startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1)))
        default: return true
      }
    })
  }

  const sortInvestments = (items: Investment[]) => {
    return [...items].sort((a, b) => {
      const modifier = sort.direction === 'asc' ? 1 : -1
      switch (sort.field) {
        case 'name': return (a.name || '').localeCompare(b.name || '') * modifier
        case 'units': return (a.units - b.units) * modifier
        case 'price': return (a.unit_price - b.unit_price) * modifier
        case 'amount': return (a.amount - b.amount) * modifier
        case 'date': return (new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()) * modifier
        case 'category': return a.category.localeCompare(b.category) * modifier
        case 'notes': return (a.notes || '').localeCompare(b.notes || '') * modifier
        default: return 0
      }
    })
  }

  const filteredInvestments = useMemo(() => {
    let filtered = getTimeFilteredInvestments(investments, timeFilter)
    filtered = filtered.filter(inv => {
      const matchesSearch = (inv.name?.toLowerCase().includes(search.toLowerCase()) || inv.category.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = category === "all" || inv.category === category
      return matchesSearch && matchesCategory
    })
    return sortInvestments(filtered)
  }, [investments, search, category, timeFilter, sort])

  const handleDelete = async (id: string) => {
    const result = await deleteInvestmentHolding(id)
    if (result.error) { toast.error(result.error) } else { setInvestments(investments.filter(i => i.id !== id)); toast.success("Investment deleted successfully!") }
  }

  const toggleColumn = (columnId: SortField) => {
    setColumns(columns.map(col => col.id === columnId ? { ...col, isVisible: !col.isVisible } : col))
  }
  const toggleSort = (field: SortField) => {
    setSort(current => ({ field, direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc' }))
  }
  const visibleColumns = columns.filter(col => col.isVisible)
  const totalAmount = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <Card className="col-span-full">
      <CardHeader><CardTitle>Investment History</CardTitle><CardDescription>View and manage your investments</CardDescription></CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader className="py-4"><CardTitle className="text-sm font-medium">TOTAL INVESTMENTS</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filteredInvestments.length}</div></CardContent></Card>
          <Card><CardHeader className="py-4"><CardTitle className="text-sm font-medium">TOTAL AMOUNT</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalAmount, preferences.currency)}</div></CardContent></Card>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1"><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Filter by name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" /></div></div>
            <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="stocks">Stocks</SelectItem><SelectItem value="mutual_funds">Mutual Funds</SelectItem><SelectItem value="real_estate">Real Estate</SelectItem><SelectItem value="crypto">Cryptocurrency</SelectItem><SelectItem value="bonds">Bonds</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
            <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Time Period" /></SelectTrigger><SelectContent><SelectItem value="all">All Time</SelectItem><SelectItem value="this_week">This Week</SelectItem><SelectItem value="this_month">This Month</SelectItem><SelectItem value="past_week">Past Week</SelectItem><SelectItem value="past_month">Past Month</SelectItem></SelectContent></Select>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{columns.map((column) => (<DropdownMenuCheckboxItem key={column.id} checked={column.isVisible} onCheckedChange={() => toggleColumn(column.id)}>{column.label}</DropdownMenuCheckboxItem>))}</DropdownMenuContent></DropdownMenu>
          </div>
          <div className="rounded-md border"><Table><TableHeader><TableRow>{visibleColumns.map((column) => (<TableHead key={column.id} className="cursor-pointer" onClick={() => toggleSort(column.id)}><div className="flex items-center gap-1">{column.label} <ArrowUpDown className="h-4 w-4" /></div></TableHead>))}<TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
            {filteredInvestments.length === 0 ? (<TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center text-muted-foreground">No investment entries found</TableCell></TableRow>) : (
              filteredInvestments.map((item) => (<TableRow key={item.id}>
                {columns.find(col => col.id === 'name')?.isVisible && <TableCell>{item.name}</TableCell>}
                {columns.find(col => col.id === 'units')?.isVisible && <TableCell>{item.units}</TableCell>}
                {columns.find(col => col.id === 'price')?.isVisible && <TableCell>{formatCurrency(item.unit_price, preferences.currency)}</TableCell>}
                {columns.find(col => col.id === 'amount')?.isVisible && <TableCell>{formatCurrency(item.amount, preferences.currency)}</TableCell>}
                {columns.find(col => col.id === 'date')?.isVisible && <TableCell>{formatDate(item.purchase_date, preferences.dateFormat)}</TableCell>}
                {columns.find(col => col.id === 'category')?.isVisible && <TableCell className="capitalize">{item.category.replace('_', ' ')}</TableCell>}
                {columns.find(col => col.id === 'notes')?.isVisible && <TableCell>{item.notes}</TableCell>}
                <TableCell className="text-right"><EditInvestmentForm investment={item} /><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete investment</span></Button></TableCell>
              </TableRow>))
            )}
          </TableBody></Table></div>
        </div>
      </CardContent>
      <div className="fixed bottom-8 right-8"><Button onClick={() => setIsAddDialogOpen(true)} size="icon" className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"><Plus className="h-6 w-6" /><span className="sr-only">Add investment</span></Button></div>
      <AddInvestmentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </Card>
  )
}
