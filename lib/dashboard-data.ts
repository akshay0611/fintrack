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
        const itemDate = new Date(item.date || item.startDate) // Use startDate for subscriptions if applicable
        return (!dateRange?.from || itemDate >= dateRange.from) && (!dateRange?.to || itemDate <= dateRange.to)
      })
    }

    const filteredIncomes = filterByDateRange(incomes)
    const filteredExpenses = filterByDateRange(expenses)
    const filteredInvestments = filterByDateRange(investments)
    const filteredSubscriptions = filterByDateRange(subscriptions) // Filter subscriptions by date range

    const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalInvestments = filteredInvestments.reduce((sum, investment) => sum + investment.amount, 0)

    // Raw total of monthly subscriptions (only active ones)
    const monthlySubscriptionCost = filteredSubscriptions.reduce((sum, subscription) => {
      if (subscription.billingCycle === "monthly" && subscription.status === "active") {
        return sum + subscription.amount
      }
      return sum
    }, 0)

    // Raw total of yearly subscriptions (only active ones)
    const yearlySubscriptionCost = filteredSubscriptions.reduce((sum, subscription) => {
      if (subscription.billingCycle === "yearly" && subscription.status === "active") {
        return sum + subscription.amount
      }
      return sum
    }, 0)

    // Adjust availableBalance and totalSavings to account for both monthly and yearly costs if needed
    const availableBalance = totalIncome - totalExpenses - totalInvestments - monthlySubscriptionCost - (yearlySubscriptionCost / 12)
    const totalSavings = totalIncome - totalExpenses - monthlySubscriptionCost - (yearlySubscriptionCost / 12)

    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      monthlySubscriptionCost, // Raw monthly total
      availableBalance,
      totalSavings,
      yearlySubscriptionCost, // Raw yearly total
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