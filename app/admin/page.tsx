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
  id_verified?: boolean;
  face_verified?: boolean;
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
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (usersError) throw usersError
      setUsers(usersData || [])

      // Fetch verification requests - Ensure user_id is selected directly
      const { data: requestsData, error: requestsError } = await supabase
        .from("verification_requests")
        // Select all columns from verification_requests, including user_id
        // and explicitly select related user's email and name
        .select("*, user_id, users(email, name)") 
        .order("created_at", { ascending: false })
      
      if (requestsError) throw requestsError
      console.log("Fetched requests:", requestsData); // Add log to inspect data
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
        // Handle unique constraint violation error gracefully
        if (updateError.message && updateError.message.includes("idx_verification_requests_user_id")) {
          console.log("User already has a verification request. Updating user verification status directly.");
          
          // Skip updating the request and go directly to updating the user's verification status
        } else {
          throw updateError;
        }
      }

      // 2. For 'check' verification type, also update the user's verification status
      if (verificationType === "check") {
        // Log the user ID to make sure it's valid
        console.log("Updating verification status for user ID:", userId);
        
        // Check if the user ID is valid
        if (!userId) {
          console.error("Invalid user ID:", userId);
          throw new Error("Invalid user ID");
        }
        
        // Update the user's verification status
        const { data: userData, error: userUpdateError } = await supabase
          .from("users")
          .update({ 
            id_verified: true, // Sets both to true
            face_verified: true
          })
          .eq("id", userId)
          .select();
        
        if (userUpdateError) {
          console.error("Error updating user verification status:", userUpdateError);
          // Show full error details for debugging
          console.error("Error details:", JSON.stringify(userUpdateError));
          alert("Verification request approved, but failed to update user's verified status automatically.");
        } else {
          console.log("Successfully updated user verification status:", userData);
        }
      }

      // 3. Update local state
      setVerificationRequests(verificationRequests.map(req => 
        req.id === requestId ? { ...req, status: "approved", processed_at: new Date().toISOString() } : req
      ));

      // Update the user's verification status in the users state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, id_verified: true, face_verified: true } : user
      ));
      
      // Show success message
      alert("Verification request approved successfully!");
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
    if (!verificationLink.trim()) {
      alert("Please enter a valid verification link");
      return;
    }
    setIsSubmitting(true);
    
    try {
      console.log("Submitting verification link:", {
        requestId: currentRequestId,
        userId: currentUserId,
        link: verificationLink
      });
      
      // First update the user record - ALSO update the verification status
      const { data: userData, error: userUpdateError } = await supabase
        .from("users")
        .update({ 
          verification_link: verificationLink,
          // Also mark the user as verified when sending a link
          id_verified: true, // Sets both to true
          face_verified: true
        })
        .eq("id", currentUserId)
        .select();
      
      if (userUpdateError) {
        // Handle potential missing column error gracefully
        if (userUpdateError.message && userUpdateError.message.includes("column")) {
          const confirmMigration = confirm("Database schema might be missing the verification_link column in 'users' table. Would you like to see instructions to add it?");
          if (confirmMigration) {
            alert("Please execute the add-verification-link-column.sql migration file or manually add a 'verification_link' text column to your 'users' table.");
          }
          // Continue even if user update fails, try updating the request
        } else {
          throw userUpdateError; // Rethrow other user update errors
        }
      } else {
        console.log("Updated user data:", userData);
      }
      
      // Now update the verification request - Mark as approved and add the link
      const { data: requestData, error: updateError } = await supabase
        .from("verification_requests")
        .update({ 
          status: "approved", // Mark as approved when link is sent
          processed_at: new Date().toISOString(),
          verification_link: verificationLink
        })
        .eq("id", currentRequestId)
        .select();
        
      if (updateError) {
        console.error("Error updating verification request:", updateError);
        // Handle potential missing column error gracefully
        if (updateError.message && updateError.message.includes("column")) {
           alert("Warning: Could not save link in verification_requests table (schema might be outdated), but it should be saved in the user record if possible.");
        } else {
          throw updateError; // Rethrow other request update errors
        }
      } else {
        console.log("Updated verification request:", requestData);
      }

      // Update local state to reflect the change immediately in BOTH sections
      setVerificationRequests(verificationRequests.map(req => 
        req.id === currentRequestId ? { 
          ...req, 
          status: "approved", // Ensure status is approved
          processed_at: new Date().toISOString(),
          verification_link: verificationLink
        } : req
      ));
      
      // IMPORTANT: Also update the users array to reflect verified status
      setUsers(users.map(user => 
        user.id === currentUserId ? { 
          ...user, 
          id_verified: true,
          face_verified: true,
          verification_link: verificationLink
        } : user
      ));

      // Close dialog and inform admin
      setIsDialogOpen(false);
      alert(`Verification link has been saved and the request marked as approved. The link is now visible to the user.`);
      
    } catch (error) {
      console.error("Error saving verification link:", error);
      alert(`Error saving verification link: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

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
                          {user.id_verified && user.face_verified ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">Fully Verified</Badge>
                          ) : user.id_verified || user.face_verified ? (
                            <Badge variant="warning" className="bg-amber-100 text-amber-800">Partially Verified</Badge>
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