"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    ShoppingCart,
    BarChart,
    Settings,
    Wallet,
    BadgeCheck,
    AlertCircle,
    Plus,
    Download,
    ArrowUpRight,
    Clock
} from "lucide-react"
import Link from "next/link"

export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('products')
    const [storeStatus, setStoreStatus] = useState('verified') // 'pending', 'verified', 'rejected'

    // Sample data
    const products = [
        { id: 1, name: "African Print Dashiki", price: 15000, stock: 12, status: "active", sales: 8 },
        { id: 2, name: "Handmade Beaded Necklace", price: 8500, stock: 5, status: "active", sales: 3 },
        { id: 3, name: "Tecno Camon 20 Pro", price: 185000, stock: 0, status: "out_of_stock", sales: 15 },
    ]

    const orders = [
        { id: "#ORD-1001", date: "2023-11-15", customer: "Adeola Johnson", amount: 15000, status: "shipped" },
        { id: "#ORD-1002", date: "2023-11-16", customer: "Chinedu Okoro", amount: 8500, status: "processing" },
        { id: "#ORD-1003", date: "2023-11-17", customer: "Funke Adebayo", amount: 185000, status: "pending" },
    ]

    const stats = {
        totalSales: 423500,
        totalOrders: 26,
        conversionRate: "3.2%",
        walletBalance: 1250 // in ADA
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-green-800">Seller Dashboard</h1>
                    <div className="flex items-center mt-2">
                        <p className="text-green-600">NaijaFashion Emporium</p>
                        {storeStatus === 'verified' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                            </span>
                        )}
                        {storeStatus === 'pending' && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> Under Review
                            </span>
                        )}
                        {storeStatus === 'rejected' && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Needs Attention
                            </span>
                        )}
                    </div>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/sell/new" className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" /> Add Product
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">₦{stats.totalSales.toLocaleString()}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <p className="text-xs text-green-600">+12% from last month</p>
                    </CardFooter>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <p className="text-xs text-green-600">+5 from last month</p>
                    </CardFooter>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.conversionRate}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <p className="text-xs text-green-600">2.8% last month</p>
                    </CardFooter>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Wallet Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.walletBalance} ₳</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="link" size="sm" className="text-green-600 h-auto p-0">
                            Withdraw Funds
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="products" className="w-full">
                <TabsList className="bg-green-50">
                    <TabsTrigger value="products" className="flex items-center">
                        <Package className="h-4 w-4 mr-2" /> Products
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2" /> Orders
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center">
                        <BarChart className="h-4 w-4 mr-2" /> Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-6">
                    <Card className="border-green-200">
                        <CardHeader className="border-b border-green-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg text-green-800">Your Products</CardTitle>
                                <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                                    <Download className="h-4 w-4 mr-2" /> Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Sales</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-green-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-100">
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-900">{product.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">₦{product.price.toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">{product.stock}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">{product.sales}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.status === "active" ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button variant="link" size="sm" className="text-green-600 h-auto p-0">
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-green-100 py-3">
                            <p className="text-sm text-green-600">Showing 3 of 12 products</p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-6">
                    <Card className="border-green-200">
                        <CardHeader className="border-b border-green-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg text-green-800">Recent Orders</CardTitle>
                                <div className="flex space-x-2">
                                    <select className="w-[120px] border border-green-300 rounded-md text-green-700 text-sm px-2 py-1">
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                    <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                                        <Download className="h-4 w-4 mr-2" /> Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-green-700 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-100">
                                        {orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-900">{order.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">{order.date}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">{order.customer}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-green-900">₦{order.amount.toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.status === "shipped" ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Shipped</span>
                                                    ) : order.status === "processing" ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Processing</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button variant="link" size="sm" className="text-green-600 h-auto p-0">
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-green-100 py-3">
                            <p className="text-sm text-green-600">Showing 3 of 26 orders</p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="border-green-200 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-green-800">Sales Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 bg-green-50 rounded-lg flex items-center justify-center">
                                    <p className="text-green-600">Sales chart will appear here</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-800">Top Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {products
                                        .sort((a, b) => b.sales - a.sales)
                                        .slice(0, 3)
                                        .map((product) => (
                                            <div key={product.id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-green-100 rounded-md"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900">{product.name}</p>
                                                        <p className="text-xs text-green-600">{product.sales} sold</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium">₦{product.price.toLocaleString()}</p>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" size="sm" className="text-green-600">
                                    View All Products
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-green-200 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-green-800">Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Amount (₦)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Amount (₳)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-green-700 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-green-100">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap">2023-11-15</td>
                                                <td className="px-6 py-4 whitespace-nowrap">Sale</td>
                                                <td className="px-6 py-4 whitespace-nowrap">₦15,000</td>
                                                <td className="px-6 py-4 whitespace-nowrap">45 ₳</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button variant="link" size="sm" className="text-green-600 h-auto p-0">
                                                        Details
                                                    </Button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap">2023-11-14</td>
                                                <td className="px-6 py-4 whitespace-nowrap">Withdrawal</td>
                                                <td className="px-6 py-4 whitespace-nowrap">₦50,000</td>
                                                <td className="px-6 py-4 whitespace-nowrap">150 ₳</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button variant="link" size="sm" className="text-green-600 h-auto p-0">
                                                        Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-6">
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle className="text-green-800">Store Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-green-700 mb-4">Store Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="storeName" className="block text-sm font-medium text-green-700">Store Name</label>
                                            <input
                                                id="storeName"
                                                type="text"
                                                defaultValue="NaijaFashion Emporium"
                                                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="storeCategory" className="block text-sm font-medium text-green-700">Category</label>
                                            <select
                                                id="storeCategory"
                                                defaultValue="fashion"
                                                className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                            >
                                                <option value="fashion">Fashion</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="home">Home Goods</option>
                                                <option value="beauty">Beauty</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-green-700 mb-4">Payment Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="bankAccount" className="block text-sm font-medium text-green-700">Bank Account</label>
                                            <input id="bankAccount" value="Zenith Bank - 0123456789" className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" readOnly />
                                        </div>
                                        <div>
                                            <label htmlFor="walletAddress" className="block text-sm font-medium text-green-700">Cardano Wallet Address</label>
                                            <input id="walletAddress" value="addr1q9...x8y7z" className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm font-mono" readOnly />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-green-700 mb-4">Verification Status</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <BadgeCheck className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <p className="font-medium text-green-800">Verified Seller</p>
                                                <p className="text-sm text-green-600">Your account has been fully verified</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-green-100 pt-4">
                            <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}