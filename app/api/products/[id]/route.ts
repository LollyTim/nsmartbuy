import { NextResponse } from "next/server";

// This is a reference to our mock database from the main products route
// In a real app, you would use a proper database
let products = [
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
];

interface RouteContext {
  params: {
    id: string;
  };
}

// GET a specific product by ID
export async function GET(request: Request, context: RouteContext) {
  try {
    const product = products.find((p) => p.id === context.params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT/UPDATE a specific product
export async function PUT(request: Request, context: RouteContext) {
  try {
    const productIndex = products.findIndex((p) => p.id === context.params.id);

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates = await request.json();

    // Update the product
    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      id: context.params.id, // Ensure ID doesn't change
    };

    return NextResponse.json(products[productIndex]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE a specific product
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const productIndex = products.findIndex((p) => p.id === context.params.id);

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Remove the product
    const deletedProduct = products[productIndex];
    products = products.filter((p) => p.id !== context.params.id);

    return NextResponse.json({ success: true, deletedProduct });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
