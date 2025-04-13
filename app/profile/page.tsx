"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserVerification } from "@/lib/database"

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  const handleVerifyID = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Simulate ID verification
      setTimeout(async () => {
        await updateUserVerification(user.id, "id_verified", true)
        setProfile((prev: any) => ({ ...prev, id_verified: true }))
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error verifying ID:", error)
      setLoading(false)
    }
  }

  const handleVerifyFace = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Simulate face verification
      setTimeout(async () => {
        await updateUserVerification(user.id, "face_verified", true)
        setProfile((prev: any) => ({ ...prev, face_verified: true }))
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error verifying face:", error)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading profile...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to view your profile. Please{" "}
            <a href="/auth/login" className="font-medium underline">
              login
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your account and verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm font-medium">Name:</p>
              <p className="text-sm">{profile.name}</p>
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm">{profile.email}</p>
              <p className="text-sm font-medium">Member Since:</p>
              <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Verification Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">ID Verification</p>
                  <p className="text-sm text-muted-foreground">Upload a government-issued ID for verification</p>
                </div>
                {profile.id_verified ? (
                  <div className="flex items-center text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <Button onClick={handleVerifyID} disabled={loading}>
                    {loading ? "Processing..." : "Verify ID"}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Face Verification</p>
                  <p className="text-sm text-muted-foreground">Take a selfie to verify your identity</p>
                </div>
                {profile.face_verified ? (
                  <div className="flex items-center text-green-600">
                    <Check className="mr-1 h-4 w-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <Button onClick={handleVerifyFace} disabled={loading || !profile.id_verified}>
                    {loading ? "Processing..." : "Verify Face"}
                  </Button>
                )}
              </div>
            </div>

            {profile.id_verified && profile.face_verified ? (
              <Alert className="bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Fully Verified</AlertTitle>
                <AlertDescription>
                  Your account is fully verified. You can now post and comment on the platform.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  You must complete both ID and face verification to post and comment on the platform.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
