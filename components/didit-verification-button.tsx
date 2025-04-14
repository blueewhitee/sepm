"use client"

import { useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { CircleCheck, Loader2 } from "lucide-react"
import DiditVerificationModal from "./didit-verification-modal"
import { useDidit } from "@/contexts/didit-context"

interface DiditVerificationButtonProps extends ButtonProps {
  verificationLevel: "id" | "face"
  onVerificationComplete?: (success: boolean) => void
  children: React.ReactNode
}

export default function DiditVerificationButton({
  verificationLevel,
  onVerificationComplete,
  children,
  ...props
}: DiditVerificationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isIdVerified, isFaceVerified, refreshVerificationStatus } = useDidit()

  const isVerified = verificationLevel === "id" ? isIdVerified : isFaceVerified

  const handleVerification = async () => {
    if (isVerified || !user) return
    setIsModalOpen(true)
  }

  const handleVerificationComplete = async (success: boolean) => {
    // Refresh the verification status in our context
    await refreshVerificationStatus()
    
    if (onVerificationComplete) {
      onVerificationComplete(success)
    }
  }

  return (
    <>
      <Button 
        onClick={handleVerification}
        disabled={isVerified || !user}
        {...props}
      >
        {isVerified ? (
          <>
            <CircleCheck className="mr-2 h-4 w-4" />
            {verificationLevel === "id" ? "ID Verified" : "Face Verified"}
          </>
        ) : (
          children
        )}
      </Button>

      {user && (
        <DiditVerificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          verificationType={verificationLevel}
          userId={user.id}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </>
  )
}