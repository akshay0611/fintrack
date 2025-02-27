"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
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

  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(groupedExpenses).map(([category, amount]) => ({
    category,
    amount
  }))

  return (
    <Card className={`${className} shadow-lg transition-all hover:shadow-xl`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-primary">
          Expenses by Category
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          Breakdown of expenses for the selected date range
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer
          config={{
            amount: {
              label: "Amount",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
            >
              <defs>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1C3FAA" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted))" 
                vertical={false} 
              />
              
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={(value) => `₹${value}`}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-background/95 backdrop-blur-sm" />}
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Amount"]}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
              />
              
              <Bar 
                dataKey="amount" 
                fill="url(#amountGradient)" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={48}
                animationDuration={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}