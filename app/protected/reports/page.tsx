import { Reports } from "@/components/reports";
import { DateRangePicker } from "@/components/date-range-picker";

export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
        <DateRangePicker />
      </header>
      <Reports />
    </div>
  );
}