"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useWallet } from "@/context/wallet-context"

interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()
  const { address } = useWallet()

  useEffect(() => {
    if (address) {
      fetchUserProducts(address).then((data) => {
        if (Array.isArray(data)) {
          setProducts(data)
        }
      })
    }
  }, [address])

  // Update the fetchUserProducts function to use the API
  const fetchUserProducts = async (address: string) => {
    try {
      const response = await fetch(`/api/products?seller=${address}`)

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching products:", error)
      return [] // Return empty array on error
    }
  }

  // Update the handleDeleteProduct function to use the API
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting product: ${response.status}`)
      }

      // Remove from local state
      setProducts(products.filter((product) => product.id !== productId))

      toast({
        title: "Product Deleted",
        description: "Your product has been removed from the marketplace.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.length > 0 ? (
        products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover mb-4"
              />
              Price: ${product.price}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button>Update</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your product from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No products found. Start selling by listing a new product.</p>
        </div>
      )}
    </div>
  )
}

export default ProductList

