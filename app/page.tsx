import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CitySelector from "@/components/city-selector"
import { Globe, MapPin, Calendar, Shield, Coffee, Users, ArrowRight, CheckCircle, ShieldCheck, User } from "lucide-react"
import DiditAuthButton from "@/components/didit-auth-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 items-center md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                <ShieldCheck className="h-4 w-4" /> Trusted Travel Community
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Urban crash
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover, share, and connect with verified travelers. 
                Get authentic insights about cities worldwide, from local events to avoiding scams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <DiditAuthButton 
                  authType="signup" 
                  size="lg" 
                  className="gap-2"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </DiditAuthButton>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Explore Destinations
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-xl"></div>
              <div className="relative rounded-xl border overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.jpg" 
                  alt="World travel"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City Selector Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore Cities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a destination to discover traveler insights, local events, and connect with others
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <CitySelector />
        </div>
      </section>

      {/* Verification Feature Section */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-b from-muted/5 to-muted/20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <ShieldCheck className="h-4 w-4" /> Verified Community
          </div>
          <h2 className="text-3xl font-bold mb-2">Built on Trust & Safety</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform uses advanced ID and facial verification to create a trusted community of travelers
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-muted/40 bg-background/60 backdrop-blur">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>ID Verification</CardTitle>
              <CardDescription>Verify your government-issued ID</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Securely upload and verify your government-issued ID through our partnership with Didit.me. 
                Your personal information remains private and protected.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-muted/40 bg-background/60 backdrop-blur">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Facial Verification</CardTitle>
              <CardDescription>Confirm you're a real person</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete a quick facial scan to verify your identity matches your ID. 
                Our system uses advanced liveness detection technology.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-muted/40 bg-background/60 backdrop-blur">
            <CardHeader>
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Trusted Community</CardTitle>
              <CardDescription>Connect with verified travelers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified profiles receive a trust badge, making it easy to identify trustworthy community members
                and have more meaningful, safer interactions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Discover What's Possible</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for safer, more connected travels
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-muted/40 bg-background/60 backdrop-blur transition-all hover:shadow-md">
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

          <Card className="border border-muted/40 bg-background/60 backdrop-blur transition-all hover:shadow-md">
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

          <Card className="border border-muted/40 bg-background/60 backdrop-blur transition-all hover:shadow-md">
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
      </section>

      {/* Stay Requests Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-muted/30 rounded-xl p-8 relative overflow-hidden">
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
          <div className="absolute right-0 bottom-0 opacity-10">
            <Globe className="h-64 w-64 text-primary" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our verified community in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up with your email using our secure passwordless system
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Verify Your Identity</h3>
              <p className="text-muted-foreground">
                Complete quick ID and facial verification to become a trusted member
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect With Confidence</h3>
              <p className="text-muted-foreground">
                Interact with other verified travelers with peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Verified Community?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your secure, verified account today and connect with trusted travelers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <DiditAuthButton 
              authType="signup" 
              size="lg"
            >
              Sign Up Now
            </DiditAuthButton>
            <DiditAuthButton
              authType="login"
              variant="outline"
              size="lg"
            >
              Login
            </DiditAuthButton>
          </div>
        </div>
      </section>
    </div>
  )
}
