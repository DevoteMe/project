import { CountUp } from "@/components/ui/count-up"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Eye, Heart, MessageSquare, DollarSign } from "lucide-react"

interface AnalyticsSummaryProps {
  data: {
    totalViews: number
    totalFollowers: number
    totalLikes: number
    totalComments: number
    totalRevenue: number
  }
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  const items = [
    {
      title: "Total Views",
      value: data.totalViews,
      icon: Eye,
      description: "All-time content views",
      formatter: (value: number) => value.toLocaleString(),
    },
    {
      title: "Followers",
      value: data.totalFollowers,
      icon: Users,
      description: "People following you",
      formatter: (value: number) => value.toLocaleString(),
    },
    {
      title: "Likes",
      value: data.totalLikes,
      icon: Heart,
      description: "All-time likes received",
      formatter: (value: number) => value.toLocaleString(),
    },
    {
      title: "Comments",
      value: data.totalComments,
      icon: MessageSquare,
      description: "All-time comments received",
      formatter: (value: number) => value.toLocaleString(),
    },
    {
      title: "Revenue",
      value: data.totalRevenue,
      icon: DollarSign,
      description: "Total earnings",
      formatter: (value: number) =>
        `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CountUp value={item.value} formatter={item.formatter} />
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

