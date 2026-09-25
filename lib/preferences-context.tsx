"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { updateProfile } from '@/app/actions'
import { getPreferences } from '@/lib/actions/preferences'

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

interface Preferences {
  currency: Currency
  dateFormat: DateFormat
  displayName?: string
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreferences: (newPreferences: Partial<Preferences>) => Promise<void>
  loading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const result = await getPreferences()
        if (result.data) {
          setPreferences({
            currency: result.data.base_currency as Currency || 'INR',
            dateFormat: result.data.date_format as DateFormat || 'DD/MM/YYYY',
            displayName: result.data.display_name || undefined,
          })
        }
      } catch {
        // Keep defaults if server fetch fails
      } finally {
        setLoading(false)
      }
    }
    loadPreferences()
  }, [])

  const updatePreferences = async (newPreferences: Partial<Preferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
    await updateProfile({
      baseCurrency: updated.currency,
      dateFormat: updated.dateFormat,
    })
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
