"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ShieldCheck, FileText, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface VerificationRequestCardProps {
  userId: string
  isIdVerified: boolean
  isFaceVerified: boolean
  onRequestSuccess?: () => void
}

export default function VerificationRequestCard({
  userId,
  isIdVerified,
  isFaceVerified,
  onRequestSuccess
}: VerificationRequestCardProps) {
  const [userRequests, setUserRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    fetchUserRequests()
  }, [userId])

  const fetchUserRequests = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verification-requests?userId=${userId}`)
      const data = await response.json()
      
      if (data.requests) {
        setUserRequests(data.requests)
      }
    } catch (error) {
      console.error("Error fetching user verification requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestVerification = async (type: 'id' | 'face' | 'check') => {
    if (!userId) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/verification-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          verificationType: type,
          additionalInfo: {
            requestedAt: new Date().toISOString(),
            requestType: type === 'check' ? 'check' : 'verification'
          }
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: type === 'check' ? "Verification Check Submitted" : "Verification Request Submitted",
          description: "An admin will review your request and update your verification status.",
        })
        fetchUserRequests()
        if (onRequestSuccess) onRequestSuccess()
      } else {
        toast({
          title: "Request Failed",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error requesting ${type} verification:`, error)
      toast({
        title: "Request Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPendingRequest = (type: 'id' | 'face') => {
    return userRequests.find(req => 
      req.verification_type === type && 
      req.status === 'pending'
    )
  }

  const idPendingRequest = getPendingRequest('id')
  const facePendingRequest = getPendingRequest('face')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>Verify your identity to unlock all features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          {/* Request Verification Section (formerly ID Verification) */}
          <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Request Verification</h3>
                <p className="text-sm text-muted-foreground">Submit a verification request to the admin</p>
                
                {isIdVerified ? (
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : idPendingRequest ? (
                  <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-200">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Pending Approval
                  </Badge>
                ) : null}
              </div>
            </div>
            
            {!isIdVerified && !idPendingRequest && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRequestVerification('id')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Requesting...
                  </>
                ) : "Request"}
              </Button>
            )}
          </div>
          
          {/* Check Verification Section (formerly Face Verification) */}
          <div className="flex items-start justify-between rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Check Verification</h3>
                <p className="text-sm text-muted-foreground">Check the status of your verification</p>
                
                {isFaceVerified ? (
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : facePendingRequest ? (
                  <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-200">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Pending Approval
                  </Badge>
                ) : null}
              </div>
            </div>
            
            {!isFaceVerified && !facePendingRequest && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRequestVerification('check')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Requesting...
                  </>
                ) : "Check"}
              </Button>
            )}
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Process</AlertTitle>
          <AlertDescription>
            After requesting verification, an admin will review your request and send a verification link to your email.
            Follow the instructions in the email to complete the verification process.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}