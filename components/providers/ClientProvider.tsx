'use client'

import { useEffect, useState } from "react"

export function ClientProvider({
  children,
  fallback = <div className="flex-1 flex items-center justify-center">Loading...</div>
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback
  }

  return <>{children}</>
}
