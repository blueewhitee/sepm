"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, LogOut, Loader2, UserCircle, Mail, AlertCircle, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import VerificationRequestCard from "@/components/verification-request-card"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut, isVerified } = useAuth()
  const [isProcessingSignOut, setIsProcessingSignOut] = useState(false)
  const [verificationLink, setVerificationLink] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasApprovedRequests, setHasApprovedRequests] = useState(false)
  const [isSubmittingCheck, setIsSubmittingCheck] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add a key to force refresh

  // Function to check verification status
  const checkVerificationStatus = async (userId) => {
    if (!userId) return;
    
    try {
      console.log("Checking verification status for user:", userId);
      
      // IMPORTANT: Do a direct database fetch with no caching to get the latest status
      const { data, error } = await supabase
        .from("users")
        .select("id_verified, face_verified") // Fetches the relevant fields
        .eq("id", userId)
        .single()
         // Add this to prevent caching issues
      
      console.log("DEBUG - User ID:", userId);
      console.log("DEBUG - Database response:", data);

      if (!error && data) {
        // Correctly checks if BOTH are true
        const isVerified = data.id_verified && data.face_verified; 
        console.log("Raw verification data:", data);
        console.log("Verification status updated:", isVerified);
        
        // Updates the state used for display
        setVerificationStatus(isVerified); 
        return isVerified;
      } else if (error) {
        console.error("Error in verification status check:", error);
      }
      return false;
    } catch (error) {
      console.error("Exception checking verification status:", error);
      return false;
    }
  };

  // Set up a periodic check for verification status changes
  useEffect(() => {
    if (user) {
      // Check immediately when component mounts or refreshKey changes
      checkVerificationStatus(user.id);
      
      // Set up interval to check periodically (every 5 seconds)
      const intervalId = setInterval(() => {
        checkVerificationStatus(user.id);
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, refreshKey]); // Remove verificationStatus dependency to prevent stopping checks

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      // Check if user is admin
      const checkAdminStatus = async () => {
        // Check if email matches admin email
        if (user.email === 'admin@urban.couch') {
          setIsAdmin(true);
        } else {
          // Check database flag
          try {
            const { data, error } = await supabase
              .from("users")
              .select("is_admin")
              .eq("id", user.id)
              .single();
            
            if (!error && data && data.is_admin === true) {
              setIsAdmin(true);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        }
      };

      // Fetch the verification link from the database
      const fetchVerificationData = async () => {
        try {
          // First try to get link from user table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("verification_link")
            .eq("id", user.id)
            .single();
          
          if (!userError && userData && userData.verification_link) {
            setVerificationLink(userData.verification_link);
            return; // We found the link in the user table, no need to check verification_requests
          }
          
          if (userError) {
            console.warn("Error fetching user verification link:", userError);
          }
          
          // If we didn't find a link in the user table, check verification_requests
          const { data: requestsData, error: requestsError } = await supabase
            .from("verification_requests")
            .select("verification_link, status")
            .eq("user_id", user.id)
            .eq("status", "approved")
            .order("processed_at", { ascending: false })
            .limit(1);
          
          if (requestsError) {
            console.error("Error fetching verification requests:", requestsError);
            return;
          }
          
          if (requestsData && requestsData.length > 0 && requestsData[0].verification_link) {
            setVerificationLink(requestsData[0].verification_link);
            setHasApprovedRequests(true);
            
            // Update the user record with the verification link from the request
            // This ensures the link is available in both places for future requests
            const { error: updateError } = await supabase
              .from("users")
              .update({ verification_link: requestsData[0].verification_link })
              .eq("id", user.id);
              
            if (updateError) {
              console.error("Error updating user with verification link:", updateError);
            }
          } else if (requestsData && requestsData.length > 0) {
            // User has approved requests but no link yet
            setHasApprovedRequests(true);
          }
        } catch (error) {
          console.error("Error fetching verification data:", error);
        }
      };
      
      checkVerificationStatus(user.id);
      checkAdminStatus();
      fetchVerificationData();
    }
  }, [user, isLoading, router, refreshKey])

  // Add a function to manually refresh status
  const handleRefreshStatus = () => {
    if (user) {
      setRefreshKey(prev => prev + 1);
    }
  };

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

              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification Status</p>
                  {verificationStatus ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <p className="font-medium">Verified</p>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <p className="font-medium">Not Verified</p>
                    </div>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <div className="mt-2">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Admin</Badge>
                </div>
              )}
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

          {/* Verification Request Card */}
          {user && (
            <VerificationRequestCard
              userId={user.id}
              isIdVerified={verificationStatus}
              isFaceVerified={verificationStatus}
              onRequestSuccess={handleRefreshStatus}
            />
          )}

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAdmin ? (
                <Alert className="bg-purple-50 text-purple-800 border-purple-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Admin Account</AlertTitle>
                  <AlertDescription>
                    You have administrator privileges. You can access the admin dashboard to manage users and verification requests.
                  </AlertDescription>
                </Alert>
              ) : verificationStatus ? (
                <Alert className="bg-green-50 text-green-700 border-green-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Complete</AlertTitle>
                  <AlertDescription>
                    Your account has been fully verified. You can access all platform features.
                  </AlertDescription>
                </Alert>
              ) : verificationLink ? (
                <Alert className="bg-blue-50 text-blue-700 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Link Available</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Please use the link below to complete your verification:</p>
                    <div className="flex items-center justify-between rounded-md border p-2 mt-2">
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {verificationLink}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(verificationLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
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
              
              {isAdmin && (
                <Button variant="default" onClick={() => router.push('/admin')} className="w-full bg-purple-600 hover:bg-purple-700">
                  Go to Admin Dashboard
                </Button>
              )}
              
              <Button variant="outline" onClick={() => router.push('/auth/change-password')} className="w-full">
                Change Password
              </Button>

              <Button variant="outline" onClick={() => router.push('/auth/update-profile')} className="w-full">
                Update Profile
              </Button>

              <Button variant="outline" onClick={handleRefreshStatus} className="w-full">
                Refresh Verification Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
