import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OnboardingSuccess() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
                Your seller application is under review. We'll notify you via email within 2-3 business days.
            </p>
            <div className="space-y-3">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/dashboard">
                        Go to Dashboard
                    </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                    <Link href="/marketplace">
                        Browse Marketplace
                    </Link>
                </Button>
            </div>
        </div>
    )
}