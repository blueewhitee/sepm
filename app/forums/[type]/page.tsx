import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import CitySelector from "@/components/city-selector"
import PostList from "@/components/post-list"
import { getPosts } from "@/lib/database"
import { createServerSupabaseClient } from "@/lib/supabase"

const forumTypes = {
  events: {
    title: "City Events",
    description: "Discover and share upcoming events in cities around the world",
  },
  scams: {
    title: "City Scams",
    description: "Stay informed about common scams to avoid during your travels",
  },
  suggestions: {
    title: "Local Suggestions",
    description: "Get recommendations from travelers who've been there",
  },
}

export default async function ForumPage({
  params,
  searchParams,
}: {
  params: { type: string }
  searchParams: { city?: string }
}) {
  const { type } = params
  const { city } = searchParams

  // Validate forum type
  if (!["events", "scams", "suggestions"].includes(type)) {
    return notFound()
  }

  const forumInfo = forumTypes[type as keyof typeof forumTypes]
  const posts = await getPosts(type, city)

  // Get current session
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{forumInfo.title}</h1>
        <p className="mt-2 text-muted-foreground">{forumInfo.description}</p>
      </div>

      <div className="mb-8">
        <CitySelector />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Tabs defaultValue={city || "all"} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href={`/forums/${type}`}>All Cities</Link>
            </TabsTrigger>
            <TabsTrigger value="nyc" asChild>
              <Link href={`/forums/${type}?city=nyc`}>New York</Link>
            </TabsTrigger>
            <TabsTrigger value="tokyo" asChild>
              <Link href={`/forums/${type}?city=tokyo`}>Tokyo</Link>
            </TabsTrigger>
            <TabsTrigger value="paris" asChild>
              <Link href={`/forums/${type}?city=paris`}>Paris</Link>
            </TabsTrigger>
            <TabsTrigger value="bangkok" asChild>
              <Link href={`/forums/${type}?city=bangkok`}>Bangkok</Link>
            </TabsTrigger>
            <TabsTrigger value="chennai" asChild>
              <Link href={`/forums/${type}?city=chennai`}>chennai</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Link href={`/forums/${type}/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <PostList posts={posts} type={type} />
    </div>
  )
}
