import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">TrustEcom</h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              A transparent blockchain-based e-commerce marketplace powered by Cardano.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="text-muted-foreground hover:text-foreground">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href="/marketplace/featured" className="text-muted-foreground hover:text-foreground">
                  Featured Items
                </Link>
              </li>
              <li>
                <Link href="/marketplace/new" className="text-muted-foreground hover:text-foreground">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-muted-foreground hover:text-foreground">
                  My Wallet
                </Link>
              </li>
              <li>
                <Link href="/my-purchases" className="text-muted-foreground hover:text-foreground">
                  Purchase History
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="text-muted-foreground hover:text-foreground">
                  My Listings
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest products and blockchain news.
            </p>
            <form className="flex space-x-2">
              <Input type="email" placeholder="Enter your email" className="max-w-[300px] h-9 text-sm" />
              <Button type="submit" size="sm">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t">
          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} TrustEcom. All rights reserved. Powered by Cardano Blockchain.
          </p>
        </div>
      </div>
    </footer>
  )
}

