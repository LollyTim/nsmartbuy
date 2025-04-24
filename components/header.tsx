"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Menu, Search, ShoppingCart } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import WalletButton from "@/components/wallet-button"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { isConnected, disconnectWallet, balance } = useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className={cn("hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className={cn(
                  "hover:text-foreground/80",
                  pathname?.startsWith("/marketplace") ? "text-foreground" : "text-foreground/60",
                )}
              >
                Marketplace
              </Link>
              <Link
                href="/auctions"
                className={cn(
                  "hover:text-foreground/80",
                  pathname?.startsWith("/auctions") ? "text-foreground" : "text-foreground/60",
                )}
              >
                Auctions
              </Link>
              <Link
                href="/wallet"
                className={cn(
                  "hover:text-foreground/80",
                  pathname?.startsWith("/wallet") ? "text-foreground" : "text-foreground/60",
                )}
              >
                Wallet
              </Link>
              <Link
                href="/sell"
                className={cn(
                  "hover:text-foreground/80",
                  pathname?.startsWith("/sell") ? "text-foreground" : "text-foreground/60",
                )}
              >
                Sell
              </Link>
              <Link
                href="/documentation"
                className={cn(
                  "hover:text-foreground/80",
                  pathname?.startsWith("/documentation") ? "text-foreground" : "text-foreground/60",
                )}
              >
                Documentation
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">TrustEcom</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/marketplace" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Marketplace</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {categories.map((category) => (
                    <li key={category.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={category.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{category.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {category.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/auctions" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Auctions</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/sell" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Sell</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/documentation" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center ml-auto">
          <div className="hidden md:flex relative mr-4">
            {isSearchOpen ? (
              <div className="absolute right-0 top-0 w-60">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full"
                  onBlur={() => setIsSearchOpen(false)}
                  autoFocus
                />
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="mr-2 relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">0</Badge>
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs">
                  Balance: {isNaN(balance) ? "0.00" : balance.toFixed(2)} ₳
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/wallet" className="w-full">
                    Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/wallet/buy-ada" className="w-full">
                    Buy ADA
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/wallet/sell-ada" className="w-full">
                    Sell ADA
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/my-purchases" className="w-full">
                    My Purchases
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/my-listings" className="w-full">
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnectWallet}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <WalletButton />
          )}
        </div>
      </div>
    </header>
  )
}

const categories = [
  {
    title: "Electronics",
    description: "Smartphones, laptops, and other tech gadgets with verified authenticity.",
    href: "/marketplace/electronics",
  },
  {
    title: "Collectibles",
    description: "Rare items and collectibles with blockchain-verified provenance.",
    href: "/marketplace/collectibles",
  },
  {
    title: "Fashion",
    description: "Authentic designer clothing and accessories.",
    href: "/marketplace/fashion",
  },
  {
    title: "Art",
    description: "Digital and physical art with NFT certificates of authenticity.",
    href: "/marketplace/art",
  },
]

