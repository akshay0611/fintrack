"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useInvestmentStore } from "@/lib/investments-data"
import { EditInvestmentForm } from "./edit-investment-form"
import { Plus, Search, Trash2, ChevronDown, ArrowUpDown } from 'lucide-react'
import { toast } from "sonner"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency, formatDate } from "@/lib/format-utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddInvestmentDialog } from "./add-investment-dialog"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subWeeks, subMonths, isWithinInterval } from "date-fns"

type TimeFilter = 'all' | 'this_week' | 'this_month' | 'past_week' | 'past_month'
type SortDirection = 'asc' | 'desc'
type SortField = 'name' | 'units' | 'price' | 'amount' | 'date' | 'category' | 'notes'

interface Column {
  id: SortField
  label: string
  isVisible: boolean
}

interface SortState {
  field: SortField
  direction: SortDirection
}

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
  
  const investments = useInvestmentStore((state) => state.investments)
  const deleteInvestment = useInvestmentStore((state) => state.deleteInvestment)
  const { preferences } = usePreferences()

  const getTimeFilteredInvestments = (investments: any[], filter: TimeFilter) => {
    const now = new Date()

    const isDateInRange = (date: Date, start: Date, end: Date) => {
      return isWithinInterval(date, { start, end })
    }

    return investments.filter(investment => {
      const investmentDate = new Date(investment.date)

      switch (filter) {
        case 'this_week': {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
          return isDateInRange(investmentDate, weekStart, weekEnd)
        }
        case 'this_month': {
          const monthStart = startOfMonth(now)
          const monthEnd = endOfMonth(now)
          return isDateInRange(investmentDate, monthStart, monthEnd)
        }
        case 'past_week': {
          const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
          const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
          return isDateInRange(investmentDate, lastWeekStart, lastWeekEnd)
        }
        case 'past_month': {
          const lastMonthStart = startOfMonth(subMonths(now, 1))
          const lastMonthEnd = endOfMonth(subMonths(now, 1))
          return isDateInRange(investmentDate, lastMonthStart, lastMonthEnd)
        }
        default:
          return true
      }
    })
  }

  const sortInvestments = (investments: any[]) => {
    return [...investments].sort((a, b) => {
      const modifier = sort.direction === 'asc' ? 1 : -1
      
      switch (sort.field) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '') * modifier
        case 'units':
          return (a.units - b.units) * modifier
        case 'price':
          return (a.price - b.price) * modifier
        case 'amount':
          return (a.amount - b.amount) * modifier
        case 'date':
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier
        case 'category':
          return a.category.localeCompare(b.category) * modifier
        case 'notes':
          return (a.notes || '').localeCompare(b.notes || '') * modifier
        default:
          return 0
      }
    })
  }

  const filteredInvestments = useMemo(() => {
    let filtered = getTimeFilteredInvestments(investments, timeFilter)
    
    filtered = filtered.filter(investment => {
      const matchesSearch = (investment.name?.toLowerCase().includes(search.toLowerCase()) ||
                           investment.category.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = category === "all" || investment.category === category
      return matchesSearch && matchesCategory
    })

    return sortInvestments(filtered)
  }, [investments, search, category, timeFilter, sort])

  const handleDelete = (id: string) => {
    deleteInvestment(id)
    toast.success("Investment deleted successfully!")
  }

  const toggleColumn = (columnId: SortField) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
    ))
  }

  const toggleSort = (field: SortField) => {
    setSort(current => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const visibleColumns = columns.filter(col => col.isVisible)

  const totalAmount = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0)

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div>
              <CardTitle>Investment History</CardTitle>
              <CardDescription>
                View and manage your investments
              </CardDescription>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">TOTAL INVESTMENTS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvestments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">TOTAL AMOUNT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalAmount, preferences.currency)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
                <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="bonds">Bonds</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="past_week">Past Week</SelectItem>
                <SelectItem value="past_month">Past Month</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.isVisible}
                    onCheckedChange={() => toggleColumn(column.id)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.id} className="cursor-pointer" onClick={() => toggleSort(column.id)}>
                      <div className="flex items-center gap-1">
                        {column.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="text-center text-muted-foreground">
                      No investment entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvestments.map((item) => (
                    <TableRow key={item.id}>
                      {columns.find(col => col.id === 'name')?.isVisible && (
                        <TableCell>{item.name}</TableCell>
                      )}
                      {columns.find(col => col.id === 'units')?.isVisible && (
                        <TableCell>{item.units}</TableCell>
                      )}
                      {columns.find(col => col.id === 'price')?.isVisible && (
                        <TableCell>{formatCurrency(item.price, preferences.currency)}</TableCell>
                      )}
                      {columns.find(col => col.id === 'amount')?.isVisible && (
                        <TableCell>{formatCurrency(item.amount, preferences.currency)}</TableCell>
                      )}
                      {columns.find(col => col.id === 'date')?.isVisible && (
                        <TableCell>{formatDate(item.date, preferences.dateFormat)}</TableCell>
                      )}
                      {columns.find(col => col.id === 'category')?.isVisible && (
                        <TableCell className="capitalize">{item.category.replace('_', ' ')}</TableCell>
                      )}
                      {columns.find(col => col.id === 'notes')?.isVisible && (
                        <TableCell>{item.notes}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <EditInvestmentForm investment={item} />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete investment</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add investment</span>
        </Button>
      </div>
      <AddInvestmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </Card>
  )
}

