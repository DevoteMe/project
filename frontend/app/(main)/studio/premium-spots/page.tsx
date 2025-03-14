"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "@/lib/axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, formatDateTime } from "@/lib/utils"
import type { Category, PremiumSpot } from "@/types"
import { Zap, Calendar, ExternalLink, RefreshCw } from "lucide-react"
import EmptyState from "@/components/empty-state"

// Premium spot purchase schema
const premiumSpotSchema = z.object({
  categoryId: z.string({ required_error: "Please select a category" }),
  optionId: z.string({ required_error: "Please select a duration" }),
})

type PremiumSpotFormValues = z.infer<typeof premiumSpotSchema>

// Premium spot options interface
interface PremiumSpotOption {
  id: string
  name: string
  price: number
  duration: number
}

export default function PremiumSpotsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeSpots, setActiveSpots] = useState<PremiumSpot[]>([])
  const [pastSpots, setPastSpots] = useState<PremiumSpot[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [premiumOptions, setPremiumOptions] = useState<PremiumSpotOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [selectedOption, setSelectedOption] = useState<PremiumSpotOption | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PremiumSpotFormValues>({
    resolver: zodResolver(premiumSpotSchema),
  })

  const watchCategoryId = watch("categoryId")
  const watchOptionId = watch("optionId")

  useEffect(() => {
    if (watchOptionId && premiumOptions.length > 0) {
      const option = premiumOptions.find((o) => o.id === watchOptionId) || null
      setSelectedOption(option)
    } else {
      setSelectedOption(null)
    }
  }, [watchOptionId, premiumOptions])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch categories
      const { data: categoriesData } = await axios.get("/admin/categories")
      setCategories(categoriesData)

      // Fetch premium spot options
      const { data: optionsData } = await axios.get("/premium-spots/options")
      setPremiumOptions(optionsData.options)

      // Fetch user's premium spots
      const { data: spotsData } = await axios.get("/premium-spots")

      // Split into active and past
      const now = new Date()
      const active: PremiumSpot[] = []
      const past: PremiumSpot[] = []

      spotsData.forEach((spot: PremiumSpot) => {
        const endTime = new Date(spot.endTime)
        if (endTime > now) {
          active.push(spot)
        } else {
          past.push(spot)
        }
      })

      setActiveSpots(active)
      setPastSpots(past)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })

      // Mock data for demonstration
      setCategories([
        { id: "sports", name: "Sports", isFixed: true },
        { id: "gaming", name: "Gaming", isFixed: true },
        { id: "lifestyle", name: "Lifestyle", isFixed: true },
      ])

      setPremiumOptions([
        { id: "3hours", name: "3 Hours", price: 9.99, duration: 3 * 60 * 60 * 1000 },
        { id: "6hours", name: "6 Hours", price: 14.99, duration: 6 * 60 * 60 * 1000 },
        { id: "12hours", name: "12 Hours", price: 24.99, duration: 12 * 60 * 60 * 1000 },
        { id: "24hours", name: "24 Hours", price: 39.99, duration: 24 * 60 * 60 * 1000 },
        { id: "3days", name: "3 Days", price: 99.99, duration: 3 * 24 * 60 * 60 * 1000 },
        { id: "1week", name: "1 Week", price: 199.99, duration: 7 * 24 * 60 * 60 * 1000 },
      ])

      // Mock active spots
      setActiveSpots([
        {
          id: "spot1",
          creatorId: "creator1",
          categoryId: "gaming",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          price: 39.99,
          category: { id: "gaming", name: "Gaming", isFixed: true },
        },
      ])

      // Mock past spots
      setPastSpots([
        {
          id: "spot2",
          creatorId: "creator1",
          categoryId: "sports",
          startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          price: 14.99,
          category: { id: "sports", name: "Sports", isFixed: true },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PremiumSpotFormValues) => {
    setIsPurchasing(true)
    try {
      await axios.post(`/premium-spots/${data.categoryId}`, {
        optionId: data.optionId,
      })

      toast({
        title: "Premium spot purchased",
        description: "Your premium spot has been purchased successfully.",
      })

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error purchasing premium spot:", error)
      toast({
        title: "Error",
        description: "Failed to purchase premium spot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Premium Spots</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Purchase Premium Spot
              </CardTitle>
              <CardDescription>Get featured at the top of category pages to increase your visibility</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select onValueChange={(value) => setValue("categoryId", value)} defaultValue={watchCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <RadioGroup
                    onValueChange={(value) => setValue("optionId", value)}
                    defaultValue={watchOptionId}
                    className="grid grid-cols-1 gap-2"
                  >
                    {premiumOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between rounded-md border p-4 ${
                          watchOptionId === option.id ? "border-primary" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer">
                            {option.name}
                          </Label>
                        </div>
                        <div className="font-medium">{formatPrice(option.price)}</div>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.optionId && <p className="text-sm text-destructive">{errors.optionId.message}</p>}
                </div>

                {selectedOption && (
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Premium spot in {categories.find((c) => c.id === watchCategoryId)?.name || ""}</span>
                        <span>{selectedOption.name}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatPrice(selectedOption.price)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPurchasing || !watchCategoryId || !watchOptionId} className="w-full">
                  {isPurchasing ? "Processing payment..." : "Purchase Premium Spot"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Premium Spots</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : activeSpots.length === 0 ? (
            <EmptyState
              icon={<Zap className="h-12 w-12" />}
              title="No active premium spots"
              description="You don't have any active premium spots. Purchase one to increase your visibility."
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Active Spots</h3>
              {activeSpots.map((spot) => (
                <Card key={spot.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 font-medium">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>{spot.category.name}</span>
                      </div>
                      <div className="text-sm font-medium">{formatPrice(spot.price)}</div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <span className="font-medium">Expires:</span> {formatDateTime(spot.endTime)}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a
                        href={`/discover?category=${spot.categoryId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1"
                      >
                        <span>View Category</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pastSpots.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Past Spots</h3>
              {pastSpots.map((spot) => (
                <Card key={spot.id} className="bg-muted/30 border-muted">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 font-medium">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span>{spot.category.name}</span>
                      </div>
                      <div className="text-sm font-medium">{formatPrice(spot.price)}</div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <span className="font-medium">Expired:</span> {formatDateTime(spot.endTime)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setValue("categoryId", spot.categoryId)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Purchase Again
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

