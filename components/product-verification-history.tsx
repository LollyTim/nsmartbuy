import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ProductVerificationHistory() {
  // Mock verification history data
  const history = [
    {
      date: "2023-10-15",
      event: "Product Minted as NFT",
      address: "addr1qxck...7v4wfgxgp",
      txHash: "5d677265c9c7...a94c2bc",
    },
    {
      date: "2023-10-20",
      event: "Transferred to Distributor",
      address: "addr1qyck...8v5wfgxgq",
      txHash: "6e788376d0d8...b05d3cd",
    },
    {
      date: "2023-11-05",
      event: "Listed by Seller",
      address: "addr1qzck...9v6wfgxgr",
      txHash: "7f899487e1e9...c16e4de",
    },
  ]

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
          <div className="min-w-[100px] text-sm text-muted-foreground">{item.date}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={index === 0 ? "default" : "outline"}>{item.event}</Badge>
            </div>
            <div className="mt-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-mono">{item.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">Transaction:</span>
                <span className="font-mono truncate">{item.txHash}</span>
                <Link
                  href={`https://cardanoscan.io/transaction/${item.txHash}`}
                  target="_blank"
                  className="text-xs flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

