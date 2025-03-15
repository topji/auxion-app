'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { contract } from '@/lib/contract'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Info, Upload, CheckCircle2 } from 'lucide-react'

export default function RecipientPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')


  // Recipient Registration Form State
  const [recipientForm, setRecipientForm] = useState({
    name: '',
    country: '',
    idProof: null as File | null
  })

  // Campaign Creation Form State
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    documentUrl: '',
    imageUrl: '',
    totalRaise: ''
  })

  // Check if user is registered recipient

  // Check wallet connection and verification status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (!window.ethereum) {
          setIsLoading(false)
          return
        }

        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length === 0) {
          setIsLoading(false)
          return
        }

        setIsWalletConnected(true)
        setWalletAddress(accounts[0].address)

        // Check if recipient is registered on contract
        const signer = await provider.getSigner()
        const campaignContract = new ethers.Contract(contract.address, contract.abi, signer)
        const recipient = await campaignContract.recipients(accounts[0].address)
        
        if (recipient.name !== '') {
          setIsRegistered(true)
          setIsLoading(false)
          return
        }

        // Check if verification is pending
        const response = await fetch(`http://localhost:5001/verificationSent/${accounts[0].address}`)
        const data = await response.json()
        setIsVerificationSent(data.verified)
        
      } catch (error) {
        console.error('Error checking status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  const handleRecipientRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!window.ethereum) throw new Error('Please install MetaMask!')
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const walletAddress = await signer.getAddress()

      const formData = new FormData()
      formData.append('username', recipientForm.name)
      formData.append('walletAddress', walletAddress)
      formData.append('country', recipientForm.country)
      
      if (!recipientForm.idProof) {
        throw new Error('Please upload your ID proof')
      }
      formData.append('identityProof', recipientForm.idProof)

      const response = await fetch('http://localhost:5001/verificationRequest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit verification request')
      }

      const data = await response.json()
      setIsVerificationSent(true)
      alert('Verification request submitted successfully. Please wait for admin approval.')
      
    } catch (error: any) {
      console.error('Error submitting verification:', error)
      alert(error.message || 'Failed to submit verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCampaignCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!window.ethereum) throw new Error('Please install MetaMask!')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const campaignContract = new ethers.Contract(contract.address, contract.abi, signer)

      const totalRaiseAmount = ethers.parseUnits(campaignForm.totalRaise, 6) // 6 decimals for USDT

      const tx = await campaignContract.createCampaign(
        campaignForm.name,
        campaignForm.description,
        campaignForm.documentUrl,
        campaignForm.imageUrl,
        totalRaiseAmount
      )

      await tx.wait()
      alert('Campaign created successfully!')
      // Optionally redirect to campaigns page
      window.location.href = '/campaigns'
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      alert(error.message || 'Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render different states
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isWalletConnected) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Please connect your wallet to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Wallet Required</AlertTitle>
                <AlertDescription>
                  You need to connect your MetaMask wallet to register as a recipient
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (isVerificationSent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Pending</CardTitle>
              <CardDescription>Your verification request is being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Under Review</AlertTitle>
                <AlertDescription>
                  Please wait while we verify your recipient registration request. This usually takes 24-48 hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-2xl mx-auto py-8 px-4">
        {!isRegistered ? (
          // Recipient Registration Form
          <Card>
            <CardHeader>
              <CardTitle>Register as Recipient</CardTitle>
              <CardDescription>Complete verification to start raising funds</CardDescription>
            </CardHeader>
            <form onSubmit={handleRecipientRegistration}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={recipientForm.name}
                    onChange={(e) => setRecipientForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={recipientForm.country}
                    onChange={(e) => setRecipientForm(prev => ({...prev, country: e.target.value}))}
                    placeholder="Enter your country"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idProof">Identity Proof</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="file"
                      id="idProof"
                      className="hidden"
                      onChange={(e) => setRecipientForm(prev => ({
                        ...prev, 
                        idProof: e.target.files?.[0] || null
                      }))}
                      accept="image/*,.pdf"
                    />
                    <label htmlFor="idProof" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        {recipientForm.idProof ? recipientForm.idProof.name : 'Upload ID Proof'}
                      </span>
                    </label>
                  </div>
                  {recipientForm.idProof && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>File selected: {recipientForm.idProof.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRecipientForm(prev => ({ ...prev, idProof: null }))}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Verification Required</AlertTitle>
                  <AlertDescription>
                    Your application will be reviewed within 24-48 hours
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          // Campaign Creation Form
          <Card>
            <CardHeader>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>Set up your fundraising campaign</CardDescription>
            </CardHeader>
            <form onSubmit={handleCampaignCreation}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea
                    id="description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your campaign"
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentUrl">Document URL</Label>
                  <Input
                    id="documentUrl"
                    value={campaignForm.documentUrl}
                    onChange={(e) => setCampaignForm(prev => ({...prev, documentUrl: e.target.value}))}
                    placeholder="Link to campaign documentation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={campaignForm.imageUrl}
                    onChange={(e) => setCampaignForm(prev => ({...prev, imageUrl: e.target.value}))}
                    placeholder="Link to campaign image"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalRaise">Funding Goal (USDT)</Label>
                  <Input
                    id="totalRaise"
                    type="number"
                    value={campaignForm.totalRaise}
                    onChange={(e) => setCampaignForm(prev => ({...prev, totalRaise: e.target.value}))}
                    placeholder="Enter amount in USDT"
                    required
                    min="1"
                    step="1"
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Campaign details cannot be modified after creation
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}