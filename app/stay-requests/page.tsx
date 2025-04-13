import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"
import StayRequestList from "@/components/stay-request-list"
import { getStayRequests } from "@/lib/database"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function StayRequestsPage({
  searchParams,
}: {
  searchParams: { city?: string }
}) {
  const { city } = searchParams
  const stayRequests = await getStayRequests(city)

  // Get current session
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Stay Requests</h1>
        <p className="mt-2 text-muted-foreground">
          Connect with travelers looking for accommodation or share your own request
        </p>
      </div>

      <div className="mb-6 flex justify-end">
        <Link href="/stay-requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Stay Request
          </Button>
        </Link>
      </div>

      {!isLoggedIn && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            You must be verified to post or comment.{" "}
            <Link href="/auth/signup" className="font-medium underline">
              Sign up
            </Link>{" "}
            or{" "}
            <Link href="/auth/login" className="font-medium underline">
              login
            </Link>{" "}
            to participate.
          </AlertDescription>
        </Alert>
      )}

      <StayRequestList requests={stayRequests} />
    </div>
  )
}
