"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRecentTransactions } from "@/lib/dashboard-data"
import { usePreferences } from "@/lib/preferences-context"
import { formatCurrency, formatDate } from "@/lib/format-utils"
import { DateRange } from "react-day-picker"

interface RecentTransactionsProps {
  className?: string
  dateRange: DateRange | undefined
}

export function RecentTransactions({ className, dateRange }: RecentTransactionsProps) {
  const recentTransactions = useRecentTransactions(dateRange ?? { from: new Date(), to: new Date() })
  const { preferences } = usePreferences()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>You made {recentTransactions.length} transactions recently.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] overflow-hidden">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.type === 'income' ? transaction.category :
                     transaction.type === 'expense' ? transaction.category :
                     transaction.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date, preferences.dateFormat)}
                  </p>
                </div>
                <div className={`ml-auto font-medium ${
                  transaction.type === 'income' ? 'text-green-500' :
                  transaction.type === 'expense' ? 'text-red-500' :
                  'text-blue-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, preferences.currency)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

