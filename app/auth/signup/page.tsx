"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { updateUserVerification } from "@/lib/database"

export default function SignupPage() {
  const router = useRouter()
  const { signUp, user } = useAuth()
  const [step, setStep] = useState<"details" | "id" | "face" | "complete">("details")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    idUploaded: false,
    faceVerified: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await signUp(formData.email, formData.password, formData.name)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      setStep("id")
    }
  }

  const handleIdUpload = async () => {
    // Simulate ID upload and verification
    setIsLoading(true)

    setTimeout(async () => {
      if (user) {
        await updateUserVerification(user.id, "id_verified", true)
      }

      setFormData((prev) => ({ ...prev, idUploaded: true }))
      setIsLoading(false)
      setStep("face")
    }, 1500)
  }

  const handleFaceVerification = async () => {
    // Simulate face verification
    setIsLoading(true)

    setTimeout(async () => {
      if (user) {
        await updateUserVerification(user.id, "face_verified", true)
      }

      setFormData((prev) => ({ ...prev, faceVerified: true }))
      setIsLoading(false)
      setStep("complete")
    }, 1500)
  }

  const handleComplete = () => {
    router.push("/auth/login")
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Sign up to share information and connect with other travelers</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={step} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" disabled={step !== "details"}>
                Details
              </TabsTrigger>
              <TabsTrigger value="id" disabled={step !== "id"}>
                ID
              </TabsTrigger>
              <TabsTrigger value="face" disabled={step !== "face"}>
                Face
              </TabsTrigger>
              <TabsTrigger value="complete" disabled={step !== "complete"}>
                Complete
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleDetailsSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Continue"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="id">
              <div className="space-y-4 pt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ID Verification</AlertTitle>
                  <AlertDescription>
                    Please upload a government-issued ID for verification. This helps ensure trust in our community.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
                  <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">Drag and drop your ID, or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF</p>
                </div>

                <Button onClick={handleIdUpload} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    "Processing..."
                  ) : formData.idUploaded ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> ID Uploaded
                    </>
                  ) : (
                    "Upload ID"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="face">
              <div className="space-y-4 pt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Face Verification</AlertTitle>
                  <AlertDescription>
                    Please take a selfie to verify your identity. This will be matched with your ID.
                  </AlertDescription>
                </Alert>

                <div className="flex aspect-video flex-col items-center justify-center rounded-lg border bg-muted">
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium">Camera preview will appear here</p>
                    <p className="text-xs text-muted-foreground">Position your face in the center</p>
                  </div>
                </div>

                <Button onClick={handleFaceVerification} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    "Processing..."
                  ) : formData.faceVerified ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Face Verified
                    </>
                  ) : (
                    "Take Photo"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="complete">
              <div className="space-y-4 pt-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">Verification Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your account has been created and your identity has been verified. You can now post and comment on the
                  platform.
                </p>
                <Button onClick={handleComplete} className="w-full">
                  Continue to Login
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
