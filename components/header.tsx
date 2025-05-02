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
import { Menu, Search, ShoppingCart, ChevronDown } from "lucide-react"
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
    <header className="sticky top-0 z-50 w-full border-b  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-white shadow-lg">
      {/* Top announcement bar */}
      {/* <div className="bg-yellow-500 text-green-900 text-xs py-1 px-4 text-center font-medium">
        🇳🇬 Pay with crypto & get 10% bonus! • Free Lagos delivery for orders over ₦50k
      </div> */}

      <div className="container flex h-16 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden text-white hover:bg-green-600">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-green-800 border-r-green-600">
            <Link href="/" className="flex items-center mb-6">
              <span className="font-bold text-xl text-yellow-400">smartBuy</span>
            </Link>
            <nav className="grid gap-4">
              {[
                { name: "Home", href: "/" },
                { name: "Marketplace", href: "/marketplace" },
                { name: "Categories", href: "#", subItems: categories },
                { name: "Auctions", href: "/auctions" },
                { name: "Sell", href: "/sell" },
                { name: "Wallet", href: "/wallet" },
              ].map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <p className="font-medium text-yellow-300">{item.name}</p>
                      <div className="pl-2 space-y-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className="block text-sm text-green-100 hover:text-yellow-300"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "block font-medium hover:text-yellow-300",
                        pathname === item.href ? "text-yellow-400" : "text-green-100"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-3xl text-yellow-400">SmartBuy</span>
        </Link>

        {/* Desktop navigation */}
        <NavigationMenu className="hidden md:flex mx-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/marketplace" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-white hover:bg-green-600")}>
                  Marketplace
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-1 text-white hover:bg-green-600">
                Categories <ChevronDown className="h-4 w-4" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-green-700 border-green-600">
                <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {categories.map((category) => (
                    <Link
                      key={category.title}
                      href={category.href}
                      className="group flex items-start space-x-3 rounded-md p-3 transition-colors hover:bg-green-600"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-yellow-300">{category.title}</p>
                        <p className="text-xs text-green-100">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/auctions" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-white hover:bg-green-600")}>
                  Auctions
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/sell" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-white hover:bg-green-600")}>
                  Sell
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search and actions */}
        <div className="flex items-center ml-auto space-x-3">
          {/* Desktop search */}
          <div className="hidden md:flex relative w-64">
            <Input
              type="search"
              placeholder="Search products..."
              className="rounded-full bg-green- placeholder:text-green-200 text-white border-green-500 focus-visible:ring-2 focus-visible:ring-yellow-400"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9 rounded-l-none rounded-r-full hover:bg-green-500"
            >
              <Search className="h-4 w-4 text-yellow-300" />
            </Button>
          </div>

          {/* Mobile search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-green-600"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-600">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-yellow-500 text-green-900 hover:bg-yellow-400">
                0
              </Badge>
            </Button>
          </Link>

          {/* User account */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-green-600">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-yellow-500 text-green-900">
                      {localStorage.getItem('userInitial') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-green-700 border-green-600 text-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>My Account</p>
                    <p className="text-xs font-normal text-green-200">
                      Balance: {isNaN(balance) ? "0.00" : balance.toFixed(2)} ₳
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-600" />
                <DropdownMenuItem className="hover:bg-green-600 focus:bg-green-600">
                  <Link href="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-green-600 focus:bg-green-600">
                  <Link href="/orders" className="w-full">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-green-600 focus:bg-green-600">
                  <Link href="/wallet" className="w-full">Wallet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-green-600 focus:bg-green-600">
                  <Link href="/sell/listings" className="w-full">My Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-green-600" />
                <DropdownMenuItem 
                  className="hover:bg-green-600 focus:bg-green-600"
                  onClick={disconnectWallet}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <WalletButton className="hidden md:flex bg-yellow-500 hover:bg-yellow-400 text-green-900" />
          )}
        </div>
      </div>

      {/* Mobile search panel */}
      {isSearchOpen && (
        <div className="md:hidden p-2 border-t border-green-600 bg-green-700">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search products..."
              className="bg-green-600 placeholder:text-green-200 text-white border-green-500 focus-visible:ring-2 focus-visible:ring-yellow-400"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-white hover:bg-green-600"
              onClick={() => setIsSearchOpen(false)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

const categories = [
  {
    title: "Phones & Tablets",
    description: "Latest smartphones and tablets",
    href: "/marketplace/electronics/phones",
  },
  {
    title: "Computers",
    description: "Laptops, desktops and accessories",
    href: "/marketplace/electronics/computers",
  },
  {
    title: "Fashion",
    description: "Clothing, shoes and accessories",
    href: "/marketplace/fashion",
  },
  {
    title: "Home & Kitchen",
    description: "Furniture and kitchen appliances",
    href: "/marketplace/home",
  },
  {
    title: "Automobile",
    description: "Car parts and accessories",
    href: "/marketplace/automobile",
  },
  {
    title: "Beauty & Personal Care",
    description: "Cosmetics and grooming products",
    href: "/marketplace/beauty",
  },
]