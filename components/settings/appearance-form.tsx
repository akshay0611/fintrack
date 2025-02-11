"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingTheme, setPendingTheme] = useState<AppearanceFormValues["theme"] | null>(null)

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
    },
  })

  useEffect(() => {
    form.reset({ theme: (theme as "light" | "dark" | "system") || "system" })
  }, [theme, form])

  function onSubmit(data: AppearanceFormValues) {
    setPendingTheme(data.theme)
    setShowConfirmDialog(true)
  }

  function confirmThemeChange() {
    if (pendingTheme) {
      setTheme(pendingTheme)
      toast.success("Appearance updated successfully!")
    }
    setShowConfirmDialog(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the appearance of the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {["light", "dark", "system"].map((themeOption) => (
                        <FormItem key={themeOption}>
                          <FormControl>
                            <div className="items-center rounded-lg border-2 border-muted p-1 hover:border-accent transition-all duration-200">
                              <RadioGroupItem
                                value={themeOption}
                                id={themeOption}
                                className="sr-only"
                              />
                              <label
                                htmlFor={themeOption}
                                className="block cursor-pointer rounded-md p-2 text-center font-normal hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                              >
                                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select the theme for the application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Update Appearance</Button>
          </form>
        </Form>
      </CardContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Theme Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the theme to {pendingTheme}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmThemeChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

