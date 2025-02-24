"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useExpenseStore } from "@/lib/expenses-data"
import { DateRange } from "react-day-picker"

interface ReportsProps {
  className?: string
  dateRange: DateRange | undefined
}

export function Reports({ className, dateRange }: ReportsProps) {
  const expenses = useExpenseStore((state) => state.expenses)
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return (!dateRange?.from || expenseDate >= dateRange.from) &&
           (!dateRange?.to || expenseDate <= dateRange.to)
  })

  // Group expenses by category
  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0
    }
    acc[expense.category] += expense.amount
    return acc
  }, {} as Record<string, number>)

  // Convert grouped expenses to chart data format
  const data = Object.entries(groupedExpenses).map(([category, amount]) => ({
    category,
    amount
  }))

  return (
    <Card className={`${className} w-full`}>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Breakdown of expenses for the selected date range.</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer
          config={{
            amount: {
              label: "Amount",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="amount" 
                fill="var(--color-amount)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

