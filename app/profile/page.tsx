"use client"

import useProfileForm from "@/hooks/useProfileForm"
import AvatarEvolutionPanel from "@/components/profile/AvatarEvolutionPanel"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileLoginRequiredCard from "@/components/profile/ProfileLoginRequiredCard"
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"

export default function ProfilePage() {
  const {
    userId,
    email,
    username,
    setUsername,
    message,
    errorMessage,
    isLoading,
    isSaving,
    handleSave,
  } = useProfileForm()

  if (isLoading) {
    return (
      <PageShell>
        <ProfileHeader />
        <SectionCard>読み込み中...</SectionCard>
      </PageShell>
    )
  }

  if (!userId) {
    return (
      <PageShell>
        <ProfileHeader />
        <ProfileLoginRequiredCard />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <ProfileHeader />

      <ProfileSummaryCard userId={userId} email={email} username={username} />

      <ProfileEditForm
        username={username}
        onUsernameChange={setUsername}
        message={message}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <AvatarEvolutionPanel />
    </PageShell>
  )
}
