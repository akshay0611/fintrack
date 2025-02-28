// components/date-range-picker.tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDateRangeStore } from "@/components/overview"; // Adjust the import path based on your file structure

interface DateRange {
  from: Date;
  to?: Date;
}

export function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRangeStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col space-y-2 p-2">
          <div className="flex space-x-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setDateRange({
                    from: range.from,
                    to: range.to || undefined,
                  });
                }
              }}
              numberOfMonths={2}
            />
          </div>
          <div className="flex justify-end space-x-2 p-2">
            <Button
              variant="outline"
              onClick={() => {
                setDateRange({
                  from: new Date(new Date().getFullYear(), 0, 1),
                  to: new Date(),
                });
              }}
            >
              Reset to Year
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}