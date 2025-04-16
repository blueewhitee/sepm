import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DiditProvider } from "@/contexts/didit-context"
import NavBar from "@/components/nav-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Urban Crash",
  description: "Share and discover city-specific information for travelers",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <DiditProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <NavBar />
                <main className="flex-1">{children}</main>
              </div>
            </AuthProvider>
          </DiditProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}