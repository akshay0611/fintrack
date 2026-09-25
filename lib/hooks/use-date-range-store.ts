"use client"

import { create } from "zustand"

interface DateRange {
  from: Date
  to?: Date
}

interface DateRangeState {
  dateRange: DateRange
  timePeriod: string
  setDateRange: (range: DateRange) => void
  setTimePeriod: (period: string) => void
  updateDateRangeByPeriod: (period: string) => void
}

function resolvePeriodRange(period: string): DateRange {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  let from: Date
  let to: Date | undefined = new Date()

  switch (period) {
    case "today":
      from = new Date(year, month, today.getDate())
      break
    case "last7days":
      from = new Date(today)
      from.setDate(today.getDate() - 7)
      break
    case "last30days":
      from = new Date(today)
      from.setDate(today.getDate() - 30)
      break
    case "monthToDate":
      from = new Date(year, month, 1)
      break
    case "yearToDate":
      from = new Date(year, 0, 1)
      break
    default:
      from = new Date(year, 0, 1)
  }

  return { from, to }
}

const initialPeriod = "yearToDate"

export const useDateRangeStore = create<DateRangeState>((set) => ({
  dateRange: resolvePeriodRange(initialPeriod),
  timePeriod: initialPeriod,
  setDateRange: (range) => set({ dateRange: range }),
  setTimePeriod: (period) => set({ timePeriod: period }),
  updateDateRangeByPeriod: (period) =>
    set({ dateRange: resolvePeriodRange(period), timePeriod: period }),
}))