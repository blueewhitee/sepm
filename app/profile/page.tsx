"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, LogOut, Loader2, UserCircle, Mail, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut, isVerified } = useAuth()
  const [isProcessingSignOut, setIsProcessingSignOut] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    setIsProcessingSignOut(true)
    try {
      const { success, error } = await signOut()
      
      if (!success) {
        throw error || new Error("Failed to sign out")
      }
      
      // Use replace instead of push to prevent going back to the profile page after logging out
      router.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      })
      setIsProcessingSignOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user && !isLoading) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{user?.user_metadata?.name || "Not available"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{user?.email || "Not available"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
                disabled={isProcessingSignOut}
              >
                {isProcessingSignOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isVerified ? (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Complete</AlertTitle>
                  <AlertDescription>
                    Your account has been fully verified. You can access all platform features.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Optional Verification</AlertTitle>
                  <AlertDescription>
                    Verification is now optional. You can still use most features without verification.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button variant="outline" onClick={() => router.push('/auth/change-password')} className="w-full">
                Change Password
              </Button>

              <Button variant="outline" onClick={() => router.push('/auth/update-profile')} className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
