"use client"

import { createContext, useContext, useEffect, useState } from "react"

// Add detailed types based on Didit's documentation
interface DocumentVerification {
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  documentType?: string
  documentNumber?: string
  issuingCountry?: string
  expiryDate?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  address?: string
  // Add other document fields that might be relevant
}

interface FacialVerification {
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  confidenceScore?: number
  livelinessScore?: number
  matchScore?: number
  // Add other facial verification fields that might be relevant
}

// Enhance user type
interface DiditUser {
  id: string
  email?: string
  name?: string
  documentVerification?: DocumentVerification
  facialVerification?: FacialVerification
}

// Define the type for our Didit context
interface DiditContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: DiditUser | null
  login: () => void
  logout: () => void
  isIdVerified: boolean
  isFaceVerified: boolean
  startVerification: () => Promise<boolean>
  refreshVerificationStatus: () => Promise<void>
  documentDetails: DocumentVerification | null
  facialDetails: FacialVerification | null
}

// Create the context
const DiditContext = createContext<DiditContextType | undefined>(undefined)

// Create a mock implementation since we can't fully integrate with Didit SDK yet
export function DiditProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<DiditUser | null>(null)
  const [isIdVerified, setIsIdVerified] = useState(false)
  const [isFaceVerified, setIsFaceVerified] = useState(false)
  const [documentDetails, setDocumentDetails] = useState<DocumentVerification | null>(null)
  const [facialDetails, setFacialDetails] = useState<FacialVerification | null>(null)

  // Mock login function
  const login = () => {
    // In a real implementation, this would trigger Didit's auth flow
    setIsLoading(true)
    
    // Simulate authentication delay
    setTimeout(() => {
      setUser({
        id: "mock-user-id",
        email: "user@example.com",
        name: "Demo User"
      })
      setIsAuthenticated(true)
      setIsLoading(false)
    }, 1000)
  }

  // Mock logout function
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setIsIdVerified(false)
    setIsFaceVerified(false)
    setDocumentDetails(null)
    setFacialDetails(null)
  }

  // Enhanced refreshVerificationStatus with detailed document and facial data
  const refreshVerificationStatus = async () => {
    if (!user) return
    
    try {
      // For demo purposes, or when integrating with your actual backend:
      const storedVerificationStatus = localStorage.getItem(`verification_status_${user.id}`)
      
      if (storedVerificationStatus) {
        const { 
          idVerified, 
          faceVerified, 
          documentDetails: storedDocDetails, 
          facialDetails: storedFaceDetails 
        } = JSON.parse(storedVerificationStatus)
        
        setIsIdVerified(idVerified)
        setIsFaceVerified(faceVerified)
        
        if (storedDocDetails) {
          setDocumentDetails(storedDocDetails)
        }
        
        if (storedFaceDetails) {
          setFacialDetails(storedFaceDetails)
        }
      }
      
      // In a real implementation, you'd call your backend API to get verification status:
      // const response = await fetch(`/api/didit/verification-status?userId=${user.id}`);
      // const data = await response.json();
      // setIsIdVerified(data.isIdVerified);
      // setIsFaceVerified(data.isFaceVerified);
      // setDocumentDetails(data.documentDetails);
      // setFacialDetails(data.facialDetails);
    } catch (error) {
      console.error("Error fetching verification status:", error)
    }
  }

  // Enhanced startVerification - this demo version creates realistic mock data
  const startVerification = async () => {
    if (!user) return false
    
    try {
      setIsLoading(true)
      
      // In a real implementation, call your API endpoint that creates the combined session
      // const response = await fetch('/api/didit/create-session', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ userId: user.id }),
      // });
      
      // Simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo: simulate both verifications being completed with detailed data
      setIsIdVerified(true)
      setIsFaceVerified(true)
      
      // Mock document verification details based on Didit's document report structure
      const mockDocumentDetails: DocumentVerification = {
        status: 'verified',
        documentType: 'PASSPORT',
        documentNumber: 'P123456789',
        issuingCountry: 'United States',
        expiryDate: '2030-01-01',
        firstName: 'Demo',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        address: '123 Main St, Anytown, USA'
      }
      
      // Mock facial verification details based on Didit's facial similarity report structure
      const mockFacialDetails: FacialVerification = {
        status: 'verified',
        confidenceScore: 0.98,
        livelinessScore: 0.99,
        matchScore: 0.97
      }
      
      setDocumentDetails(mockDocumentDetails)
      setFacialDetails(mockFacialDetails)
      
      // Store in local storage to persist across refreshes - now with detailed data
      const verificationStatus = {
        idVerified: true,
        faceVerified: true,
        documentDetails: mockDocumentDetails,
        facialDetails: mockFacialDetails
      }
      
      localStorage.setItem(`verification_status_${user.id}`, JSON.stringify(verificationStatus))
      
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Verification error:", error)
      setIsLoading(false)
      return false
    }
  }

  // Check local storage on mount - enhanced to load detailed verification data
  useEffect(() => {
    // Check if user is authenticated in local storage
    const storedUser = localStorage.getItem('didit_user')
    
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
      
      // Also fetch verification status
      const storedVerificationStatus = localStorage.getItem(`verification_status_${userData.id}`)
      
      if (storedVerificationStatus) {
        const { 
          idVerified, 
          faceVerified, 
          documentDetails: storedDocDetails, 
          facialDetails: storedFaceDetails 
        } = JSON.parse(storedVerificationStatus)
        
        setIsIdVerified(idVerified)
        setIsFaceVerified(faceVerified)
        
        if (storedDocDetails) {
          setDocumentDetails(storedDocDetails)
        }
        
        if (storedFaceDetails) {
          setFacialDetails(storedFaceDetails)
        }
      }
    }
    
    setIsLoading(false)
  }, [])

  // Update local storage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('didit_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('didit_user')
    }
  }, [user])

  return (
    <DiditContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        isIdVerified,
        isFaceVerified,
        startVerification,
        refreshVerificationStatus,
        documentDetails,
        facialDetails
      }}
    >
      {children}
    </DiditContext.Provider>
  )
}

// Create a hook to use the Didit context
export const useDidit = () => {
  const context = useContext(DiditContext)
  if (context === undefined) {
    throw new Error("useDidit must be used within a DiditProvider")
  }
  return context
}