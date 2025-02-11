"use client"

import { useIncomeStore } from "./income-data"
import { useExpenseStore } from "./expenses-data"
import { useInvestmentStore } from "./investments-data"
import { useSubscriptionStore } from "./subscriptions-data"
import type { DateRange } from "react-day-picker"
import { useMemo } from "react"

export const useDashboardData = (dateRange: DateRange) => {
  const incomes = useIncomeStore((state) => state.incomes)
  const expenses = useExpenseStore((state) => state.expenses)
  const investments = useInvestmentStore((state) => state.investments)
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)

  return useMemo(() => {
    const filterByDateRange = (items: any[]) => {
      return items.filter((item) => {
        const itemDate = new Date(item.date)
        return (!dateRange?.from || itemDate >= dateRange.from) && (!dateRange?.to || itemDate <= dateRange.to)
      })
    }

    const filteredIncomes = filterByDateRange(incomes)
    const filteredExpenses = filterByDateRange(expenses)
    const filteredInvestments = filterByDateRange(investments)

    const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalInvestments = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0)
    const monthlySubscriptionCost = subscriptions.reduce((sum, subscription) => {
      if (subscription.billingCycle === "monthly") {
        return sum + subscription.amount
      }
      return sum
    }, 0)

    const availableBalance = totalIncome - totalExpenses - totalInvestments - monthlySubscriptionCost
    const totalSavings = totalIncome - totalExpenses - monthlySubscriptionCost

    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      monthlySubscriptionCost,
      availableBalance,
      totalSavings,
    }
  }, [incomes, expenses, investments, subscriptions, dateRange])
}

export const useRecentTransactions = (dateRange: DateRange) => {
  const incomes = useIncomeStore((state) => state.incomes)
  const expenses = useExpenseStore((state) => state.expenses)
  const investments = useInvestmentStore((state) => state.investments)

  return useMemo(() => {
    const filterByDateRange = (items: any[]) => {
      return items.filter((item) => {
        const itemDate = new Date(item.date)
        return (!dateRange?.from || itemDate >= dateRange.from) && (!dateRange?.to || itemDate <= dateRange.to)
      })
    }

    const allTransactions = [
      ...filterByDateRange(incomes.map((i) => ({ ...i, type: "income" }))),
      ...filterByDateRange(expenses.map((e) => ({ ...e, type: "expense" }))),
      ...filterByDateRange(investments.map((inv) => ({ ...inv, type: "investment" }))),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return allTransactions.slice(0, 5) // Return only the 5 most recent transactions
  }, [incomes, expenses, investments, dateRange])
}

