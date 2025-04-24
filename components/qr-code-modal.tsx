"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QRCodeModalProps {
  address: string
  size?: number
}

export default function QRCodeModal({ address, size = 250 }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [qrSize, setQrSize] = useState(size)

  // Reset copied state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
    }
  }, [isOpen])

  // Adjust QR code size based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Make QR code responsive based on screen width
      const width = window.innerWidth
      if (width < 640) {
        // Small screens
        setQrSize(Math.min(width * 0.7, 200))
      } else {
        setQrSize(size)
      }
    }

    handleResize() // Initial size
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [size])

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <QrCode className="h-4 w-4" />
          <span className="sr-only">Show QR code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet Address QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 space-y-6">
          <div className="bg-white p-4 rounded-lg flex items-center justify-center">
            <QRCode
              value={address}
              size={qrSize}
              renderAs="svg"
              includeMargin
              level="H"
              className="max-w-full h-auto"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center space-x-2">
              <div className="bg-muted p-2 rounded-md flex-1 font-mono text-xs overflow-hidden">
                <span className="block truncate">{address}</span>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Scan this QR code to send ADA to this wallet
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

