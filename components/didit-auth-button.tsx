"use client"

import { useEffect, useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { useDidit } from "@/contexts/didit-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DiditAuthButtonProps extends ButtonProps {
  authType: "login" | "signup"
  children: React.ReactNode
}

export default function DiditAuthButton({
  authType,
  children,
  ...props
}: DiditAuthButtonProps) {
  const { login, isLoading, isAuthenticated, user } = useDidit()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  const handleAuth = () => {
    setIsAuthenticating(true)
    login()
  }

  // Reset authenticating state when authentication completes or fails
  useEffect(() => {
    if (!isLoading && isAuthenticating) {
      setIsAuthenticating(false)
      
      // If authenticated, redirect to profile page
      if (isAuthenticated && user) {
        router.push('/profile')
      }
    }
  }, [isLoading, isAuthenticated, isAuthenticating, user, router])

  return (
    <Button 
      onClick={handleAuth} 
      disabled={isLoading || isAuthenticating}
      {...props}
    >
      {isLoading || isAuthenticating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {authType === "signup" ? "Signing up..." : "Logging in..."}
        </>
      ) : (
        children
      )}
    </Button>
  )
}