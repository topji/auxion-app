'use client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Globe, Heart, Shield, Zap, Users, TrendingUp, CheckCircle2 } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { OpportunityCard } from "@/components/opportunity-card"
import { WalletConnect } from "@/components/wallet-connect"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { contract } from "@/lib/contract"


export default function Home() {
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
        console.log("totalCampaigns", campaignsCount)
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
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url('https://campaigncrypto.s3.us-east-1.amazonaws.com/op-main.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: '0.15' // Adjust this value to make the background more/less visible
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background z-10"></div>
          
          {/* Content */}
          <div className="container relative z-20 px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex mb-2 bg-primary/20 text-primary-foreground border-none">
                    Crypto for the needy
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Crypto Donations Made Simple & Transparent.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Support Verified Recipients with <span className="gradient-text">Crypto permissionless.</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 min-[400px]:flex-row">
                  <Button 
                    size="lg" 
                    className="bg-purple-gradient"
                    asChild
                  >
                    <Link href="/explore">
                      Donate Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gradient-border"
                    asChild
                  >
                    <Link href="/recipient">
                      Raise Funds
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Verified Recipients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Transparent Fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Secure Transactions</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"></div>
                <div className="relative w-full max-w-sm mx-auto animate-float">
                  <Image
                    src="https://campaigncrypto.s3.us-east-1.amazonaws.com/op-main.jpeg"
                    width={400}
                    height={400}
                    alt="Crypto Donations"
                    className="rounded-lg shadow-2xl glow"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Opportunities Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <Badge className="bg-primary/20 text-primary-foreground border-none">Featured Opportunities</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Make an Impact Today</h2>
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
              <Carousel className="w-full">
                <CarouselContent>
                  {campaigns.map((item, index) => (
                    <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
                      <OpportunityCard {...item} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="text-center text-muted-foreground">
                No campaigns available at the moment.
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Button size="lg" variant="outline" className="gradient-border" asChild>
                <Link href="/explore">
                  View All Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <Badge className="bg-primary/20 text-primary-foreground border-none">Simple Process</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Auxion Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes it easy to donate cryptocurrency to verified recipients with full transparency.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
              <Card className="bg-background/60 backdrop-blur border-primary/10 gradient-border">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Recipients Verify</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Recipients complete KYC verification and provide proof of work to establish credibility and
                    transparency.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/60 backdrop-blur border-primary/10 gradient-border">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>2. Donors Choose</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Donors browse verified opportunities and select causes that align with their values and preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/60 backdrop-blur border-primary/10 gradient-border">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>3. Smart Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Smart contracts automatically handle the donation, deducting a 5% fee and transferring the remainder
                    to recipients.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <Badge className="bg-primary/20 text-primary-foreground border-none">Platform Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Auxion</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers unique features designed to make cryptocurrency donations secure, transparent, and
                  effective.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-primary" />}
                title="Security & Transparency"
                description="Smart contract-based transactions ensure transparency in fund distribution with immutable proof storage."
              />
              <FeatureCard
                icon={<Globe className="h-10 w-10 text-primary" />}
                title="Global Reach"
                description="Support recipients worldwide with geographic filtering to find causes in regions you care about."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Verified Recipients"
                description="All recipients undergo KYC verification and provide proof of work to establish credibility."
              />
              <FeatureCard
                icon={<TrendingUp className="h-10 w-10 text-primary" />}
                title="Low Transaction Fees"
                description="Only 5% fee on donations, significantly lower than traditional donation platforms."
              />
              <FeatureCard
                icon={<Heart className="h-10 w-10 text-primary" />}
                title="Anonymous Donations"
                description="Donors can remain anonymous while still tracking their donation history and impact."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Fast Processing"
                description="Cryptocurrency transactions process quickly, getting funds to recipients faster."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 gradient-bg">
          <div className="animated-gradient absolute inset-0"></div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Make a Difference?
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Join Auxion today and start supporting verified recipients with cryptocurrency donations.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row mt-6">
                <WalletConnect />
                <Button size="lg" variant="outline" className="gradient-border">
                  Become a Recipient
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-background/60 backdrop-blur border-primary/10 gradient-border">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

