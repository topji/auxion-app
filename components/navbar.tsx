"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Search, X, User, LogOut, Settings, History, Heart, Globe } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { WalletConnect } from "./wallet-connect"


export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="gradient-bg">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <span className="font-bold text-2xl gradient-text">Auxion</span>
            </Link>
            <nav className="grid gap-4">
              <Link href="/" className="group flex items-center gap-2 text-lg font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/explore" className="group flex items-center gap-2 text-lg font-medium hover:text-primary">
                Explore
              </Link>
              <Link href="/recipient" className="group flex items-center gap-2 text-lg font-medium hover:text-primary">
                Create Campaign
              </Link>
              
              <Link href="/dashboard" className="group flex items-center gap-2 text-lg font-medium hover:text-primary">
                Dashboard
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 mr-6">
          <span className="hidden font-bold text-xl sm:inline-block gradient-text">Auxion</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`transition-colors ${isActive("/") ? "text-primary font-medium" : "text-foreground/60 hover:text-foreground"}`}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={`transition-colors ${isActive("/explore") ? "text-primary font-medium" : "text-foreground/60 hover:text-foreground"}`}
          >
            Explore
          </Link>
          <Link
            href="/recipient"
            className={`transition-colors ${isActive("/about") ? "text-primary font-medium" : "text-foreground/60 hover:text-foreground"}`}
          >
            Create Campaign
          </Link>
          <Link
            href="/dashboard"
            className={`transition-colors ${isActive("/dashboard") ? "text-primary font-medium" : "text-foreground/60 hover:text-foreground"}`}
          >
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center ml-auto gap-2">
            
          <WalletConnect />
        </div>
      </div>
    </header>
  )
}

