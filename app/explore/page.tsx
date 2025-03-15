'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { contract } from '@/lib/contract'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { OpportunityCard } from "@/components/opportunity-card"

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        if (!window.ethereum) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const campaignContract = new ethers.Contract(contract.address, contract.abi, provider)
        
        const totalCampaigns = await campaignContract.getTotalCampaigns()
        const campaignsCount = parseInt(totalCampaigns.toString())
        const campaignData = []

        for (let i = 1; i <= campaignsCount; i++) {
          const campaign = await campaignContract.campaigns(i)
          campaignData.push({
            id: i,
            title: campaign.name,
            description: campaign.description,
            imageUrl: campaign.imageUrl,
            documentUrl: campaign.documentUrl,
            raised: Number(ethers.formatUnits(campaign.raisedNow, 6)),
            goal: Number(ethers.formatUnits(campaign.totalRaise, 6)),
            progress: Number(campaign.raisedNow) * 100 / Number(campaign.totalRaise),
            recipient: {
              address: campaign.recipientAddress,
              verified: true
            }
          })
        }

        setCampaigns(campaignData)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explore Opportunities</h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Browse through verified donation opportunities and support causes that matter to you.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              Loading campaigns...
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((item) => (
                <OpportunityCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No campaigns available at the moment.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}