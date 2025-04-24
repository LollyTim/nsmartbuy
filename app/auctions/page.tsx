import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Clock, ExternalLink, Filter, Search } from "lucide-react"

export default function AuctionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Auctions</h1>
          <p className="text-muted-foreground">Bid on unique items with blockchain verification</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search auctions..." className="w-full md:w-[300px] pl-8" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="live">Live Auctions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AuctionCard key={i} id={i + 1} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <AuctionCard key={i} id={i + 10} isUpcoming />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ended" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <AuctionCard key={i} id={i + 20} isEnded />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AuctionCard({
  id,
  isUpcoming = false,
  isEnded = false,
}: { id: number; isUpcoming?: boolean; isEnded?: boolean }) {
  const categories = ["Collectibles", "Art", "Electronics", "Fashion"]
  const category = categories[id % categories.length]
  const currentBid = 100 + ((id * 50) % 1000)
  const tokenId = `asset1q9v8p8xz6z4xz6z4xz6z4xz6z4xz6z4xz6z${id}`

  // Calculate random time remaining
  const hours = Math.floor(Math.random() * 24)
  const minutes = Math.floor(Math.random() * 60)
  const seconds = Math.floor(Math.random() * 60)
  const timeRemaining = `${hours}h ${minutes}m ${seconds}s`

  // Calculate random start time for upcoming auctions
  const days = Math.floor(Math.random() * 7) + 1
  const startTime = `Starts in ${days} days`

  // Calculate random end time for ended auctions
  const endedDays = Math.floor(Math.random() * 10) + 1
  const endedTime = `Ended ${endedDays} days ago`

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={`/placeholder.svg?height=300&width=300&text=Auction+${id}`}
          alt={`Auction ${id}`}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Verified NFT
          </Badge>
        </div>
        {!isUpcoming && !isEnded && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{timeRemaining}</span>
          </div>
        )}
        {isUpcoming && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex items-center justify-center">
            <span className="text-sm">{startTime}</span>
          </div>
        )}
        {isEnded && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex items-center justify-center">
            <span className="text-sm">{endedTime}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-medium truncate">Auction Item {id}</h3>
          <p className="text-sm text-muted-foreground">{category}</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-xs text-muted-foreground">Current Bid</p>
              <p className="font-bold">{currentBid} ₳</p>
            </div>
            <Link
              href={`https://cardanoscan.io/token/${tokenId}`}
              target="_blank"
              className="text-xs flex items-center text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Chain
            </Link>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {!isEnded ? (
          <Link href={`/auctions/${id}`} className="w-full">
            <Button variant={isUpcoming ? "outline" : "default"} className="w-full">
              {isUpcoming ? "Remind Me" : "Place Bid"}
            </Button>
          </Link>
        ) : (
          <Link href={`/auctions/${id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Results
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

