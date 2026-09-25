"use client"

import { useState, useCallback } from "react"

interface DateRange { from: Date; to?: Date }

interface DateRangeState {
  dateRange: DateRange
  timePeriod: string
  setDateRange: (range: DateRange) => void
  setTimePeriod: (period: string) => void
}

export function useDateRangeStore() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() })
  const [timePeriod, setTimePeriod] = useState("today")

  const updateDateRangeByPeriod = useCallback((period: string) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    let from: Date
    let to: Date | undefined = new Date()

    switch (period) {
      case "today": from = new Date(year, month, today.getDate()); break
      case "last7days": from = new Date(today); from.setDate(today.getDate() - 7); break
      case "last30days": from = new Date(today); from.setDate(today.getDate() - 30); break
      case "monthToDate": from = new Date(year, month, 1); break
      case "yearToDate": from = new Date(year, 0, 1); break
      default: from = new Date(year, 0, 1);
    }

    setDateRange({ from, to })
    setTimePeriod(period)
  }, [])

  return { dateRange, timePeriod, setDateRange, setTimePeriod, updateDateRangeByPeriod }
}
