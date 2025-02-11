"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./profile-form"
import { PreferencesForm } from "./preferences-form"
import { NotificationsForm } from "./notifications-form"
import { AppearanceForm } from "./appearance-form"

export default function SettingsTabs() {  // Change to `export default`
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-4">
        <ProfileForm />
      </TabsContent>
      <TabsContent value="preferences" className="space-y-4">
        <PreferencesForm />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <NotificationsForm />
      </TabsContent>
      <TabsContent value="appearance" className="space-y-4">
        <AppearanceForm />
      </TabsContent>
    </Tabs>
  )
}

