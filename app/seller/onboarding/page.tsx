"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BadgeCheck, ChevronRight, Upload } from 'lucide-react'

export default function SellerOnboarding() {
    const [step, setStep] = useState(1)
    const [progress, setProgress] = useState(25)
    const router = useRouter()

    const nextStep = () => {
        if (step < 4) {
            setStep(step + 1)
            setProgress(progress + 25)
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1)
            setProgress(progress - 25)
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-800 mb-2">Become a Verified Seller</h1>
                <p className="text-green-600">Complete your store setup in just 4 steps</p>
                <Progress value={progress} className="h-2 mt-4 bg-green-100" />
            </div>

            <Card className="border-green-200 shadow-sm">
                <CardHeader className="bg-green-50 border-b border-green-100">
                    <CardTitle className="text-green-800 flex items-center">
                        {step === 1 && <><BadgeCheck className="h-5 w-5 mr-2" /> Business Information</>}
                        {step === 2 && <><BadgeCheck className="h-5 w-5 mr-2" /> Identity Verification</>}
                        {step === 3 && <><BadgeCheck className="h-5 w-5 mr-2" /> Payment Setup</>}
                        {step === 4 && <><BadgeCheck className="h-5 w-5 mr-2" /> Review & Submit</>}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-green-700 mb-4">Store Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="businessName" className="text-green-700">Store Name*</Label>
                                        <Input 
                                            id="businessName" 
                                            placeholder="e.g. NaijaFashion Emporium" 
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="businessType" className="text-green-700">Business Type*</Label>
                                        <Select>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Individual/Sole Proprietor</SelectItem>
                                                <SelectItem value="llc">Limited Liability Company</SelectItem>
                                                <SelectItem value="enterprise">Business Enterprise</SelectItem>
                                                <SelectItem value="cooperative">Cooperative Society</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-green-700 mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="businessAddress" className="text-green-700">Store Address*</Label>
                                        <Input 
                                            id="businessAddress" 
                                            placeholder="Enter your business address" 
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone" className="text-green-700">WhatsApp Number*</Label>
                                            <Input 
                                                id="phone" 
                                                type="tel" 
                                                placeholder="e.g. +234 812 345 6789" 
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-green-700">Email*</Label>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                placeholder="your@email.com" 
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-green-700 mb-4">Store Description</h3>
                                <div>
                                    <Label htmlFor="storeDescription" className="text-green-700">Tell customers about your store*</Label>
                                    <textarea
                                        id="storeDescription"
                                        rows={3}
                                        className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                        placeholder="Describe what you sell and your unique value proposition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <h3 className="font-medium text-yellow-800 mb-2">Verification Required</h3>
                                <p className="text-sm text-yellow-700">
                                    To comply with Nigerian financial regulations and blockchain marketplace requirements, we need to verify your identity.
                                </p>
                            </div>

                            <div>
                                <Label className="text-green-700">Choose ID Type*</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                    {[
                                        { name: "Int'l Passport", value: "passport" },
                                        { name: "National ID", value: "nin" },
                                        { name: "Driver's License", value: "driver" },
                                        { name: "Voter's Card", value: "voter" },
                                        { name: "BVN Slip", value: "bvn" },
                                        { name: "CAC Certificate", value: "cac" }
                                    ].map((doc) => (
                                        <Button 
                                            key={doc.value}
                                            variant="outline" 
                                            className="h-24 flex flex-col items-center justify-center border-dashed border-green-300 hover:bg-green-50"
                                        >
                                            <span className="text-sm">{doc.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-green-700">Upload Document Front*</Label>
                                    <div className="mt-2 flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                                        <Upload className="h-8 w-8 text-green-500 mb-2" />
                                        <p className="text-sm text-green-700 text-center">
                                            Drag and drop files here <br />
                                            or click to browse
                                        </p>
                                        <p className="text-xs text-green-500 mt-2">
                                            JPG, PNG, PDF (Max 5MB)
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label className="text-green-700">Upload Document Back (if applicable)</Label>
                                    <div className="mt-2 flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                                        <Upload className="h-8 w-8 text-green-500 mb-2" />
                                        <p className="text-sm text-green-700 text-center">
                                            Drag and drop files here <br />
                                            or click to browse
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-green-700">Selfie Holding ID (for verification)*</Label>
                                    <div className="mt-2 flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                                        <Upload className="h-8 w-8 text-green-500 mb-2" />
                                        <p className="text-sm text-green-700 text-center">
                                            Take a clear selfie holding your ID <br />
                                            next to your face
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-green-700 mb-4">Nigerian Bank Account</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="accountName" className="text-green-700">Account Name*</Label>
                                        <Input 
                                            id="accountName" 
                                            placeholder="As it appears on your bank statement" 
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="accountNumber" className="text-green-700">Account Number*</Label>
                                        <Input 
                                            id="accountNumber" 
                                            placeholder="10-digit account number" 
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bankName" className="text-green-700">Bank Name*</Label>
                                        <Select>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select your bank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    "Access Bank", "Zenith Bank", "GTBank", 
                                                    "First Bank", "UBA", "Fidelity Bank",
                                                    "Stanbic IBTC", "Union Bank", "Polaris Bank",
                                                    "Ecobank", "Keystone Bank", "Sterling Bank"
                                                ].map(bank => (
                                                    <SelectItem key={bank} value={bank.toLowerCase().replace(' ', '-')}>
                                                        {bank}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="bvn" className="text-green-700">BVN*</Label>
                                        <Input 
                                            id="bvn" 
                                            placeholder="11-digit Bank Verification Number" 
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-green-700 mb-4">Blockchain Wallet Setup</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="walletAddress" className="text-green-700">Cardano Wallet Address*</Label>
                                        <Input 
                                            id="walletAddress" 
                                            placeholder="addr1q9... (your Cardano address)" 
                                            className="mt-1 font-mono"
                                        />
                                        <p className="text-xs text-green-600 mt-1">
                                            This is where you'll receive crypto payments. Connect your wallet or enter manually.
                                        </p>
                                    </div>
                                    <Button variant="outline" className="border-green-300 text-green-700">
                                        Connect Wallet
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-4">Review Your Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-green-600">Store Name</p>
                                        <p className="font-medium">NaijaFashion Emporium</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">Business Type</p>
                                        <p className="font-medium">Business Enterprise</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">Contact Number</p>
                                        <p className="font-medium">+234 812 345 6789</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">Bank Details</p>
                                        <p className="font-medium">Zenith Bank - 0123456789</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-green-600">Store Description</p>
                                        <p className="font-medium">
                                            We sell authentic Nigerian fashion including Ankara, Adire, and modern African designs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Verification Process</h4>
                                <ul className="text-sm text-yellow-700 space-y-2">
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>Your documents will be reviewed within 24-48 hours</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>You'll receive an email once verified</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>You can start listing products immediately, but payments will be held until verification is complete</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex items-start space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="terms" 
                                    className="h-5 w-5 mt-1 text-green-600 border-green-300 rounded focus:ring-green-500"
                                />
                                <Label htmlFor="terms" className="text-green-700">
                                    I agree to the <a href="#" className="text-green-600 hover:underline font-medium">Terms of Service</a> and confirm that all information provided is accurate. I understand that providing false information may result in account suspension.
                                </Label>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between px-6 py-4 border-t border-green-100">
                    {step > 1 ? (
                        <Button 
                            variant="outline" 
                            onClick={prevStep}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            Back
                        </Button>
                    ) : (
                        <div></div> // Empty div to maintain space
                    )}
                    {step < 4 ? (
                        <Button 
                            onClick={nextStep}
                            className="bg-green-600 hover:bg-green-700 flex items-center"
                        >
                            Continue <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => router.push('/sell/onboard/success')}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Submit Application
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}