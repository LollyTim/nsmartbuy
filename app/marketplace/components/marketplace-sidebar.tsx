"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface MarketplaceSidebarProps {
    onFilterChange: (filters: {
        category: string;
        priceRange: [number, number];
        listingType: "all" | "fixed" | "auction";
        sortBy: string;
    }) => void;
    categories: {
        id: string;
        name: string;
        count: number;
    }[];
    maxPrice: number;
}

export function MarketplaceSidebar({
    onFilterChange,
    categories,
    maxPrice,
}: MarketplaceSidebarProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
    const [listingType, setListingType] = useState<"all" | "fixed" | "auction">("all");
    const [sortBy, setSortBy] = useState<string>("newest");

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        onFilterChange({
            category,
            priceRange,
            listingType,
            sortBy,
        });
    };

    const handlePriceChange = (value: number[]) => {
        const range: [number, number] = [value[0], value[1]];
        setPriceRange(range);
        onFilterChange({
            category: selectedCategory,
            priceRange: range,
            listingType,
            sortBy,
        });
    };

    const handleListingTypeChange = (value: "all" | "fixed" | "auction") => {
        setListingType(value);
        onFilterChange({
            category: selectedCategory,
            priceRange,
            listingType: value,
            sortBy,
        });
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        onFilterChange({
            category: selectedCategory,
            priceRange,
            listingType,
            sortBy: value,
        });
    };

    return (
        <Card className="p-6 space-y-6">
            <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${selectedCategory === "all"
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                        >
                            <span>All Categories</span>
                            <Badge variant="outline" className="ml-auto">
                                {categories.reduce((acc, cat) => acc + cat.count, 0)}
                            </Badge>
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${selectedCategory === category.id
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                    }`}
                            >
                                <span>{category.name}</span>
                                <Badge variant="outline" className="ml-auto">
                                    {category.count}
                                </Badge>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-4">
                    <Slider
                        min={0}
                        max={maxPrice}
                        step={1}
                        value={[priceRange[0], priceRange[1]]}
                        onValueChange={handlePriceChange}
                        className="mt-6"
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-sm">₳{priceRange[0]}</span>
                        <span className="text-sm">₳{priceRange[1]}</span>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-4">Listing Type</h3>
                <RadioGroup
                    value={listingType}
                    onValueChange={(value) => handleListingTypeChange(value as "all" | "fixed" | "auction")}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All Listings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Fixed Price</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auction" id="auction" />
                        <Label htmlFor="auction">Auctions</Label>
                    </div>
                </RadioGroup>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-4">Sort By</h3>
                <RadioGroup value={sortBy} onValueChange={handleSortChange}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="newest" id="newest" />
                        <Label htmlFor="newest">Newest First</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oldest" id="oldest" />
                        <Label htmlFor="oldest">Oldest First</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price-low" id="price-low" />
                        <Label htmlFor="price-low">Price: Low to High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price-high" id="price-high" />
                        <Label htmlFor="price-high">Price: High to Low</Label>
                    </div>
                </RadioGroup>
            </div>
        </Card>
    );
} 