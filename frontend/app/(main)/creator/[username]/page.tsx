import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CreatorProfile } from "@/components/creator/public-profile/creator-profile"
import { CreatorContent } from "@/components/creator/public-profile/creator-content"
import { SubscriptionOptions } from "@/components/creator/public-profile/subscription-options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CreatorProfilePageProps {
  params: {
    username: string
  }
}

// This would normally be fetched from an API
const getCreator = (username: string) => {
  // Mock data for demonstration
  const creators = [
    {
      id: "creator1",
      username: "creativeminds",
      name: "Creative Minds",
      bio: "Digital artist and content creator sharing my creative journey",
      avatar: "/placeholder.svg?height=200&width=200",
      coverImage: "/placeholder.svg?height=400&width=1200",
      subscriberCount: 1250,
      contentCount: 87,
      isVerified: true,
    },
  ]

  return creators.find((creator) => creator.username === username)
}

export async function generateMetadata({ params }: CreatorProfilePageProps): Promise<Metadata> {
  const creator = getCreator(params.username)

  if (!creator) {
    return {
      title: "Creator Not Found | DevoteMe",
      description: "The creator you are looking for does not exist.",
    }
  }

  return {
    title: `${creator.name} | DevoteMe`,
    description: creator.bio,
  }
}

export default function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const creator = getCreator(params.username)

  if (!creator) {
    notFound()
  }

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <CreatorProfile creator={creator} />

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <CreatorContent creatorId={creator.id} />
        </TabsContent>

        <TabsContent value="subscribe" className="mt-6">
          <SubscriptionOptions creatorId={creator.id} creatorName={creator.name} />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <div className="prose max-w-none">
            <h2>About {creator.name}</h2>
            <p>{creator.bio}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
              nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl
              nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
            </p>
            <h3>My Story</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
              nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl
              nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
              nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

