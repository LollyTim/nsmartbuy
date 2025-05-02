"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { validateCardanoAddress } from "@/lib/cardano/transaction-utils"
import { getADAPrices, convertADAToFiat, convertFiatToADA } from "@/lib/api/coingecko"
// Add these imports at the top if they're not already there
import {
  BrowserWallet,
  Transaction as MeshTransaction,
  Asset,
  ForgeScript,
  AppWallet,
  KoiosProvider,
  type ForgeScript as ForgeScriptType
} from "@meshsdk/core"
import { BlockfrostProvider } from "@meshsdk/core"
import { getWalletBalance } from "@/lib/blockfrost/ada"

// Define wallet types
interface BlockfrostBalance {
  lovelace: string;
  assets: Asset[];
}

interface Transaction extends MeshTransaction {
  build: () => Promise<string>;
  signTx: (tx: string) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
}

interface Mint {
  policyId: string;
  assetName: string;
  quantity: number;
}

interface AssetMetadata {
  name: string;
  image: string;
  mediaType: string;
  description?: string;
  policyId?: string;
  assetName?: string;
  fingerprint?: string;
  initialMintTxHash?: string;
  metadata?: Record<string, any>;
}


interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: number
  adaBalance: string
  assets: any[]
  connectWallet: (walletName?: string) => Promise<boolean>
  disconnectWallet: () => void
  sendTransaction: (to: string, amount: number) => Promise<boolean>
  mintNFT: (metadata: any, imageFile: File) => Promise<string | null>
  createAuction: (productId: string, startingPrice: number, duration: number) => Promise<string | null>
  placeBid: (auctionId: string, amount: number) => Promise<boolean>
  purchaseProduct: (productId: string, price: number, sellerAddress: string) => Promise<boolean>
  getTransactionHistory: () => Promise<any[]>
  buyADA: (ngnAmount: number) => Promise<string>
  sellADA: (adaAmount: number) => Promise<string>
  isLoading: boolean
  totalValueUSD: number
  totalValueNGN: number
  validateAddress: (address: string) => boolean
  walletName: string | null
  walletError: string | null
  adaToNgnRate: number
  adaToUsdRate: number
  refreshRates: () => Promise<void>
  isRefreshingBalance: boolean
  updateBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  // State variables
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [adaBalance, setAdaBalance] = useState("0")
  const [assets, setAssets] = useState<any[]>([])
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastConnectedWallet, setLastConnectedWallet] = useState<string | null>(null)
  const [totalValueUSD, setTotalValueUSD] = useState(0)
  const [totalValueNGN, setTotalValueNGN] = useState(0)
  const [meshSDKAvailable, setMeshSDKAvailable] = useState(false)
  const [meshWalletInstance, setMeshWalletInstance] = useState<any>(null)
  const [meshWallet, setMeshWallet] = useState<any>(null) // Initialize meshWallet state
  const [walletName, setWalletName] = useState<string | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [adaToUsdRate, setAdaToUsdRate] = useState(0.733771) // Updated default rate
  const [adaToNgnRate, setAdaToNgnRate] = useState(1181.94) // Updated default rate
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)

  // Fetch current ADA exchange rates
  const fetchExchangeRates = async () => {
    try {
      console.log("Fetching ADA exchange rates...")
      const prices = await getADAPrices(["usd", "ngn"])
      if (prices) {
        console.log("Exchange rates fetched successfully:", prices)
        setAdaToUsdRate(prices.usd || 0.733771)
        setAdaToNgnRate(prices.ngn || 1181.94)
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      // Use fallback values
      setAdaToUsdRate(0.733771)
      setAdaToNgnRate(1181.94)
    }
  }

  // Refresh rates function that can be called from outside
  const refreshRates = async () => {
    await fetchExchangeRates()
    // Update total values based on new rates
    if (balance > 0) {
      setTotalValueUSD(balance * adaToUsdRate)
      setTotalValueNGN(balance * adaToNgnRate)
    }
  }

  // Fetch exchange rates on component mount
  useEffect(() => {
    fetchExchangeRates()
    // Set up interval to refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Fix potential issues with wallet connection for Lace wallet
  useEffect(() => {
    const checkMeshSDK = async () => {
      try {
        setWalletError(null)
        if (typeof window !== "undefined") {
          // Try to dynamically import Mesh SDK
          const meshReactModule = await import("@meshsdk/react").catch(() => null)
          const meshCoreModule = await import("@meshsdk/core").catch(() => null)

          if (meshReactModule && meshCoreModule) {
            setMeshSDKAvailable(true)

            // Check if window.cardano exists (wallet extensions installed)
            if (window.cardano) {
              // Get available wallets
              const wallets = await meshCoreModule.BrowserWallet.getInstalledWallets()

              // Add special handling for Lace wallet which might use a different key
              const walletNames = wallets.map((wallet) => wallet.name)
              if (window.cardano.lace && !walletNames.includes("Lace")) {
                walletNames.push("Lace")
              }

              setAvailableWallets(walletNames)
            } else {
              setWalletError(
                "No Cardano wallet extensions detected. Please install a wallet like Nami, Eternl, Lace, or Flint.",
              )
            }
          } else {
            setWalletError("Cardano wallet integration is not available in this environment.")
            setMeshSDKAvailable(false)
          }
        }
      } catch (error) {
        console.warn("Mesh SDK not available:", error)
        setWalletError("Failed to initialize wallet integration. Please refresh the page.")
        setMeshSDKAvailable(false)
      }
    }

    checkMeshSDK()
  }, [])

  useEffect(() => {
    if (meshWallet && meshWallet.connected) {
      setMeshWalletInstance(meshWallet)
    }
  }, [meshWallet])

  // Get available wallets on load
  useEffect(() => {
    const getWallets = async () => {
      try {
        if (meshSDKAvailable && typeof window !== "undefined") {
          try {
            const meshCore = await import("@meshsdk/core")
            const wallets = await meshCore.BrowserWallet.getInstalledWallets()
            // Always include Demo Wallet for testing
            setAvailableWallets([...wallets.map((wallet) => wallet.name), "Demo Wallet"])
          } catch (error) {
            console.error("Error importing BrowserWallet:", error)
            setAvailableWallets(["Demo Wallet"])
          }
        } else {
          // Fallback for when Mesh SDK is not available
          setAvailableWallets(["Demo Wallet"])
        }
      } catch (error) {
        console.error("Error getting available wallets:", error)
        // Fallback
        setAvailableWallets(["Demo Wallet"])
      }
    }

    getWallets()
  }, [meshSDKAvailable])

  // Load saved wallet connection on startup
  useEffect(() => {
    const loadSavedWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet")
      const savedAddress = localStorage.getItem("walletAddress")

      if (savedWallet && meshSDKAvailable) {
        setLastConnectedWallet(savedWallet)

        // Try to reconnect to the saved wallet
        try {
          await connectWallet(savedWallet)
        } catch (error) {
          console.error("Failed to reconnect wallet:", error)
          // Clear saved wallet data if reconnection fails
          localStorage.removeItem("connectedWallet")
          localStorage.removeItem("walletAddress")
        }
      } else if (savedAddress) {
        // If we have a saved address but couldn't reconnect the wallet,
        // at least show the address in the UI
        setAddress(savedAddress)
      }
    }

    loadSavedWallet()
  }, [meshSDKAvailable])

  // Check wallet connection status and update balance
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if wallet is connected via Mesh SDK
        if (meshWalletInstance && meshWalletInstance.connected) {
          setIsConnected(true)

          // Get wallet address
          const addresses = await meshWalletInstance.getUsedAddresses()
          if (addresses.length > 0) {
            setAddress(addresses[0])

            // Save address to localStorage for persistence
            localStorage.setItem("walletAddress", addresses[0])

            try {
              // First try to get balance from Mesh SDK
              const walletBalance = await meshWalletInstance.getBalance()
              const meshLovelace = walletBalance.find((asset: Asset) => asset.unit === 'lovelace')?.quantity || "0"
              setAdaBalance(meshLovelace)

              // If we're on testnet and the balance is 0, try to get it from Blockfrost
              if (meshLovelace === "0") {
                try {
                  console.log("Trying to get balance from Blockfrost...")
                  const blockfrostBalance = await getWalletBalance(addresses[0]) as BlockfrostBalance
                  if (blockfrostBalance && blockfrostBalance.lovelace !== "0") {
                    console.log("Got balance from Blockfrost:", blockfrostBalance)

                    // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
                    const lovelaceValue = Number.parseInt(blockfrostBalance.lovelace)
                    const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000
                    console.log("Converted balance:", { lovelace: lovelaceValue, ada: adaValue })

                    // Update all balance-related state
                    setBalance(adaValue)
                    setAdaBalance(blockfrostBalance.lovelace)
                    setAssets(blockfrostBalance.assets || [])

                    // Calculate and update fiat values
                    const usdValue = adaValue * adaToUsdRate
                    const ngnValue = adaValue * adaToNgnRate
                    setTotalValueUSD(usdValue)
                    setTotalValueNGN(ngnValue)

                    console.log("Updated wallet state:", {
                      ada: adaValue,
                      lovelace: blockfrostBalance.lovelace,
                      usd: usdValue,
                      ngn: ngnValue
                    })
                  }
                } catch (blockfrostError) {
                  console.error("Error getting balance from Blockfrost:", blockfrostError)
                }
              } else {
                // Use the balance from Mesh SDK
                const lovelaceValue = Number.parseInt(meshLovelace)
                const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000
                setBalance(adaValue)
                setAssets(walletBalance.filter((asset: Asset) => asset.unit !== 'lovelace'))

                // Calculate fiat values
                setTotalValueUSD(adaValue * adaToUsdRate)
                setTotalValueNGN(adaValue * adaToNgnRate)
              }
            } catch (balanceError) {
              console.error("Error getting wallet balance:", balanceError)
              // Set default values but don't fail the connection
              setAdaBalance("0")
              setBalance(0)
              setAssets([])
              setTotalValueUSD(0)
              setTotalValueNGN(0)
            }
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    if (meshSDKAvailable && meshWalletInstance) {
      checkConnection()
    }
  }, [meshSDKAvailable, meshWalletInstance])

  // Update the connectWallet function to better handle wallet connection and state persistence
  const connectWallet = async (walletName?: string): Promise<boolean> => {
    if (walletName === "Demo Wallet") {
      return connectDemoWallet()
    }

    try {
      setIsLoading(true)
      setWalletError(null)

      if (!meshSDKAvailable) {
        setWalletError("Cardano wallet integration is not available in this environment.")
        return false
      }

      // If no wallet name provided, get available wallets and use the first one
      let walletToConnect = walletName
      if (!walletToConnect) {
        const availableWallets = await BrowserWallet.getAvailableWallets()
        if (availableWallets.length === 0) {
          setWalletError("No Cardano wallets found. Please install a wallet extension.")
          return false
        }
        walletToConnect = availableWallets[0].name
      }

      // Connect to the wallet using Mesh SDK
      let wallet
      let primaryAddress = ""

      try {
        // Connect to the wallet using Mesh SDK
        wallet = await BrowserWallet.enable(walletToConnect)
        setMeshWalletInstance(wallet)

        // Try to get wallet address using multiple methods for better reliability
        try {
          // First try to get used addresses
          const usedAddresses = await wallet.getUsedAddresses()
          if (usedAddresses && usedAddresses.length > 0) {
            primaryAddress = usedAddresses[0]
          } else {
            // If no used addresses, try to get unused addresses
            const unusedAddresses = await wallet.getUnusedAddresses()
            if (unusedAddresses && unusedAddresses.length > 0) {
              primaryAddress = unusedAddresses[0]
            } else {
              // If no unused addresses, try to get change address
              const changeAddress = await wallet.getChangeAddress()
              if (changeAddress) {
                primaryAddress = changeAddress
              }
            }
          }
        } catch (addressError) {
          console.error("Error getting wallet addresses:", addressError)
        }

        // If we still don't have an address, throw an error
        if (!primaryAddress) {
          throw new Error("Could not find any address in the wallet. Please make sure your wallet is properly set up.")
        }

        setAddress(primaryAddress)
      } catch (walletError) {
        console.error("Error getting wallet address:", walletError)
        throw new Error("Failed to get wallet address. Please make sure your wallet is properly set up and try again.")
      }

      // Get wallet balance with better error handling
      try {
        const walletBalance = await wallet.getBalance()
        const meshLovelace = walletBalance.find((asset: Asset) => asset.unit === 'lovelace')?.quantity || "0"
        setAdaBalance(meshLovelace)

        // If we're on testnet and the balance is 0, try to get it from Blockfrost
        if (meshLovelace === "0") {
          try {
            console.log("Trying to get balance from Blockfrost...")
            const blockfrostBalance = await getWalletBalance(primaryAddress) as BlockfrostBalance
            if (blockfrostBalance && blockfrostBalance.lovelace !== "0") {
              console.log("Got balance from Blockfrost:", blockfrostBalance)

              // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
              const lovelaceValue = Number.parseInt(blockfrostBalance.lovelace)
              const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000
              console.log("Converted balance:", { lovelace: lovelaceValue, ada: adaValue })

              // Update all balance-related state
              setBalance(adaValue)
              setAdaBalance(blockfrostBalance.lovelace)
              setAssets(blockfrostBalance.assets || [])

              // Calculate and update fiat values
              const usdValue = adaValue * adaToUsdRate
              const ngnValue = adaValue * adaToNgnRate
              setTotalValueUSD(usdValue)
              setTotalValueNGN(ngnValue)

              console.log("Updated wallet state:", {
                ada: adaValue,
                lovelace: blockfrostBalance.lovelace,
                usd: usdValue,
                ngn: ngnValue
              })
            }
          } catch (blockfrostError) {
            console.error("Error getting balance from Blockfrost:", blockfrostError)
          }
        } else {
          // Use the balance from Mesh SDK
          const lovelaceValue = Number.parseInt(meshLovelace)
          const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000
          setBalance(adaValue)
          setAssets(walletBalance.filter((asset: Asset) => asset.unit !== 'lovelace'))

          // Calculate fiat values
          setTotalValueUSD(adaValue * adaToUsdRate)
          setTotalValueNGN(adaValue * adaToNgnRate)
        }
      } catch (balanceError) {
        console.error("Error getting wallet balance:", balanceError)
        // Set default values but don't fail the connection
        setAdaBalance("0")
        setBalance(0)
        setAssets([])
        setTotalValueUSD(0)
        setTotalValueNGN(0)
      }

      setIsConnected(true)
      setWalletName(walletToConnect)

      // Save wallet connection to localStorage for persistence
      localStorage.setItem("connectedWallet", walletToConnect)
      localStorage.setItem("walletAddress", primaryAddress)
      setLastConnectedWallet(walletToConnect)

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletToConnect} wallet.`,
      })

      return true
    } catch (error) {
      console.error("Error connecting to wallet:", error)
      setWalletError(error instanceof Error ? error.message : "Failed to connect to wallet. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to check wallet connection status
  const checkWalletConnection = async () => {
    try {
      // Check if wallet is connected via Mesh SDK
      if (meshWalletInstance && meshWalletInstance.connected) {
        setIsConnected(true)

        // Get wallet address
        const addresses = await meshWalletInstance.getUsedAddresses()
        if (addresses.length > 0) {
          setAddress(addresses[0])
        }

        // Get wallet balance
        const walletBalance = await meshWalletInstance.getBalance()
        const meshLovelace = walletBalance.find((asset: Asset) => asset.unit === 'lovelace')?.quantity || "0"
        setAdaBalance(meshLovelace)

        // Ensure we have a valid number by using a fallback of 0 if parsing fails
        const lovelaceValue = Number.parseInt(meshLovelace)
        const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000
        setBalance(adaValue)
        setAssets(walletBalance.filter((asset: Asset) => asset.unit !== 'lovelace'))

        // Calculate USD value
        setTotalValueUSD(adaValue * adaToUsdRate)
        setTotalValueNGN(adaValue * adaToNgnRate)

        return true
      }
      return false
    } catch (error) {
      console.error("Error checking wallet connection:", error)
      return false
    }
  }

  // Add this after the connectWallet function

  // Demo wallet implementation for testing when no real wallet is available
  const connectDemoWallet = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setWalletError(null)

      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set demo wallet data
      const demoAddress =
        "addr1qxy8epmr7yrj28hyltk7tgx0x7n3dpjumc0m8mhm3vrcl6xn9yh6j7vmy7unhf5haksvjnn6h5trd2kv0zuaqjyh0jmqm36a4z"
      setAddress(demoAddress)

      // Random balance between 100-1000 ADA
      const demoBalance = Math.floor(Math.random() * 900) + 100
      setBalance(demoBalance)
      setAdaBalance((demoBalance * 1000000).toString()) // Convert to lovelace

      // Demo assets
      setAssets([
        { unit: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z4x", quantity: "1" },
        { unit: "asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4y", quantity: "2" },
      ])

      // Calculate fiat values
      setTotalValueUSD(demoBalance * adaToUsdRate)
      setTotalValueNGN(demoBalance * adaToNgnRate)

      setIsConnected(true)
      setWalletName("Demo Wallet")
      setLastConnectedWallet("Demo Wallet")

      toast({
        title: "Demo Wallet Connected",
        description: "Connected to demo wallet for testing purposes.",
      })

      return true
    } catch (error) {
      console.error("Failed to connect demo wallet:", error)
      setWalletError("Failed to connect demo wallet.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update the disconnectWallet function to clear localStorage
  const disconnectWallet = async () => {
    try {
      setIsLoading(true)

      if (meshWalletInstance) {
        // For Mesh SDK wallets
        try {
          await meshWalletInstance.disconnect()
        } catch (error) {
          console.warn("Error disconnecting wallet:", error)
        }
      }

      // Reset all wallet state
      setIsConnected(false)
      setAddress(null)
      setBalance(0)
      setAdaBalance("0")
      setAssets([])
      setLastConnectedWallet(null)
      setWalletName(null)
      setTotalValueUSD(0)
      setTotalValueNGN(0)
      setMeshWalletInstance(null)

      // Remove wallet connection from localStorage
      localStorage.removeItem("connectedWallet")
      localStorage.removeItem("walletAddress")

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      setWalletError("Failed to disconnect wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateBalance = async () => {
    if (!meshWalletInstance) return;

    setIsRefreshingBalance(true);
    try {
      const walletBalance = await meshWalletInstance.getBalance();
      const meshLovelace = walletBalance.find((asset: Asset) => asset.unit === 'lovelace')?.quantity || "0";
      setAdaBalance(meshLovelace);

      const lovelaceValue = Number.parseInt(meshLovelace);
      const adaValue = isNaN(lovelaceValue) ? 0 : lovelaceValue / 1000000;
      setBalance(adaValue);
      setAssets(walletBalance.filter((asset: Asset) => asset.unit !== 'lovelace'));

      // Update fiat values
      setTotalValueUSD(adaValue * adaToUsdRate);
      setTotalValueNGN(adaValue * adaToNgnRate);
    } catch (error) {
      console.error("Error updating balance:", error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  // Update transaction handling
  const sendTransaction = async (recipient: string, amount: number) => {
    if (!meshWalletInstance) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Validate recipient address
      if (!validateAddress(recipient)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Cardano address",
          variant: "destructive",
        });
        return false;
      }

      // Check if we have sufficient balance
      const walletBalance = await meshWalletInstance.getBalance();
      const lovelaceAsset = walletBalance.find((asset: Asset) => asset.unit === "lovelace");
      const currentBalance = lovelaceAsset ? Number(lovelaceAsset.quantity) : 0;

      if (currentBalance < amount * 1000000) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough ADA to send this amount",
          variant: "destructive",
        });
        return false;
      }

      // Create transaction using the correct pattern
      const tx = new MeshTransaction({ initiator: meshWalletInstance })
        .sendLovelace(
          recipient,
          (amount * 1000000).toString() // Convert ADA to lovelace
        )
        .setMetadata(0, {
          message: "Transaction from smartBuy",
          timestamp: Date.now(),
        });

      // Build and sign transaction
      const unsignedTx = await tx.build();
      const signedTx = await meshWalletInstance.signTx(unsignedTx);
      const txHash = await meshWalletInstance.submitTx(signedTx);

      console.log("Transaction submitted successfully:", {
        txHash,
        amount,
        recipient,
      });

      // Update balance after successful transaction
      await updateBalance();

      toast({
        title: "Success",
        description: `Successfully sent ${amount} ₳`,
      });

      return true;
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // NFT minting implementation
  const mintNFT = async (metadata: any, imageFile: File): Promise<string | null> => {
    try {
      setIsLoading(true);

      if (!isConnected || !meshWalletInstance) {
        throw new Error("Wallet not connected");
      }

      // 1. Upload image to IPFS
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);

      const imageUploadResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: imageFormData,
      });

      if (!imageUploadResponse.ok) {
        throw new Error("Failed to upload image to IPFS");
      }

      const imageData = await imageUploadResponse.json();
      const imageUrl = imageData.url;

      // 2. Create metadata with image URL
      const nftMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: imageUrl,
        mediaType: imageFile.type,
        ...metadata,
      };

      // 3. Upload metadata to IPFS
      const metadataResponse = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nftMetadata),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(`Failed to upload metadata to IPFS: ${errorData.error || "Unknown error"}`);
      }

      const metadataData = await metadataResponse.json();
      const metadataUrl = metadataData.url;

      // 4. Create a policy script directly without using resolvePaymentKeyHash
      const { Transaction, ForgeScript } = await import("@meshsdk/core");

      // Get wallet address
      const addresses = await meshWalletInstance.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        throw new Error("No wallet addresses found");
      }

      // Create a policy that expires in 24 hours
      const expirationTime = new Date();
      expirationTime.setDate(expirationTime.getDate() + 1); // Add 1 day

      // Create a simple policy script with an expiration time
      // This avoids using resolvePaymentKeyHash completely
      const policyId = "policy_" + Math.random().toString(36).substring(2, 15);

      // Instead of actually creating a real policy, let's simulate it for now
      // In production, you would use a real policy creation method
      const simulatedAssetId = `${policyId}.${Buffer.from(metadata.name).toString("hex")}`;

      // Log what we would do in a real implementation
      console.log("NFT metadata:", {
        name: metadata.name,
        description: metadata.description,
        image: imageUrl,
        policyId: policyId,
        assetId: simulatedAssetId
      });

      // In a production environment, at this point you would:
      // 1. Create a real transaction
      // 2. Sign it with your wallet
      // 3. Submit it to the blockchain

      // For development purposes, we'll simulate a successful minting
      // This allows frontend testing without blockchain interaction

      // Simulate a delay to mimic blockchain processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "NFT Minted Successfully (Simulated)",
        description: `Your NFT has been simulated with asset ID: ${simulatedAssetId.substring(0, 15)}...`,
      });

      return simulatedAssetId;
    } catch (error) {
      console.error("NFT minting failed:", error);
      toast({
        title: "NFT Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint the NFT. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createAuction = async (productId: string, startingPrice: number, duration: number): Promise<string | null> => {
    try {
      setIsLoading(true)

      if (!isConnected || !meshWalletInstance) {
        throw new Error("Wallet not connected")
      }

      // Import necessary modules
      const { Transaction } = await import("@meshsdk/core")

      // Create auction metadata
      const auctionData = {
        type: "auction_create",
        productId,
        startingPrice,
        duration,
        seller: address,
        endTime: Math.floor(Date.now() / 1000) + duration * 24 * 60 * 60, // Convert days to seconds
        timestamp: Date.now(),
      }

      // Create transaction
      const tx = new Transaction({ initiator: meshWalletInstance })

      // Add metadata
      tx.setMetadata(1, auctionData)

      // Sign and submit transaction
      const unsignedTx = await tx.build();
      const signedTx = await meshWalletInstance.signTx(unsignedTx);
      const txHash = await meshWalletInstance.submitTx(signedTx);

      // Generate auction ID
      const auctionId = `auction_${txHash.substring(0, 10)}_${productId}`

      toast({
        title: "Auction Created Successfully",
        description: `Your auction has been created with ID: ${auctionId}`,
      })

      return auctionId
    } catch (error) {
      console.error("Auction creation failed:", error)
      toast({
        title: "Auction Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create the auction. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (!isConnected || !meshWalletInstance) {
        throw new Error("Wallet not connected")
      }

      if (balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough ADA to place this bid.",
          variant: "destructive",
        })
        return false
      }

      // Import necessary modules
      const { Transaction } = await import("@meshsdk/core")

      // Create bid metadata
      const bidData = {
        type: "auction_bid",
        auctionId,
        bidAmount: amount,
        bidder: address,
        timestamp: Date.now(),
      }

      // Create transaction
      const tx = new Transaction({ initiator: meshWalletInstance })

      // Add metadata
      tx.setMetadata(2, bidData)

      // Sign and submit transaction
      const unsignedTx = await tx.build();
      const signedTx = await meshWalletInstance.signTx(unsignedTx);
      const txHash = await meshWalletInstance.submitTx(signedTx);

      toast({
        title: "Bid Placed Successfully",
        description: `Your bid of ${amount} ₳ has been placed on auction ${auctionId.substring(0, 10)}...`,
      })

      return true
    } catch (error) {
      console.error("Bid placement failed:", error)
      toast({
        title: "Bid Failed",
        description: error instanceof Error ? error.message : "Failed to place the bid. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseProduct = async (productId: string, price: number, sellerAddress: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (!isConnected || !meshWalletInstance) {
        throw new Error("Wallet not connected")
      }

      if (balance < price) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough ADA to purchase this product.",
          variant: "destructive",
        })
        return false
      }

      // Import necessary modules
      const { Transaction } = await import("@meshsdk/core")

      // Create purchase metadata
      const purchaseData = {
        type: "product_purchase",
        productId,
        price,
        buyer: address,
        seller: sellerAddress,
        timestamp: Date.now(),
      }

      // Create transaction
      const tx = new Transaction({ initiator: meshWalletInstance })

      // Send payment to seller
      tx.sendLovelace(sellerAddress, (price * 1000000).toString())

      // Add metadata
      tx.setMetadata(3, purchaseData)

      // Sign and submit transaction
      const unsignedTx = await tx.build();
      const signedTx = await meshWalletInstance.signTx(unsignedTx);
      const txHash = await meshWalletInstance.submitTx(signedTx);

      // Update balance after transaction
      const walletBalance = await meshWalletInstance.getBalance()
      const meshLovelace = walletBalance.find((asset: Asset) => asset.unit === 'lovelace')?.quantity || "0"
      setAdaBalance(meshLovelace)
      const adaValue = Number.parseInt(meshLovelace) / 1000000
      setBalance(adaValue)
      setAssets(walletBalance.filter((asset: Asset) => asset.unit !== 'lovelace'))

      // Update fiat values
      setTotalValueUSD(adaValue * adaToUsdRate)
      setTotalValueNGN(adaValue * adaToNgnRate)

      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased the product for ${price} ₳.`,
      })

      return true
    } catch (error) {
      console.error("Purchase failed:", error)
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to complete the purchase. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getTransactionHistory = async (): Promise<any[]> => {
    try {
      if (!isConnected || !meshWalletInstance || !address) {
        return []
      }

      // In a real implementation, you would fetch transaction history from a Cardano blockchain explorer API
      // For example, using Blockfrost API

      // For now, we'll return mock data
      return [
        {
          txHash: "tx1abc123def456",
          type: "send",
          amount: 50,
          recipient: "addr1qxy8epmr...",
          timestamp: Date.now() - 86400000, // 1 day ago
          status: "completed",
        },
        {
          txHash: "tx2def456abc123",
          type: "receive",
          amount: 100,
          sender: "addr1qz9tzfh3...",
          timestamp: Date.now() - 172800000, // 2 days ago
          status: "completed",
        },
        {
          txHash: "tx3ghi789jkl012",
          type: "nft_mint",
          assetId: "asset1abcdef...",
          timestamp: Date.now() - 259200000, // 3 days ago
          status: "completed",
        },
      ]
    } catch (error) {
      console.error("Error fetching transaction history:", error)
      return []
    }
  }

  const buyADA = async (ngnAmount: number): Promise<string> => {
    try {
      setIsLoading(true)

      if (!address) {
        throw new Error("Wallet not connected")
      }

      // Calculate ADA amount based on current exchange rate
      const adaAmount = await convertFiatToADA(ngnAmount, "ngn")

      // Create payment request with Paystack
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: ngnAmount,
          email: "user@example.com", // In a real app, you would get this from the user
          metadata: {
            adaAmount,
            walletAddress: address,
            type: "buy_ada",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment")
      }

      const data = await response.json()

      // Return the payment URL
      return data.authorization_url
    } catch (error) {
      console.error("Buy ADA failed:", error)
      toast({
        title: "Buy ADA Failed",
        description: error instanceof Error ? error.message : "Failed to process your purchase. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sellADA = async (adaAmount: number): Promise<string> => {
    try {
      setIsLoading(true)

      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }

      if (balance < adaAmount) {
        throw new Error("Insufficient balance")
      }

      // Calculate NGN amount based on current exchange rate
      const ngnAmount = await convertADAToFiat(adaAmount, "ngn")

      // Create sell request
      const response = await fetch("/api/ada/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adaAmount,
          ngnAmount,
          walletAddress: address,
          bankDetails: {
            accountNumber: "0123456789", // In a real app, you would get this from the user
            accountName: "John Doe", // In a real app, you would get this from the user
            bankCode: "057", // In a real app, you would get this from the user
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process sell request")
      }

      const data = await response.json()

      toast({
        title: "Sell Request Submitted",
        description: `Your request to sell ${adaAmount} ADA has been submitted. You will receive ${ngnAmount.toFixed(2)} NGN within 24 hours.`,
      })

      return data.reference
    } catch (error) {
      console.error("Sell ADA failed:", error)
      toast({
        title: "Sell ADA Failed",
        description: error instanceof Error ? error.message : "Failed to process your sell request. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Validate a Cardano address
  const validateAddress = (address: string): boolean => {
    return validateCardanoAddress(address)
  }

  const value = {
    isConnected,
    address,
    balance,
    adaBalance,
    assets,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    mintNFT,
    createAuction,
    placeBid,
    purchaseProduct,
    getTransactionHistory,
    buyADA,
    sellADA,
    isLoading,
    totalValueUSD,
    totalValueNGN,
    validateAddress,
    walletName,
    walletError,
    adaToNgnRate,
    adaToUsdRate,
    refreshRates,
    isRefreshingBalance,
    updateBalance,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// Remove the global declaration and add this at the top of the file
declare module '@meshsdk/core' {
  interface Cardano {
    [key: string]: {
      enable: () => Promise<any>
      isEnabled: () => Promise<boolean>
      apiVersion: string
      name: string
      icon: string
    }
  }
}

