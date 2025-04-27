"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { useCartStore } from "@/lib/cart-store"
// import type { CartItem } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CartItem, useCartStore } from "../lib/cart-store"

export function CartButton() {
    const { items } = useCartStore()
    const itemCount = items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0)
    const totalPrice = items.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0)

    return (
        <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
                    >
                        {itemCount}
                    </Badge>
                )}
            </Button>
        </Link>
    )
} 