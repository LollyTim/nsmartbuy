"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">smartBuy Documentation</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A comprehensive guide to building and deploying smartBuy for your blockchain e-commerce platform
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="wallet">Wallet Integration</TabsTrigger>
            <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
            <TabsTrigger value="nft">NFT Implementation</TabsTrigger>
            <TabsTrigger value="buy-sell">Buy & Sell ADA</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys Setup</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Understanding the core concepts and features of smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">What is smartBuy?</h3>
                  <p>
                    smartBuy is a blockchain-based e-commerce marketplace built on the Cardano blockchain. It enables
                    transparent, secure transactions with NFT-backed product authenticity verification, auction
                    capabilities, and an integrated wallet system.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Core Features</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">NFT Tokenization:</span> Products are minted as NFTs on the Cardano
                      blockchain, providing immutable proof of authenticity and ownership history.
                    </li>
                    <li>
                      <span className="font-medium">Transparent Verification:</span> All transactions are recorded
                      on-chain, allowing buyers to verify product history and authenticity.
                    </li>
                    <li>
                      <span className="font-medium">Auction System:</span> Smart contract-powered auctions for rare and
                      collectible items.
                    </li>
                    <li>
                      <span className="font-medium">Integrated Wallet:</span> Built-in Cardano wallet with Naira
                      conversion capabilities.
                    </li>
                    <li>
                      <span className="font-medium">Buy & Sell ADA:</span> Direct purchase and sale of ADA with Nigerian
                      Naira (NGN) through Paystack integration.
                    </li>
                    <li>
                      <span className="font-medium">Verified Reviews:</span> Only verified buyers can leave product
                      reviews, reducing fraud.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Technology Stack</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Frontend:</span> Next.js 14 with App Router, React 18, Tailwind CSS,
                      shadcn/ui
                    </li>
                    <li>
                      <span className="font-medium">Blockchain Integration:</span> Mesh.js SDK for Cardano integration
                    </li>
                    <li>
                      <span className="font-medium">Smart Contracts:</span> Cardano smart contracts for escrow,
                      auctions, and NFT minting
                    </li>
                    <li>
                      <span className="font-medium">Storage:</span> IPFS for decentralized storage of product images and
                      metadata
                    </li>
                    <li>
                      <span className="font-medium">Wallet:</span> CIP-30 compliant wallet integration (Nami, Eternl,
                      Flint, Lace, etc.)
                    </li>
                    <li>
                      <span className="font-medium">Payment Processing:</span> Paystack for fiat currency transactions
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>Understanding the technical architecture of smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Architecture Overview</h3>
                  <p>
                    smartBuy follows a modern web architecture pattern with blockchain integration. The system is
                    designed to be scalable, secure, and provide a seamless user experience while leveraging the
                    benefits of blockchain technology.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Key Components</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Frontend Application:</span> Next.js-based web application that
                      provides the user interface for buyers and sellers.
                    </li>
                    <li>
                      <span className="font-medium">Blockchain Layer:</span> Integration with the Cardano blockchain for
                      NFT minting, transaction verification, and smart contracts.
                    </li>
                    <li>
                      <span className="font-medium">Wallet Integration:</span> CIP-30 compliant wallet connectors for
                      interacting with the Cardano blockchain.
                    </li>
                    <li>
                      <span className="font-medium">Payment Gateway:</span> Integration with Paystack for fiat currency
                      transactions.
                    </li>
                    <li>
                      <span className="font-medium">IPFS Storage:</span> Decentralized storage for product images and
                      metadata.
                    </li>
                    <li>
                      <span className="font-medium">API Layer:</span> Backend APIs for handling business logic and data
                      processing.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Data Flow</h3>
                  <p>The data flow in smartBuy follows these general steps:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>User connects their Cardano wallet to the application</li>
                    <li>Product data and images are uploaded to IPFS</li>
                    <li>NFTs are minted on the Cardano blockchain to represent products</li>
                    <li>Smart contracts handle auctions and escrow for secure transactions</li>
                    <li>Payments are processed through Paystack (for fiat) or directly on-chain (for ADA)</li>
                    <li>Transaction records are stored on the blockchain for transparency and verification</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Integration</CardTitle>
                <CardDescription>Connecting and using Cardano wallets with smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Supported Wallets</h3>
                  <p>smartBuy supports all major Cardano wallets that implement the CIP-30 standard, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Nami</span> - Lightweight browser extension wallet
                    </li>
                    <li>
                      <span className="font-medium">Eternl</span> - Feature-rich browser extension wallet
                    </li>
                    <li>
                      <span className="font-medium">Flint</span> - User-friendly browser extension wallet
                    </li>
                    <li>
                      <span className="font-medium">Lace</span> - Modern wallet developed by IOG
                    </li>
                    <li>
                      <span className="font-medium">Yoroi</span> - Light wallet for Cardano
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Wallet Connection Flow</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>User clicks "Connect Wallet" button in the application</li>
                    <li>A modal displays available wallet options</li>
                    <li>User selects their preferred wallet</li>
                    <li>The selected wallet extension opens a confirmation dialog</li>
                    <li>User approves the connection request</li>
                    <li>Application receives the wallet address and can now interact with the blockchain</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Wallet Functionality</h3>
                  <p>Once connected, the wallet enables the following functionality:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Viewing wallet balance (ADA and other assets)</li>
                    <li>Sending and receiving ADA</li>
                    <li>Minting NFTs for products</li>
                    <li>Participating in auctions</li>
                    <li>Purchasing products with ADA</li>
                    <li>Signing transactions for blockchain operations</li>
                  </ul>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Note</AlertTitle>
                  <AlertDescription>
                    smartBuy never has access to your private keys or recovery phrase. All sensitive operations are
                    handled by your wallet extension, which only shares the necessary information with the application
                    after your explicit approval.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart-contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Contracts</CardTitle>
                <CardDescription>Understanding the blockchain logic powering smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Smart Contract Overview</h3>
                  <p>
                    smartBuy uses Cardano smart contracts written in Plutus to handle various aspects of the
                    marketplace. These contracts ensure secure, transparent, and trustless transactions between buyers
                    and sellers.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Marketplace Contract</h3>
                  <p>The main marketplace contract handles fixed-price sales with the following features:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Product Listing:</span> Sellers can list products with a fixed price
                    </li>
                    <li>
                      <span className="font-medium">Purchase Logic:</span> Buyers can purchase products by sending the
                      exact amount
                    </li>
                    <li>
                      <span className="font-medium">Escrow Mechanism:</span> Funds are held in escrow until the buyer
                      confirms receipt
                    </li>
                    <li>
                      <span className="font-medium">Dispute Resolution:</span> Logic for handling disputes between
                      buyers and sellers
                    </li>
                    <li>
                      <span className="font-medium">Cancellation:</span> Sellers can cancel listings if no purchase has
                      been made
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Auction Contract</h3>
                  <p>The auction contract enables dynamic pricing through bidding:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Auction Creation:</span> Sellers can create auctions with starting
                      price and duration
                    </li>
                    <li>
                      <span className="font-medium">Bidding Logic:</span> Buyers can place bids that must exceed the
                      current highest bid
                    </li>
                    <li>
                      <span className="font-medium">Time-Based Closing:</span> Auctions automatically close after the
                      specified duration
                    </li>
                    <li>
                      <span className="font-medium">Winner Determination:</span> The highest bidder at closing time wins
                      the auction
                    </li>
                    <li>
                      <span className="font-medium">Automatic Settlement:</span> Funds are transferred to the seller and
                      the NFT to the winner
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">NFT Minting Policy</h3>
                  <p>The NFT minting policy controls the creation of product NFTs:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Uniqueness:</span> Ensures each product has a unique token ID
                    </li>
                    <li>
                      <span className="font-medium">Metadata:</span> Includes product details, images, and verification
                      information
                    </li>
                    <li>
                      <span className="font-medium">Ownership Control:</span> Only the product owner can transfer or
                      sell the NFT
                    </li>
                    <li>
                      <span className="font-medium">Immutability:</span> Once minted, the core product data cannot be
                      changed
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nft" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NFT Implementation</CardTitle>
                <CardDescription>How product tokenization works in smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">NFT Tokenization Process</h3>
                  <p>
                    In smartBuy, each product is tokenized as a Non-Fungible Token (NFT) on the Cardano blockchain.
                    This process provides verifiable authenticity and ownership history for products.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Image Upload:</span> Product images are uploaded to IPFS for
                      decentralized storage
                    </li>
                    <li>
                      <span className="font-medium">Metadata Creation:</span> Product details are formatted according to
                      the CIP-25 metadata standard
                    </li>
                    <li>
                      <span className="font-medium">Metadata Storage:</span> The metadata is uploaded to IPFS and linked
                      to the NFT
                    </li>
                    <li>
                      <span className="font-medium">Policy Creation:</span> A minting policy is created to control the
                      NFT's properties
                    </li>
                    <li>
                      <span className="font-medium">Token Minting:</span> The NFT is minted on the Cardano blockchain
                    </li>
                    <li>
                      <span className="font-medium">Marketplace Listing:</span> The NFT is listed for sale or auction in
                      the marketplace
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">NFT Metadata Structure</h3>
                  <p>The NFT metadata follows the CIP-25 standard and includes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Basic Information:</span> Name, description, and category
                    </li>
                    <li>
                      <span className="font-medium">Images:</span> IPFS links to product images
                    </li>
                    <li>
                      <span className="font-medium">Attributes:</span> Specific product characteristics and features
                    </li>
                    <li>
                      <span className="font-medium">Verification Data:</span> Information about the product's
                      authenticity
                    </li>
                    <li>
                      <span className="font-medium">Seller Information:</span> Details about the seller (anonymized for
                      privacy)
                    </li>
                    <li>
                      <span className="font-medium">Creation Timestamp:</span> When the product was tokenized
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Verification Process</h3>
                  <p>Buyers can verify product authenticity through:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Blockchain Explorer:</span> Viewing the NFT on Cardanoscan or other
                      explorers
                    </li>
                    <li>
                      <span className="font-medium">Ownership History:</span> Checking the complete chain of ownership
                    </li>
                    <li>
                      <span className="font-medium">Metadata Verification:</span> Confirming product details match the
                      NFT metadata
                    </li>
                    <li>
                      <span className="font-medium">In-App Verification:</span> Using smartBuy's built-in verification
                      tools
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Benefits of NFT Tokenization</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Provable Authenticity:</span> Verifiable proof that products are
                      genuine
                    </li>
                    <li>
                      <span className="font-medium">Ownership History:</span> Complete record of previous owners
                    </li>
                    <li>
                      <span className="font-medium">Resale Capability:</span> Easy transfer of ownership with maintained
                      history
                    </li>
                    <li>
                      <span className="font-medium">Fraud Prevention:</span> Difficult to counterfeit or falsify product
                      information
                    </li>
                    <li>
                      <span className="font-medium">Value Retention:</span> Products with verified authenticity maintain
                      higher value
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buy-sell" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buy & Sell ADA</CardTitle>
                <CardDescription>Converting between ADA and Nigerian Naira (NGN)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">ADA Purchase Process</h3>
                  <p>smartBuy allows users to buy ADA using Nigerian Naira (NGN) through Paystack integration:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Enter Amount:</span> User specifies how much NGN they want to spend
                    </li>
                    <li>
                      <span className="font-medium">View Conversion:</span> System calculates the equivalent ADA amount
                      based on current rates
                    </li>
                    <li>
                      <span className="font-medium">Initiate Payment:</span> User is redirected to Paystack payment page
                    </li>
                    <li>
                      <span className="font-medium">Complete Payment:</span> User completes the NGN payment through
                      Paystack
                    </li>
                    <li>
                      <span className="font-medium">Receive ADA:</span> Upon successful payment, ADA is transferred to
                      the user's wallet
                    </li>
                    <li>
                      <span className="font-medium">Transaction Record:</span> The purchase is recorded in the user's
                      transaction history
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">ADA Selling Process</h3>
                  <p>Users can also sell ADA to receive NGN:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Enter Amount:</span> User specifies how much ADA they want to sell
                    </li>
                    <li>
                      <span className="font-medium">View Conversion:</span> System calculates the equivalent NGN amount
                      based on current rates
                    </li>
                    <li>
                      <span className="font-medium">Provide Bank Details:</span> User enters their Nigerian bank account
                      information
                    </li>
                    <li>
                      <span className="font-medium">Confirm Sale:</span> User confirms the transaction details
                    </li>
                    <li>
                      <span className="font-medium">Transfer ADA:</span> ADA is transferred from the user's wallet to
                      the platform wallet
                    </li>
                    <li>
                      <span className="font-medium">Receive NGN:</span> NGN is transferred to the user's bank account
                      within 24 hours
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Exchange Rate Determination</h3>
                  <p>Exchange rates between ADA and NGN are determined by:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Market Rates:</span> Current market prices from cryptocurrency
                      exchanges
                    </li>
                    <li>
                      <span className="font-medium">Rate Updates:</span> Rates are updated every 5 minutes to ensure
                      accuracy
                    </li>
                    <li>
                      <span className="font-medium">Processing Fee:</span> A small fee (1.5%) is applied to cover
                      transaction costs
                    </li>
                    <li>
                      <span className="font-medium">Slippage Protection:</span> Rate locks for 2 minutes during
                      transaction processing
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Security Measures</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Secure Payments:</span> All fiat transactions are processed through
                      Paystack's secure gateway
                    </li>
                    <li>
                      <span className="font-medium">Transaction Verification:</span> Multiple verification steps to
                      prevent fraud
                    </li>
                    <li>
                      <span className="font-medium">Blockchain Confirmation:</span> ADA transfers are confirmed on the
                      Cardano blockchain
                    </li>
                    <li>
                      <span className="font-medium">Audit Trail:</span> Complete record of all transactions for
                      accountability
                    </li>
                  </ul>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    <p>
                      When selling ADA, please ensure you provide accurate bank details. Incorrect information may
                      result in delayed or failed payments.
                    </p>
                    <p className="mt-2">
                      For large transactions (over 5,000 ADA), additional verification may be required for security
                      purposes.
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys and Environment Variables Setup</CardTitle>
                <CardDescription>Detailed guide on obtaining and configuring all required API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Required API Keys and Environment Variables</h3>
                  <p>
                    smartBuy requires several API keys and environment variables to function properly. This guide will
                    walk you through obtaining each one.
                  </p>

                  <div className="bg-muted p-4 rounded-md my-4 overflow-auto">
                    <pre className="text-sm">
                      {`# Blockfrost Configuration
BLOCKFROST_API_KEY=your_blockfrost_project_id
BLOCKFROST_URL=https://cardano-testnet.blockfrost.io/api/v0
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_project_id
NEXT_PUBLIC_BLOCKFROST_URL=https://cardano-testnet.blockfrost.io/api/v0

# Platform Wallet Configuration
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
PLATFORM_WALLET_SIGNING_KEY=your_platform_wallet_signing_key

# Paystack Payment Processing
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Application Configuration
NEXT_PUBLIC_APP_URL=your_app_url`}
                    </pre>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Never commit your API keys or environment variables to version control. Use environment files
                      (.env.local) or your hosting platform's environment variable configuration.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">1. Blockfrost API Keys</h3>
                  <p>
                    Blockfrost provides APIs for interacting with the Cardano blockchain and IPFS. The Blockfrost
                    "Project ID" is what you'll use as your API key.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Steps to obtain Blockfrost API keys:</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        Go to{" "}
                        <a
                          href="https://blockfrost.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          https://blockfrost.io/
                        </a>{" "}
                        and create an account
                      </li>
                      <li>After logging in, click on "Create project"</li>
                      <li>
                        Select "Cardano" as the network and choose either:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            <strong>Testnet (Preview)</strong> - For development and testing
                          </li>
                          <li>
                            <strong>Mainnet</strong> - For production use
                          </li>
                        </ul>
                      </li>
                      <li>Give your project a name and click "Create"</li>
                      <li>
                        You'll be redirected to your project dashboard where you can find your{" "}
                        <strong>Project ID</strong>
                      </li>
                      <li>
                        Copy this Project ID and use it for both <code>BLOCKFROST_API_KEY</code> and{" "}
                        <code>NEXT_PUBLIC_BLOCKFROST_API_KEY</code>
                      </li>
                      <li>
                        Set <code>BLOCKFROST_URL</code> and <code>NEXT_PUBLIC_BLOCKFROST_URL</code> based on your
                        selected network:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Testnet: <code>https://cardano-testnet.blockfrost.io/api/v0</code>
                          </li>
                          <li>
                            Mainnet: <code>https://cardano-mainnet.blockfrost.io/api/v0</code>
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">2. Paystack API Keys</h3>
                  <p>
                    Paystack is used for processing fiat currency (NGN) payments. You'll need both the secret key and
                    public key.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Steps to obtain Paystack API keys:</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        Go to{" "}
                        <a
                          href="https://dashboard.paystack.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          https://dashboard.paystack.com/
                        </a>{" "}
                        and create an account
                      </li>
                      <li>After logging in, navigate to "Settings" → "API Keys & Webhooks"</li>
                      <li>
                        You'll find both your <strong>Test Secret Key</strong> and <strong>Test Public Key</strong>
                      </li>
                      <li>
                        For development, use the test keys:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Use the <strong>Test Secret Key</strong> for <code>PAYSTACK_SECRET_KEY</code>
                          </li>
                          <li>
                            Use the <strong>Test Public Key</strong> for <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code>
                          </li>
                        </ul>
                      </li>
                      <li>
                        For production, you'll need to:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Complete Paystack's verification process</li>
                          <li>
                            Switch to the <strong>Live Secret Key</strong> and <strong>Live Public Key</strong>
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Test Mode vs. Live Mode</AlertTitle>
                    <AlertDescription>
                      <p>Paystack provides two sets of API keys:</p>
                      <ul className="list-disc pl-6 mt-2">
                        <li>
                          <strong>Test Keys</strong>: Use these during development. They allow you to simulate payments
                          without actual during development. They allow you to simulate payments without actual money
                          movement.
                        </li>
                        <li>
                          <strong>Live Keys</strong>: Use these in production. These process real payments and move
                          actual money.
                        </li>
                      </ul>
                      <p className="mt-2">Always ensure you're using the appropriate keys for your environment.</p>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">3. Platform Wallet Configuration</h3>
                  <p>
                    The platform wallet is used for processing ADA transactions on behalf of the platform, such as
                    transferring ADA to users who purchase it with NGN.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Setting up the Platform Wallet:</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        <strong>Create a Cardano Wallet</strong>:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Install a Cardano wallet like Eternl, Nami, or Flint (not Lace for platform wallet)</li>
                          <li>Create a new wallet and securely store the recovery phrase</li>
                          <li>This wallet will be your platform's operational wallet</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Get the Wallet Address</strong>:
                        <ul className="list-disc pl-6 mt-1">
                          <li>In your wallet interface, find your wallet address (starts with "addr1")</li>
                          <li>
                            Copy this address and use it for <code>NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS</code>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>Export the Signing Key</strong> (varies by wallet):
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            <strong>Eternl</strong>: Go to Settings → Advanced → Export private key
                          </li>
                          <li>
                            <strong>Nami</strong>: Go to Settings → Export private key
                          </li>
                          <li>
                            Use the exported signing key for <code>PLATFORM_WALLET_SIGNING_KEY</code>
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      <p>
                        The platform wallet signing key gives complete control over the wallet funds. Treat it with
                        extreme caution:
                      </p>
                      <ul className="list-disc pl-6 mt-2">
                        <li>Never share it with anyone</li>
                        <li>Never commit it to version control</li>
                        <li>Store it securely using environment variables or a secrets manager</li>
                        <li>Consider using a hardware wallet for production deployments</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">4. Lace Wallet Integration</h3>
                  <p>
                    Lace is a modern Cardano wallet developed by IOG (Input Output Global). Here's how to set it up for
                    smartBuy:
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-medium">Setting up Lace Wallet:</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        <strong>Install Lace Wallet</strong>:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Go to{" "}
                            <a
                              href="https://www.lace.io/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              https://www.lace.io/
                            </a>
                          </li>
                          <li>Download and install the Lace browser extension</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Create or Restore a Wallet</strong>:
                        <ul className="list-disc pl-6 mt-1">
                          <li>Follow the prompts to either create a new wallet or restore an existing one</li>
                          <li>Securely store your recovery phrase</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Connect to smartBuy</strong>:
                        <ul className="list-disc pl-6 mt-1">
                          <li>When using smartBuy, click "Connect Wallet"</li>
                          <li>Select "Lace" from the wallet options</li>
                          <li>Approve the connection request in the Lace wallet popup</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note About Lace Wallet</AlertTitle>
                    <AlertDescription>
                      <p>
                        Unlike some other Cardano wallets, Lace does not provide a direct way to export the private
                        signing key through its UI. This is a security feature by design.
                      </p>

                      <p className="mt-2">
                        <strong>For Platform Wallet Setup:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Do NOT use Lace as your platform wallet since you cannot export the signing key</li>
                        <li>
                          Instead, use Eternl or Nami wallet for your platform wallet where you can export the signing
                          key
                        </li>
                        <li>
                          Lace is excellent for end-users connecting to the platform, but not suitable for the platform
                          wallet itself
                        </li>
                      </ul>

                      <p className="mt-2">
                        <strong>Alternative for Advanced Users:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-1">
                        <li>
                          If you must use Lace for your platform wallet, you'll need to use the Cardano CLI to derive
                          the signing key from your recovery phrase
                        </li>
                        <li>
                          This is an advanced process requiring command-line knowledge and is not recommended for most
                          users
                        </li>
                        <li>
                          Consult the{" "}
                          <a
                            href="https://developers.cardano.org/docs/get-started/cardano-serialization-lib/generating-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Cardano developer documentation
                          </a>{" "}
                          for details
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">5. Application URL</h3>
                  <p>
                    Set <code>NEXT_PUBLIC_APP_URL</code> to your application's base URL:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      For local development: <code>http://localhost:3000</code>
                    </li>
                    <li>
                      For production: Your deployed URL (e.g., <code>https://your-app.vercel.app</code>)
                    </li>
                  </ul>
                  <p>This URL is used for callback URLs and webhook configurations.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup Guide</CardTitle>
                <CardDescription>Step-by-step instructions for setting up smartBuy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Prerequisites</h3>
                  <p>Before setting up smartBuy, ensure you have the following:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Node.js 18.x or later installed</li>
                    <li>Git installed</li>
                    <li>A Cardano wallet (Eternl, Nami, Flint, or Lace)</li>
                    <li>API keys for Blockfrost and Paystack (see API Keys Setup tab)</li>
                    <li>Basic knowledge of React, Next.js, and Cardano</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Installation Steps</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <strong>Clone the Repository</strong>
                      <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto">
                        git clone https://github.com/yourusername/smartBuy.git cd smartBuy
                      </pre>
                    </li>
                    <li>
                      <strong>Install Dependencies</strong>
                      <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto">npm install</pre>
                    </li>
                    <li>
                      <strong>Set Up Environment Variables</strong>
                      <p className="mt-1">
                        Create a .env.local file in the root directory with the following variables:
                      </p>
                      <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto">
                        {`# Blockfrost Configuration
BLOCKFROST_API_KEY=your_blockfrost_project_id
BLOCKFROST_URL=https://cardano-testnet.blockfrost.io/api/v0
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_project_id
NEXT_PUBLIC_BLOCKFROST_URL=https://cardano-testnet.blockfrost.io/api/v0

# Platform Wallet Configuration
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
PLATFORM_WALLET_SIGNING_KEY=your_platform_wallet_signing_key

# Paystack Payment Processing
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
                      </pre>
                    </li>
                    <li>
                      <strong>Run the Development Server</strong>
                      <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto">npm run dev</pre>
                      <p className="mt-1">This will start the development server at http://localhost:3000</p>
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Configuration Options</h3>
                  <p>smartBuy can be configured through various files:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>next.config.mjs</strong> - Next.js configuration
                    </li>
                    <li>
                      <strong>tailwind.config.ts</strong> - Tailwind CSS theme configuration
                    </li>
                    <li>
                      <strong>lib/cardano/transaction-builder.ts</strong> - Cardano transaction settings
                    </li>
                    <li>
                      <strong>lib/blockfrost/ada.ts</strong> - ADA transfer configuration
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Deployment</h3>
                  <p>To deploy smartBuy to production:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <strong>Build the Application</strong>
                      <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto">npm run build</pre>
                    </li>
                    <li>
                      <strong>Deploy to Vercel</strong> (recommended)
                      <ul className="list-disc pl-6 mt-1">
                        <li>Push your code to a GitHub repository</li>
                        <li>Import the repository in Vercel</li>
                        <li>Configure environment variables in Vercel dashboard</li>
                        <li>Deploy the application</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Alternative Deployment Options</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Netlify: Similar process to Vercel</li>
                        <li>Self-hosted: Use npm run start after building</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Production Considerations</AlertTitle>
                  <AlertDescription>
                    <p>When deploying to production, remember to:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Use mainnet Blockfrost URLs and API keys</li>
                      <li>Switch to Paystack live keys</li>
                      <li>Set up proper security measures for your platform wallet</li>
                      <li>Configure proper CORS settings if using a separate backend</li>
                      <li>Set up monitoring and error tracking</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

