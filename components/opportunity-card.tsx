'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Globe } from "lucide-react"

interface OpportunityCardProps {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  raised: number;
  goal: number;
  progress: number;
  imageUrl: string;
}

export function OpportunityCard({ 
  id,
  category,
  title,
  location,
  description,
  raised,
  goal,
  progress,
  imageUrl 
}: OpportunityCardProps) {
  return (
    <Card className="overflow-hidden gradient-border">
      <div className="relative">
        <Image
          src={imageUrl}
          width={400}
          height={200}
          alt={title}
          className="w-full object-cover h-48"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg?height=200&width=400";
          }}
        />
        <Badge className="absolute top-2 right-2 bg-primary/90">{category}</Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Globe className="h-3 w-3" /> {location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
        <div className="mt-4 space-y-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${raised.toLocaleString()} raised</span>
            <span>${goal.toLocaleString()} goal</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-purple-gradient"
          asChild
        >
          <Link href={`/opportunity/${id}`}>
            Donate Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
