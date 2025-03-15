'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ethers } from 'ethers'
import { contract } from '@/lib/contract'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Heart,
  Wallet,
  Clock,
  CheckCircle2,
  PlusCircle,
} from "lucide-react"

interface DonationInfo {
  campaignId: number;
  amount: number;
  campaign: {
    title: string;
    description: string;
    imageUrl: string;
  };
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    totalDonated: 0,
    projectsSupported: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!window.ethereum) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()
        const campaignContract = new ethers.Contract(contract.address, contract.abi, provider)

        // Fetch donor info
        const donorInfo = await campaignContract.getDonorInfo(userAddress)
        const totalDonated = Number(ethers.formatUnits(donorInfo.totalDonated, 6))

        // Process donations array
        const donationsData = await Promise.all(
          donorInfo.donations.map(async (donation: [bigint, bigint]) => {
            const [campaignId, amount] = donation
            const campaign = await campaignContract.campaigns(campaignId)
            return {
              campaignId: Number(campaignId),
              amount: Number(ethers.formatUnits(amount, 6)),
              campaign: {
                title: campaign.name,
                description: campaign.description,
                imageUrl: campaign.imageUrl
              }
            }
          })
        )
        // Sort by amount in descending order
        donationsData.sort((a, b) => b.amount - a.amount)

        setCampaigns(donationsData)
        setUserStats({
          totalDonated,
          projectsSupported: new Set(donationsData.map(d => d.campaignId)).size
        })
        
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container px-4 py-8">
          Loading...
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <div className="container px-4 py-8 md:py-12">
          <main className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <Button className="bg-purple-gradient" asChild>
                <Link href="/explore">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Donation
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${userStats.totalDonated.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Lifetime donations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects Supported</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.projectsSupported}</div>
                  <p className="text-xs text-muted-foreground">Active campaigns</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Your donation history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.length > 0 ? (
                    campaigns.map((donation) => (
                      <div key={`${donation.campaignId}-${donation.amount}`} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border p-4">
                        <div className="grid gap-1">
                          <div className="font-medium">{donation.campaign.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Campaign #{donation.campaignId}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-medium">${donation.amount.toLocaleString()}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No donations yet. Start supporting projects!
                    </div>
                  )}
                </div>
              </CardContent>
              {campaigns.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/history">View All History</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}