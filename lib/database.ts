import { supabase } from "./supabase"

// Types
export type Post = {
  id: string
  title: string
  content: string
  city: string
  forum_type: "events" | "scams" | "suggestions"
  user_id: string
  created_at: string
  event_date?: string
  event_location?: string
  scam_type?: string
  scam_location?: string
  place_name?: string
  place_address?: string
  author?: string
}

export type Comment = {
  id: string
  content: string
  user_id: string
  post_id?: string
  stay_request_id?: string
  created_at: string
  author?: string
}

export type StayRequest = {
  id: string
  city: string
  start_date: string
  end_date: string
  budget: string
  description: string
  user_id: string
  created_at: string
  author?: string
}

export type User = {
  id: string
  email: string
  name: string
  created_at: string
  id_verified: boolean
  face_verified: boolean
}

// Posts
export async function getPosts(forumType: string, city?: string) {
  let query = supabase
    .from("posts")
    .select(`
      *,
      users (name)
    `)
    .eq("forum_type", forumType)
    .order("created_at", { ascending: false })

  if (city) {
    query = query.eq("city", city)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return data.map((post) => ({
    ...post,
    author: post.users?.name,
  }))
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      users (name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching post:", error)
    return null
  }

  return {
    ...data,
    author: data.users?.name,
  }
}

export async function createPost(post: Omit<Post, "id" | "created_at" | "author">) {
  const { data, error } = await supabase.from("posts").insert(post).select()

  if (error) {
    console.error("Error creating post:", error)
    return null
  }

  return data[0]
}

// Comments
export async function getCommentsByPostId(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users (name)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  return data.map((comment) => ({
    ...comment,
    author: comment.users?.name,
  }))
}

export async function getCommentsByStayRequestId(stayRequestId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users (name)
    `)
    .eq("stay_request_id", stayRequestId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  return data.map((comment) => ({
    ...comment,
    author: comment.users?.name,
  }))
}

export async function createComment(comment: Omit<Comment, "id" | "created_at" | "author">) {
  const { data, error } = await supabase.from("comments").insert(comment).select()

  if (error) {
    console.error("Error creating comment:", error)
    return null
  }

  return data[0]
}

// Stay Requests
export async function getStayRequests(city?: string) {
  let query = supabase
    .from("stay_requests")
    .select(`
      *,
      users (name)
    `)
    .order("created_at", { ascending: false })

  if (city) {
    query = query.eq("city", city)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching stay requests:", error)
    return []
  }

  return data.map((request) => ({
    ...request,
    author: request.users?.name,
  }))
}

export async function getStayRequestById(id: string) {
  const { data, error } = await supabase
    .from("stay_requests")
    .select(`
      *,
      users (name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching stay request:", error)
    return null
  }

  return {
    ...data,
    author: data.users?.name,
  }
}

export async function createStayRequest(request: Omit<StayRequest, "id" | "created_at" | "author">) {
  const { data, error } = await supabase.from("stay_requests").insert(request).select()

  if (error) {
    console.error("Error creating stay request:", error)
    return null
  }

  return data[0]
}

// User verification
export async function updateUserVerification(userId: string, field: "id_verified" | "face_verified", value: boolean) {
  const { data, error } = await supabase
    .from("users")
    .update({ [field]: value })
    .eq("id", userId)
    .select()

  if (error) {
    console.error("Error updating user verification:", error)
    return null
  }

  return data[0]
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}
