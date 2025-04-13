import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CitySelector from "@/components/city-selector"
import { Globe, MapPin, Calendar, Shield, Coffee, Users, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 items-center md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Travel smarter, together
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Traveler Info Hub
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover, share, and connect with fellow travelers. 
                Get authentic insights about cities worldwide, from local events to avoiding scams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/forums/suggestions">
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

      {/* Testimonials/How It Works */}
      <section className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our community in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create an Account</h3>
              <p className="text-muted-foreground">
                Sign up for free and become part of our global travel community
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Explore or Share</h3>
              <p className="text-muted-foreground">
                Browse information about cities or contribute your own insights
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect & Travel</h3>
              <p className="text-muted-foreground">
                Connect with other travelers, ask questions, and travel with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore the World?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of travelers worldwide sharing insights and making connections.
            Create your account today and start your journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
