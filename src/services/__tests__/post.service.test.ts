import { PostService } from "../post.service"
import { PrismaClient, VisibilityType } from "@prisma/client"
import { bunnyCDNService } from "../bunny-cdn.service"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock dependencies
jest.mock("../bunny-cdn.service", () => ({
  bunnyCDNService: {
    uploadContent: jest.fn().mockResolvedValue("https://cdn.example.com/content.mp4"),
    uploadThumbnail: jest.fn().mockResolvedValue("https://cdn.example.com/thumbnail.jpg"),
  },
}))

const prisma = new PrismaClient()
const postService = new PostService()

describe("PostService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      // Mock Prisma responses
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user123",
        contentCreator: {
          id: "creator123",
        },
      })
      ;(prisma.post.create as jest.Mock).mockResolvedValue({
        id: "post123",
        creatorId: "user123",
        title: "Test Post",
        contentUrl: "https://cdn.example.com/content.mp4",
        thumbnailUrl: "https://cdn.example.com/thumbnail.jpg",
        visibilityType: VisibilityType.PUBLIC,
      })
      ;(prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: "post123",
        creatorId: "user123",
        title: "Test Post",
        contentUrl: "https://cdn.example.com/content.mp4",
        thumbnailUrl: "https://cdn.example.com/thumbnail.jpg",
        visibilityType: VisibilityType.PUBLIC,
        categories: [],
      })

      const postData = {
        title: "Test Post",
        visibilityType: VisibilityType.PUBLIC,
        categories: ["category123"],
      }

      const contentFile = {
        buffer: Buffer.from("content"),
        originalname: "content.mp4",
        mimetype: "video/mp4",
      }

      const thumbnailFile = {
        buffer: Buffer.from("thumbnail"),
        originalname: "thumbnail.jpg",
        mimetype: "image/jpeg",
      }

      const result = await postService.createPost("user123", postData, contentFile, thumbnailFile)

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user123" },
        include: { contentCreator: true },
      })
      expect(bunnyCDNService.uploadContent).toHaveBeenCalled()
      expect(bunnyCDNService.uploadThumbnail).toHaveBeenCalled()
      expect(prisma.post.create).toHaveBeenCalled()
      expect(prisma.categoryOnPost.create).toHaveBeenCalled()
      expect(prisma.contentCreator.update).toHaveBeenCalled()
      expect(result).toHaveProperty("id", "post123")
    })

    it("should throw an error if user is not a content creator", async () => {
      // Mock Prisma response for non-content creator
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user123",
        contentCreator: null,
      })

      const postData = {
        title: "Test Post",
        visibilityType: VisibilityType.PUBLIC,
        categories: ["category123"],
      }

      const contentFile = {
        buffer: Buffer.from("content"),
        originalname: "content.mp4",
        mimetype: "video/mp4",
      }

      const thumbnailFile = {
        buffer: Buffer.from("thumbnail"),
        originalname: "thumbnail.jpg",
        mimetype: "image/jpeg",
      }

      // Assertions
      await expect(postService.createPost("user123", postData, contentFile, thumbnailFile)).rejects.toThrow(
        "User is not a content creator",
      )
      expect(prisma.user.findUnique).toHaveBeenCalled()
      expect(bunnyCDNService.uploadContent).not.toHaveBeenCalled()
    })
  })

  describe("getDiscoveryPosts", () => {
    it("should return discovery posts with pagination", async () => {
      // Mock Prisma responses
      ;(prisma.post.findMany as jest.Mock).mockResolvedValue([
        {
          id: "post123",
          title: "Test Post",
          creator: { username: "creator1" },
          categories: [],
          _count: { likes: 10, comments: 5 },
        },
      ])
      ;(prisma.post.count as jest.Mock).mockResolvedValue(1)

      const result = await postService.getDiscoveryPosts(undefined, 1, 12)

      // Assertions
      expect(prisma.post.findMany).toHaveBeenCalled()
      expect(prisma.post.count).toHaveBeenCalled()
      expect(result).toHaveProperty("posts")
      expect(result).toHaveProperty("pagination")
      expect(result.pagination).toHaveProperty("totalPages", 1)
    })
  })

  // Add more tests for other methods...
})

