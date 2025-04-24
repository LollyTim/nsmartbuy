"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/context/wallet-context"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, User, Copy, CheckCircle, ExternalLink, Pencil, Save } from "lucide-react"
import NFTGallery from "@/components/nft-gallery"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  name: string
  email: string
  phone: string
  businessName: string
  businessDescription: string
  website: string
  country: string
  city: string
  profileImage: string | null
  walletAddress: string
}

export default function ProfilePage() {
  const { isConnected, address, connectWallet } = useWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    website: "",
    country: "",
    city: "",
    profileImage: null,
    walletAddress: address || "",
  })

  // Load profile data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile(address)
    }
  }, [isConnected, address])

  // Update wallet address in profile when it changes
  useEffect(() => {
    if (address) {
      setProfile((prev) => ({
        ...prev,
        walletAddress: address,
      }))
    }
  }, [address])

  const loadUserProfile = async (walletAddress: string) => {
    setIsLoading(true)
    try {
      // In a real implementation, you would fetch this from your Convex database
      // For example:
      // const userProfile = await convex.query('profiles.getByWalletAddress', { walletAddress })

      // For demo purposes, we'll use mock data or localStorage
      const savedProfile = localStorage.getItem(`profile_${walletAddress}`)

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        setProfileImage(parsedProfile.profileImage)
      } else {
        // Set default profile with wallet address
        setProfile({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          businessDescription: "",
          website: "",
          country: "",
          city: "",
          profileImage: null,
          walletAddress: walletAddress,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Upload profile image if changed
      let imageUrl = profile.profileImage
      if (imageFile) {
        imageUrl = await uploadProfileImage(imageFile)
      }

      // Update profile with new image URL
      const updatedProfile = {
        ...profile,
        profileImage: imageUrl,
      }

      // In a real implementation, you would save this to your Convex database
      // For example:
      // await convex.mutation('profiles.upsert', updatedProfile)

      // For demo purposes, we'll use localStorage
      localStorage.setItem(`profile_${address}`, JSON.stringify(updatedProfile))

      setProfile(updatedProfile)
      setIsEditing(false)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Fix potential issues with profile image upload
  const uploadProfileImage = async (file: File): Promise<string> => {
    try {
      // Try to upload to IPFS first
      const formData = new FormData()
      formData.append("file", file)
      formData.append("walletAddress", address || "")

      const response = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.gateway_url || data.url
      }

      // Fallback to base64 if IPFS upload fails
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error("Error uploading profile image:", error)

      // Fallback to base64 if any error occurs
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your wallet to access your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => connectWallet()}>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt={profile.name || "User"} />
                  ) : (
                    <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-background"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                    />
                  </Button>
                )}
              </div>
            </div>
            <CardTitle>{profile.name || "Unnamed User"}</CardTitle>
            <CardDescription>{profile.businessName || "No business name set"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wallet Address</span>
              <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="bg-muted p-2 rounded-md">
              <p className="text-xs font-mono truncate">{address}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Status</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Verified
              </Badge>
            </div>

            {!isEditing ? (
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button className="w-full mt-4" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            )}

            <div className="pt-4">
              <a
                href={`https://cardanoscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Cardano Explorer
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="business">Business Info</TabsTrigger>
              <TabsTrigger value="assets">My Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            value={profile.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={profile.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={profile.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            placeholder="Enter your country"
                            value={profile.country}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Enter your city"
                          value={profile.city}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p>{profile.name || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                          <p>{profile.email || "Not provided"}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p>{profile.phone || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Country</p>
                          <p>{profile.country || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p>{profile.city || "Not provided"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          name="businessName"
                          placeholder="Enter your business name"
                          value={profile.businessName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessDescription">Business Description</Label>
                        <Textarea
                          id="businessDescription"
                          name="businessDescription"
                          placeholder="Describe your business"
                          className="min-h-[100px]"
                          value={profile.businessDescription}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          placeholder="Enter your website URL"
                          value={profile.website}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                        <p>{profile.businessName || "Not provided"}</p>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Business Description</p>
                        <p className="whitespace-pre-wrap">{profile.businessDescription || "Not provided"}</p>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Website</p>
                        {profile.website ? (
                          <a
                            href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            {profile.website}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          <p>Not provided</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Your business information will be displayed on your product listings and helps build trust with
                  buyers.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My NFT Assets</CardTitle>
                  <CardDescription>View your NFT certificates and collectibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <NFTGallery />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

