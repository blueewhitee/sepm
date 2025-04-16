"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, AlertTriangle, Users, RefreshCw, UserX, CheckCircle, XCircle, Mail, Link as LinkIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Add at the top of the file, after imports
interface User {
  id: string;
  name?: string;
  email: string;
  is_blocked?: boolean;
  verified?: boolean; // Using the single verified field from the schema
  verification_link?: string;
  created_at: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: "id" | "face" | "check";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  processed_at?: string;
  verification_link?: string;
  users?: {
    name?: string;
    email: string;
  };
}

// Admin role check - in a real app, you would store admin status in your database
const ADMIN_EMAILS = ['admin@urban.couch'];

// Admin role check - checking database flag
const checkIfUserIsAdmin = async (userId) => {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();
    
  if (error || !data) return false;
  return data.is_admin === true;
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<User[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [verificationLink, setVerificationLink] = useState("")
  const [currentRequestId, setCurrentRequestId] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      if (!isLoading) {
        if (!user) {
          router.push("/auth/login")
        } else {
          // First check hardcoded list for development
          const isInAdminList = ADMIN_EMAILS.includes(user.email);
          
          // Then check database flag
          const hasAdminFlag = await checkIfUserIsAdmin(user.id);
          
          const userIsAdmin = isInAdminList || hasAdminFlag;
          setIsAdmin(userIsAdmin)
          
          if (!userIsAdmin) {
            router.push("/dashboard")
          } else {
            fetchData()
          }
        }
      }
    }
    
    checkAdminStatus();
  }, [user, isLoading, router])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      // Fetch users with better error handling
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (usersError) {
        console.error("Error fetching users:", usersError)
        throw usersError
      }
      
      console.log("Fetched users:", usersData?.length || 0)
      setUsers(usersData || [])

      // Fetch verification requests with better error handling
      const { data: requestsData, error: requestsError } = await supabase
        .from("verification_requests")
        .select("*, user_id, users(email, name)") 
        .order("created_at", { ascending: false })
      
      if (requestsError) {
        console.error("Error fetching verification requests:", requestsError)
        throw requestsError
      }
      
      console.log("Fetched verification requests:", requestsData?.length || 0)
      setVerificationRequests(requestsData || [])

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleBlockUser = async (userId :string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_blocked: true })
        .eq("id", userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_blocked: true } : user
      ))
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  const handleUnblockUser = async (userId:string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_blocked: false })
        .eq("id", userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_blocked: false } : user
      ))
    } catch (error) {
      console.error("Error unblocking user:", error)
    }
  }

  const handleApproveVerification = async (
    requestId: string, 
    userId: string,
    verificationType: string
  ) => {
    try {
      // 1. Update request status
      const { error: updateError } = await supabase
        .from("verification_requests")
        .update({ status: "approved", processed_at: new Date().toISOString() })
        .eq("id", requestId)
      
      if (updateError) {
        console.error("Error updating verification request:", updateError);
        throw updateError;
      }

      // 2. Update the user's verification status
      // Using the correct column name 'verified' instead of 'verification_status'
      const { data: userData, error: userUpdateError } = await supabase
        .from("users")
        .update({ 
          verified: true // This matches your actual column name in the schema
        })
        .eq("id", userId)
        .select();
      
      if (userUpdateError) {
        console.error("Error updating user verification status:", userUpdateError);
        throw userUpdateError;
      }

      // 3. Update local state
      setVerificationRequests(verificationRequests.map(req => 
        req.id === requestId ? { ...req, status: "approved", processed_at: new Date().toISOString() } : req
      ));

      // Update the user's verification status in the users state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, verified: true } : user
      ));
      
      // Show success message
      alert("Verification request approved and user has been verified!");
    } catch (error) {
      console.error("Error approving verification:", error);
      alert(`Error approving verification: ${error.message || "Unknown error"}`);
    }
  }

  const handleRejectVerification = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("verification_requests")
        .update({ status: "rejected", processed_at: new Date().toISOString() })
        .eq("id", requestId)
      
      if (error) throw error
      
      // Update local state
      setVerificationRequests(verificationRequests.map(req => 
        req.id === requestId ? { ...req, status: "rejected", processed_at: new Date().toISOString() } : req
      ))
    } catch (error) {
      console.error("Error rejecting verification:", error)
    }
  }

  const openVerificationDialog = (requestId: string, userId: string) => {
    // Add a check to ensure userId is valid before opening
    if (!userId) {
        console.error("Cannot open verification dialog: User ID is missing for request ID:", requestId);
        alert("Error: Could not identify the user associated with this request.");
        return;
    }
    setCurrentRequestId(requestId);
    setCurrentUserId(userId); // This should now be a valid UUID
    setVerificationLink(""); // Reset link field
    setIsDialogOpen(true);
  }

  const submitVerificationLink = async () => {
    if (!verificationLink || !currentUserId) {
      alert("Error: Verification link and user ID are required");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Debug logging
      console.log("Attempting to update user:", currentUserId);
      console.log("Verification link:", verificationLink);
  
      // Update only the verification_link, not the verified status
      const userUpdateResponse = await supabase
        .from("users")
        .update({
          verification_link: verificationLink
          // Removed: verified: true - User will be verified after completing the verification process
        })
        .eq("id", currentUserId)
        .select(); // Add .select() to return the updated data
      
      // Log the entire response for debugging
      console.log("User update response:", userUpdateResponse);
      
      if (userUpdateResponse.error) {
        console.error("Failed to update user record:", userUpdateResponse.error);
        alert(`Error: Failed to update user: ${userUpdateResponse.error.message}`);
        setIsSubmitting(false);
        return;
      }
      
      if (!userUpdateResponse.data || userUpdateResponse.data.length === 0) {
        console.error("Update returned no data, user might not exist or you don't have permission");
        alert("Error: Could not verify the update was successful");
        setIsSubmitting(false);
        return;
      }
      
      console.log("User record updated successfully:", userUpdateResponse.data[0]);
      
      // Update verification request as a separate operation (non-blocking)
      try {
        const requestUpdateResponse = await supabase
          .from("verification_requests")
          .update({
            status: "approved",
            processed_at: new Date().toISOString()
            // Don't try to update verification_link in this table if it's causing issues
          })
          .eq("id", currentRequestId);
          
        console.log("Request update response:", requestUpdateResponse);
        
        if (requestUpdateResponse.error) {
          console.warn("Could not update verification request, but continuing:", 
            requestUpdateResponse.error);
        }
      } catch (requestError) {
        console.warn("Error in request update (non-blocking):", requestError);
      }
      
      // Update local state - only updating the verification_link, not the verified status
      setUsers(users.map(user =>
        user.id === currentUserId ? {
          ...user,
          verification_link: verificationLink
          // Removed: verified: true
        } : user
      ));
      
      setVerificationRequests(verificationRequests.map(req =>
        req.id === currentRequestId ? {
          ...req,
          status: "approved",
          processed_at: new Date().toISOString()
        } : req
      ));
      
      // Updated success message to reflect that the user is not yet verified
      alert("Success: Verification link has been sent to the user. The user will be verified after completing the verification process.");
      setIsDialogOpen(false);
      setVerificationLink("");
      
    } catch (error) {
      console.error("Unexpected error in submitVerificationLink:", error);
      alert(`Error: An unexpected error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredRequests = verificationRequests.filter(req => 
    req.users?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.users?.name && req.users.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading || (user && !isAdmin && !isLoading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and verification requests</p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by email or name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users Management
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Verification Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex h-40 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">No users found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Verification Status</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.verified ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_blocked ? (
                            <Button 
                              onClick={() => handleUnblockUser(user.id)} 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Unblock
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleBlockUser(user.id)} 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="mr-1 h-3 w-3" />
                              Block
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>Approve or reject verification requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex h-40 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">No verification requests found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.users?.name || "N/A"}
                          <div className="text-xs text-muted-foreground">{request.users?.email}</div>
                        </TableCell>
                        <TableCell>
                          {request.verification_type === "id" ? "ID Verification" : 
                           request.verification_type === "check" ? "Verification Check" : 
                           request.verification_type === "face" ? "Face Verification" :
                           request.verification_type /* Fallback */ }
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>
                          )}
                          {request.status === "approved" && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
                          )}
                          {request.status === "rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {/* --- Action Buttons Logic --- */}
                          
                          {/* Case 1: Pending Request */}
                          {request.status === "pending" && (
                            <>
                              {/* Subcase 1.1: Pending 'check' request -> Show Approve/Reject */}
                              {request.verification_type === "check" && (
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => handleApproveVerification(request.id, request.user_id, request.verification_type)} 
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleRejectVerification(request.id)} 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              {/* Subcase 1.2: Pending 'id' or 'face' request -> Show Send Link */}
                              {(request.verification_type === "id" || request.verification_type === "face") && (
                                <Button 
                                  // Use request.user_id directly instead of request.users?.id
                                  onClick={() => openVerificationDialog(request.id, request.user_id)} 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <LinkIcon className="mr-1 h-3 w-3" />
                                  Send Link
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Case 2: Approved Request */}
                          {request.status === "approved" && (
                            <>
                              {/* Subcase 2.1: Approved 'id' or 'face' request WITHOUT a link yet -> Show Send Link */}
                              {(request.verification_type === "id" || request.verification_type === "face") && !request.verification_link && (
                                <Button 
                                  // Use request.user_id directly here as well
                                  onClick={() => openVerificationDialog(request.id, request.user_id)} 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <LinkIcon className="mr-1 h-3 w-3" />
                                  Send/Update Link
                                </Button>
                              )}
                              
                              {/* Subcase 2.2: Approved 'check' request OR Approved 'id'/'face' WITH link -> Show nothing or confirmation */}
                              {/* (No button needed here, status badge is sufficient) */}
                              {((request.verification_type === "id" || request.verification_type === "face") && request.verification_link) && (
                                 <span className="text-xs text-muted-foreground italic">Link Sent</span>
                              )}
                               {request.verification_type === "check" && (
                                 <span className="text-xs text-muted-foreground italic">User Verified</span>
                              )}
                            </>
                          )}
                          
                          {/* Case 3: Rejected Request -> Show nothing */}
                          {/* (No button needed here, status badge is sufficient) */}

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Verification Link</DialogTitle>
            <DialogDescription>
              Enter the verification link to send to the user.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter verification link..."
            value={verificationLink}
            onChange={(e) => setVerificationLink(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={submitVerificationLink} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}