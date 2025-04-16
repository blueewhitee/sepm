"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useDidit } from "@/contexts/didit-context" 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ShieldCheck, AlertCircle, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export default function NavBar() {
  const { user: authUser, signOut } = useAuth()
  const { isAuthenticated, user: diditUser, logout, isIdVerified, isFaceVerified } = useDidit()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // We'll use Didit auth status if available, otherwise fall back to our existing auth
  const isUserAuthenticated = isAuthenticated || !!authUser
  const isFullyVerified = isIdVerified && isFaceVerified

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // If user is authenticated with Didit, use Didit logout
      if (isAuthenticated) {
        await logout()
      } else {
        // Otherwise use our existing signOut function
        const { success } = await signOut()
        if (!success) {
          throw new Error("Sign out failed")
        }
      }
      
      // Use replace instead of push to prevent going back after logging out
      router.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // If signing out, show unauthenticated UI immediately
  const showAuthenticatedUI = isUserAuthenticated && !isSigningOut

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          
        </Link>

        <nav className="flex items-center gap-4">
          {showAuthenticatedUI ? (
            <div className="flex items-center gap-4">
              {isAuthenticated && !isFullyVerified && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Verification Needed
                </Badge>
              )}
              
              {isAuthenticated && isFullyVerified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 hidden sm:flex">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {isAuthenticated && isFullyVerified ? (
                      <div className="relative">
                        <User className="h-5 w-5" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {diditUser?.email || (authUser?.email) || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile & Verification</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
