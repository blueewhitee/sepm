"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDidit } from "@/contexts/didit-context"

export default function AuthCallback() {
  const { isAuthenticated, isLoading } = useDidit()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if there's a return URL
        const returnUrl = searchParams.get('returnUrl') || '/profile'
        router.push(returnUrl)
      } else {
        router.push("/auth/login")
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}