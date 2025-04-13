"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function NewStayRequestPage() {
  const router = useRouter()
  const { user, isVerified } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    city: "",
    start_date: "",
    end_date: "",
    budget: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const requestData = {
        city: formData.city,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget,
        description: formData.description,
        user_id: user.id,
      }

      const { data, error } = await supabase.from("stay_requests").insert(requestData).select()

      if (error) {
        console.error("Error creating stay request:", error)
        throw error
      }

      router.push("/stay-requests")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check authentication and verification status
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Set auth checked to true after initial render
    setAuthChecked(true)
  }, [])

  if (!authChecked) {
    return null // Don't render anything until we've checked auth status
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to create a stay request. Please{" "}
            <a href="/auth/login" className="font-medium underline">
              login
            </a>{" "}
            or{" "}
            <a href="/auth/signup" className="font-medium underline">
              sign up
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            You must complete ID and face verification to create stay requests. Please complete the verification process
            in your account settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Create a Stay Request</CardTitle>
          <CardDescription>Share your accommodation needs with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={formData.city} onValueChange={(value) => handleSelectChange("city", value)} required>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nyc">New York City</SelectItem>
                  <SelectItem value="tokyo">Tokyo</SelectItem>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="bangkok">Bangkok</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={formData.budget} onValueChange={(value) => handleSelectChange("budget", value)} required>
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under $50/night">Under $50/night</SelectItem>
                  <SelectItem value="$50-100/night">$50-100/night</SelectItem>
                  <SelectItem value="$100-150/night">$100-150/night</SelectItem>
                  <SelectItem value="$150-200/night">$150-200/night</SelectItem>
                  <SelectItem value="Over $200/night">Over $200/night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you're looking for, your preferences, and any additional information that might be helpful..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Request..." : "Create Stay Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
