"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

interface Preferences {
  currency: Currency
  dateFormat: DateFormat
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreferences: (newPreferences: Partial<Preferences>) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>({
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  })

  useEffect(() => {
    const storedPreferences = localStorage.getItem('financeTrackerPreferences')
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences))
    }
  }, [])

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      localStorage.setItem('financeTrackerPreferences', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
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

