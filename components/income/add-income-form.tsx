"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useIncomeStore } from "@/lib/income-data";
import { usePreferences } from "@/lib/preferences-context";

const formSchema = z.object({
  amount: z.preprocess(
    // Preprocess the input to convert it to a number
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().min(1, "Amount is required")
  ),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

interface AddIncomeFormProps {
  onSuccess?: () => void;
}

export function AddIncomeForm({ onSuccess }: AddIncomeFormProps) {
  const addIncome = useIncomeStore((state) => state.addIncome);
  const { preferences } = usePreferences();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0, // Initialize as a number
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const incomeData = {
      ...values,
      description: values.description || "", // Ensure description is always a string
    };

    // Await the addIncome call to handle errors appropriately
    try {
      await addIncome(incomeData);
      toast.success("Income added successfully!");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add income");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Amount ({currencySymbols[preferences.currency]})
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Monthly salary..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Add Income
        </Button>
      </form>
    </Form>
  );
}