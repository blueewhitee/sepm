"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CitySelector from "@/components/city-selector"
import { Calendar, Shield, Coffee, ArrowRight, Users, Bell, Bookmark, Clock } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // Don't render anything while checking authentication
  if (isLoading) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.user_metadata?.name || "Traveler"}</h1>
        <p className="text-muted-foreground">
          Find travel insights and connect with fellow travelers around the world
        </p>
      </div>

      {/* City Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Destination</h2>
        <CitySelector />
      </div>

      {/* Forums Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Explore Forums</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-muted/40 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>City Events</CardTitle>
                <CardDescription>Discover and share upcoming events</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Find local events, festivals, and gatherings. Share tips and details with fellow travelers.
              </p>
              <Link href="/forums/events">
                <Button className="w-full" variant="outline">Browse Events</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-muted/40 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>City Scams</CardTitle>
                <CardDescription>Stay informed about common scams</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Learn about scams, how to avoid them, and share your experiences to help others.
              </p>
              <Link href="/forums/scams">
                <Button className="w-full" variant="outline">Browse Scams</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-muted/40 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Coffee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Local Suggestions</CardTitle>
                <CardDescription>Get insider recommendations</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Find hidden gems, local favorites, and practical tips from fellow travelers.
              </p>
              <Link href="/forums/suggestions">
                <Button className="w-full" variant="outline">Browse Suggestions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Stay Requests Section */}
      <div className="bg-muted/30 rounded-xl p-8 relative overflow-hidden mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Connect With Travelers</h3>
          </div>
          <h2 className="text-3xl font-bold mb-4">Looking for a Place to Stay?</h2>
          <p className="text-muted-foreground mb-6">
            Share your accommodation needs and connect with locals or fellow travelers who might have
            suggestions or offers. Our community is here to help you find the perfect stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/stay-requests">
              <Button className="gap-2">
                View Stay Requests <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/stay-requests/new">
              <Button variant="outline">Post a Request</Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Link href="/forums/general/new">
            <Card className="h-full hover:bg-muted/10 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <Bell className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Create Post</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/stay-requests/new">
            <Card className="h-full hover:bg-muted/10 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Stay Request</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/profile">
            <Card className="h-full hover:bg-muted/10 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <Bookmark className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Your Profile</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/forums/events">
            <Card className="h-full hover:bg-muted/10 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Recent Events</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}