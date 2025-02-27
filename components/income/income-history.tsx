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
import { useIncomeStore } from "@/lib/income-data"
import { EditIncomeForm } from "./edit-income-form"
import { Plus, Search, Trash2, ChevronDown } from 'lucide-react'
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
import { AddIncomeDialog } from "./add-income-dialog"
import { 
  startOfWeek, 
  startOfMonth, 
  endOfWeek, 
  endOfMonth, 
  subWeeks, 
  subMonths, 
  isWithinInterval 
} from "date-fns"

type TimeFilter = 'all' | 'this_week' | 'this_month' | 'past_week' | 'past_month'

interface Column {
  id: string
  label: string
  isVisible: boolean
}

export function IncomeHistory() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Name', isVisible: true },
    { id: 'amount', label: 'Amount', isVisible: true },
    { id: 'date', label: 'Received Date', isVisible: true },
    { id: 'category', label: 'Category', isVisible: true },
    { id: 'description', label: 'Notes', isVisible: true },
    { id: 'actions', label: 'Actions', isVisible: true },
  ])

  const incomes = useIncomeStore((state) => state.incomes)
  const deleteIncome = useIncomeStore((state) => state.deleteIncome)
  const { preferences } = usePreferences()

  // Helper function to check if a date is within an interval
  const isDateInRange = (date: Date, start: Date, end: Date) => {
    return isWithinInterval(date, { start, end })
  }

  const getTimeFilteredIncomes = (incomes: any[], filter: TimeFilter) => {
    const now = new Date()

    return incomes.filter(income => {
      const incomeDate = new Date(income.date)
      switch (filter) {
        case 'this_week': {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
          return isDateInRange(incomeDate, weekStart, weekEnd)
        }
        case 'this_month': {
          const monthStart = startOfMonth(now)
          const monthEnd = endOfMonth(now)
          return isDateInRange(incomeDate, monthStart, monthEnd)
        }
        case 'past_week': {
          const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
          const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
          return isDateInRange(incomeDate, lastWeekStart, lastWeekEnd)
        }
        case 'past_month': {
          const lastMonthStart = startOfMonth(subMonths(now, 1))
          const lastMonthEnd = endOfMonth(subMonths(now, 1))
          return isDateInRange(incomeDate, lastMonthStart, lastMonthEnd)
        }
        default:
          return true
      }
    })
  }

  const filteredIncomes = useMemo(() => {
    return getTimeFilteredIncomes(incomes, timeFilter).filter(income => {
      const matchesSearch =
        income.description?.toLowerCase().includes(search.toLowerCase()) ||
        income.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === "all" || income.category === category
      return matchesSearch && matchesCategory
    })
  }, [incomes, search, category, timeFilter])

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      toast.success("Income deleted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete income")
    }
  }

  const toggleColumn = (columnId: string) => {
    setColumns((prevColumns) =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    )
  }

  const visibleColumns = columns.filter(col => col.isVisible)

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Income History</CardTitle>
            <CardDescription>
              View all your income transactions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="investments">Investments</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={timeFilter}
            onValueChange={(value: TimeFilter) => setTimeFilter(value)}
          >
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
              <Button variant="outline" className="ml-auto">
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
                  <TableHead key={column.id}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center text-muted-foreground">
                    No income entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncomes.map((item) => (
                  <TableRow key={item.id}>
                    {columns.find(col => col.id === 'name')?.isVisible && (
                      <TableCell>{item.description}</TableCell>
                    )}
                    {columns.find(col => col.id === 'amount')?.isVisible && (
                      <TableCell>{formatCurrency(item.amount, preferences.currency)}</TableCell>
                    )}
                    {columns.find(col => col.id === 'date')?.isVisible && (
                      <TableCell>{formatDate(item.date, preferences.dateFormat)}</TableCell>
                    )}
                    {columns.find(col => col.id === 'category')?.isVisible && (
                      <TableCell className="capitalize">{item.category}</TableCell>
                    )}
                    {columns.find(col => col.id === 'description')?.isVisible && (
                      <TableCell>{item.description}</TableCell>
                    )}
                    {columns.find(col => col.id === 'actions')?.isVisible && (
                      <TableCell className="text-right">
                        <EditIncomeForm income={item} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete income</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          size="icon"
           className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add expense</span>
        </Button>
      </div>
      <AddIncomeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </Card>
  )
}