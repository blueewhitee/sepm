"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DiditVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  verificationType: "id" | "face"
  userId: string
  onVerificationComplete?: (success: boolean) => void
}

export default function DiditVerificationModal({
  isOpen, 
  onClose,
  verificationType,
  userId,
  onVerificationComplete
}: DiditVerificationModalProps) {
  const [iframeUrl, setIframeUrl] = useState("")
  const [sessionId, setSessionId] = useState("")
  
  // Generate a unique session ID only when the modal opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(`${userId}-${verificationType}-${Date.now()}`)
    }
  }, [isOpen, userId, verificationType, sessionId])
  
  // Create iframe URL with correct parameters
  useEffect(() => {
    if (isOpen && sessionId) {
      // The client ID for Didit.me
      const clientId = process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID || "HIr4Lk8Bk-Gc5_xCdhTp3Q"
      
      // The redirect URL after verification is complete
      const redirectUrl = `${window.location.origin}/profile?verification=${verificationType}`
      
      // Format verification type as expected by Didit.me
      const formattedType = verificationType === "id" ? "document" : "face"
      
      // Construct the URL according to Didit.me's format
      // Didit.me uses a specific format: https://verify.didit.me/verification/CLIENT_ID?type=TYPE&session=ID
      const url = `https://verify.didit.me/verification/${clientId}?type=${formattedType}&session=${sessionId}&redirect_uri=${encodeURIComponent(redirectUrl)}&user_id=${encodeURIComponent(userId)}`
      
      setIframeUrl(url)
    }
  }, [isOpen, sessionId, verificationType, userId])
  
  // Reset session ID when modal closes
  useEffect(() => {
    if (!isOpen && sessionId) {
      setSessionId("")
      setIframeUrl("")
    }
  }, [isOpen, sessionId])
  
  // Handle message from iframe
  useEffect(() => {
    if (!isOpen) return
    
    const handleMessage = (event: MessageEvent) => {
      // Verify origin (should match Didit's domain)
      if (event.origin !== "https://verify.didit.me") return
      
      try {
        const data = JSON.parse(event.data)
        
        if (data.event === "verification_complete" || data.event === "verification_success") {
          if (data.success) {
            // Save verification status in localStorage for demo
            const verificationStatus = JSON.parse(localStorage.getItem(`verification_status_${userId}`) || '{"idVerified": false, "faceVerified": false}')
            
            if (verificationType === "id") {
              verificationStatus.idVerified = true
            } else if (verificationType === "face") {
              verificationStatus.faceVerified = true
            }
            
            localStorage.setItem(`verification_status_${userId}`, JSON.stringify(verificationStatus))
            
            if (onVerificationComplete) {
              onVerificationComplete(true)
            }
          } else {
            console.error("Verification failed:", data.error)
            if (onVerificationComplete) {
              onVerificationComplete(false)
            }
          }
          
          // Close modal
          onClose()
        }
      } catch (error) {
        console.error("Error processing message:", error)
      }
    }
    
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [isOpen, onClose, verificationType, userId, onVerificationComplete])
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px] h-[600px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {verificationType === "id" ? "ID Verification" : "Facial Verification"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-[550px]">
          {isOpen && iframeUrl && (
            <iframe
              src={iframeUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="camera; microphone"
              title={`${verificationType} verification`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}