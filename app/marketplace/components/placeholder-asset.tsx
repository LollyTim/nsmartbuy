import { ImageIcon, FileText } from "lucide-react"

interface PlaceholderAssetProps {
    type: 'image' | 'document' | 'unknown';
}

export function PlaceholderAsset({ type }: PlaceholderAssetProps) {
    return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center p-4">
                {type === 'image' ? (
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                ) : type === 'document' ? (
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                ) : (
                    <div className="h-12 w-12 mx-auto mb-2 rounded-full bg-muted-foreground/20" />
                )}
                <p className="text-sm text-muted-foreground">
                    {type === 'image' ? 'Image Asset' : type === 'document' ? 'Document Asset' : 'Asset Preview'}
                </p>
            </div>
        </div>
    )
} 