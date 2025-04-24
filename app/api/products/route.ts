import { NextResponse } from "next/server"

// Mock database for products
const products = [
  {
    id: "prod_1",
    name: "Premium Smartwatch",
    description: "A high-quality smartwatch with blockchain verification",
    price: 150,
    currency: "₳",
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4x",
    status: "active",
    sellerAddress:
      "addr1qxy8epmr7yrj28hyltk7tgx0x7n3dpjumc0m8mhm3vrcl6xn9yh6j7vmy7unhf5haksvjnn6h5trd2kv0zuaqjyh0jmqm36a4z",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_2",
    name: "Vintage Collectible",
    description: "A rare collectible with verified authenticity",
    price: 80,
    currency: "₳",
    image: "/placeholder.svg?height=300&width=300",
    category: "Collectibles",
    tokenId: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4y",
    status: "active",
    sellerAddress:
      "addr1qxy8epmr7yrj28hyltk7tgx0x7n3dpjumc0m8mhm3vrcl6xn9yh6j7vmy7unhf5haksvjnn6h5trd2kv0zuaqjyh0jmqm36a4z",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// GET all products or filter by seller address
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerAddress = searchParams.get("seller")

    if (sellerAddress) {
      const filteredProducts = products.filter((product) => product.sellerAddress === sellerAddress)
      return NextResponse.json(filteredProducts)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST a new product
export async function POST(request: Request) {
  try {
    const product = await request.json()

    // Validate required fields
    if (!product.name || !product.price || !product.sellerAddress) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, and sellerAddress are required" },
        { status: 400 },
      )
    }

    // Generate a unique ID
    const newProduct = {
      id: `prod_${Date.now()}`,
      ...product,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    // Add to our mock database
    products.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

