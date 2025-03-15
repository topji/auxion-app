'use client'
import { useState, useEffect, use } from 'react'
import { ethers, id } from 'ethers'
import { contract } from '@/lib/contract'
import { USDT_ADDRESS, USDT_ABI } from '@/lib/contract'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, Calendar, CheckCircle2, FileText, FileCheck } from "lucide-react"
import { opportunities } from "@/app/lib/data"
import { notFound } from "next/navigation"
import Link from "next/link"

interface OpportunityCardProps {  
  params: Promise<{
    id: string;
  }>
}

export default function OpportunityPage({ params }: OpportunityCardProps) {
  const { id } = use(params)
  const campaignId = parseInt(id)
  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipientInfo, setRecipientInfo] = useState<any>(null)
  const [donors, setDonors] = useState<any[]>([])

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        if (!window.ethereum) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const campaignContract = new ethers.Contract(contract.address, contract.abi, provider)
        
        const campaignData = await campaignContract.campaigns(campaignId)
        if (!campaignData.name) {
          notFound()
          return
        }

        setCampaign({
          id: campaignId,
          title: campaignData.name,
          description: campaignData.description,
          imageUrl: campaignData.imageUrl,
          documentUrl: campaignData.documentUrl,
          raised: Number(ethers.formatUnits(campaignData.raisedNow, 6)),
          goal: Number(ethers.formatUnits(campaignData.totalRaise, 6)),
          progress: Number(campaignData.raisedNow) * 100 / Number(campaignData.totalRaise),
          recipient: {
            address: campaignData.recipientAddress,
            verified: true
          }
        })
      } catch (error) {
        console.error('Error fetching campaign:', error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId])

  useEffect(() => {
    const fetchRecipientAndDonors = async () => {
      try {
        if (!window.ethereum) return

        const provider = new ethers.BrowserProvider(window.ethereum)
        const campaignContract = new ethers.Contract(contract.address, contract.abi, provider)
        
        // Fetch recipient info
        const recipientData = await campaignContract.recipients(campaign.recipient.address)
        setRecipientInfo({
          name: recipientData.name,
          description: recipientData.description,
          website: recipientData.website,
          verified: recipientData.verified
        })

        // Fetch donors and amounts
        const donorsList = await campaignContract.getCampaignDonors(campaignId)
        const amountsList = await campaignContract.getCampaignAmounts(campaignId)
        
        const donorsData = donorsList.map((donor: string, index: number) => ({
          address: donor,
          amount: Number(ethers.formatUnits(amountsList[index], 6))
        }))

    
        setDonors(donorsData)

      } catch (error) {
        console.error('Error fetching recipient and donors:', error)
      }
    }

    if (campaign) {
      fetchRecipientAndDonors()
    }
  }, [campaign, campaignId])

  const handleDonate = async () => {
    try {
      setIsSubmitting(true)
      if (!window.ethereum) throw new Error('Please install MetaMask!')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // First approve USDT transfer
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)
      const amount = ethers.parseUnits(donationAmount, 6)
      
      const approveTx = await usdtContract.approve(contract.address, amount)
      await approveTx.wait()

      // Then make donation
      const campaignContract = new ethers.Contract(contract.address, contract.abi, signer)
      const donateTx = await campaignContract.donate(campaignId, donationAmount)
      await donateTx.wait()

      alert('Donation successful!')
      window.location.reload()
    } catch (error: any) {
      console.error('Error donating:', error)
      alert(error.message || 'Failed to donate')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!campaign) return notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative">
                <Image
                  src={campaign.imageUrl}
                  width={800}
                  height={400}
                  alt={campaign.title}
                  className="w-full rounded-lg object-cover aspect-video"
                />
                <Badge className="absolute top-4 right-4 bg-primary/90">{campaign.category}</Badge>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{campaign.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{campaign.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted 2 weeks ago</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Verified</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="proof">Proof</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4 py-4">
                  <p>{campaign.description}</p>
                  <p>
                    With your support, we will construct a modern facility with 8 classrooms, a library, computer lab,
                    and proper sanitation facilities. This will create a conducive learning environment and improve
                    educational outcomes for children.
                  </p>
                  <h3 className="text-xl font-semibold mt-6 mb-2">How $1K Could Help</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>$1,000 can fund the construction of one classroom</li>
                    <li>$500 can provide desks and chairs for 25 students</li>
                    <li>$250 can supply textbooks and learning materials for a class</li>
                    <li>$100 can install proper lighting in a classroom</li>
                  </ul>
                  <h3 className="text-xl font-semibold mt-6 mb-2">Project Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-24 font-medium">Phase 1</div>
                      <div>Foundation and structural work (2 months)</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 font-medium">Phase 2</div>
                      <div>Walls, roofing, and exterior finishing (3 months)</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 font-medium">Phase 3</div>
                      <div>Interior work and furnishing (2 months)</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24 font-medium">Completion</div>
                      <div>School opening and handover to community</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="proof" className="space-y-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Project Proposal</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Detailed project proposal with budget breakdown and implementation plan.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          asChild
                        >
                          <Link href={campaign.recipient.projectDocsUrl} target="_blank">
                            <FileCheck className="mr-2 h-4 w-4" />
                            View Document
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">ID Verification</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Official identification and verification documents.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          asChild
                        >
                          <Link href={campaign.recipient.idProofUrl} target="_blank">
                            <FileCheck className="mr-2 h-4 w-4" />
                            View Documents
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle>Donation Progress</CardTitle>
                  <CardDescription>Help us reach our goal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">${campaign.raised.toLocaleString()}</span>
                    <span className="text-muted-foreground"> of ${campaign.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div 
                      className="bg-primary h-4 rounded-full" 
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{campaign.progress.toFixed(2)}% Complete</span>
                    <span>${(campaign.goal - campaign.raised).toLocaleString()} to go</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Donation Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    className="w-full bg-purple-gradient" 
                    onClick={handleDonate}
                    disabled={isSubmitting || !donationAmount}
                  >
                    {isSubmitting ? 'Processing...' : 'Donate Now'}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recipient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{recipientInfo?.name?.slice(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{recipientInfo?.name || 'Loading...'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {recipientInfo?.verified ? 'Verified Recipient' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>{recipientInfo?.description || 'No description available'}</p>
                    {recipientInfo?.website && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>{recipientInfo.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Donors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donors.length > 0 ? (
                      donors.slice(0, 5).map((donor, index) => (
                        <div key={`${donor.address}-${index}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {donor.address.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {donor.address.slice(0, 6)}...{donor.address.slice(-4)}
                              </p>
                              <p className="text-xs text-muted-foreground">Recent donor</p>
                            </div>
                          </div>
                          <span className="font-medium">${donor.amount.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        No donations yet. Be the first to donate!
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="w-full">
                    View All Donors
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

