"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, AlertTriangle, Users, RefreshCw, UserX, CheckCircle, XCircle, Mail } from "lucide-react"
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

// Admin role check - in a real app, you would store admin status in your database
const ADMIN_EMAILS = ['admin@example.com', 'your-email@example.com'];

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState([])
  const [verificationRequests, setVerificationRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login")
      } else {
        const userIsAdmin = ADMIN_EMAILS.includes(user.email);
        setIsAdmin(userIsAdmin)
        
        if (!userIsAdmin) {
          router.push("/dashboard")
        } else {
          fetchData()
        }
      }
    }
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

      // Fetch verification requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("verification_requests")
        .select("*, users(email, name)")
        .order("created_at", { ascending: false })
      
      if (requestsError) throw requestsError
      setVerificationRequests(requestsData || [])

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleBlockUser = async (userId) => {
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

  const handleUnblockUser = async (userId) => {
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

  const handleApproveVerification = async (requestId, userId) => {
    try {
      // 1. Update request status
      const { error: updateError } = await supabase
        .from("verification_requests")
        .update({ status: "approved", processed_at: new Date().toISOString() })
        .eq("id", requestId)
      
      if (updateError) throw updateError

      // 2. Send verification link (in real application, this would trigger an email)
      // Here we'll just update local state for demo purposes
      setVerificationRequests(verificationRequests.map(req => 
        req.id === requestId ? { ...req, status: "approved", processed_at: new Date().toISOString() } : req
      ))

      // In a real application, you would call an API to send the email with the verification link
      alert(`Verification link has been sent to the user's email`)
    } catch (error) {
      console.error("Error approving verification:", error)
    }
  }

  const handleRejectVerification = async (requestId) => {
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
                        <TableCell>{request.verification_type === "id" ? "ID Verification" : "Face Verification"}</TableCell>
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
                          {request.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApproveVerification(request.id, request.user_id)} 
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
                          {request.status === "approved" && (
                            <Button 
                              onClick={() => alert(`Sending another verification email to ${request.users?.email}`)} 
                              variant="outline" 
                              size="sm"
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              Resend Email
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
      </Tabs>
    </div>
  )
}