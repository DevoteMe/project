import axios from "axios"
import { config } from "../config/app-config"

export class BunnyCDNService {
  private baseUrl: string
  private storageZone: string
  private apiKey: string

  constructor() {
    this.storageZone = config.bunnyCDN.storageZone
    this.apiKey = config.bunnyCDN.apiKey
    this.baseUrl = `https://storage.bunnycdn.com/${this.storageZone}`
  }

  /**
   * Upload a file to BunnyCDN
   * @param filePath Local file path
   * @param remotePath Remote path on BunnyCDN
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, remotePath: string): Promise<string> {
    try {
      const fullRemotePath = `${remotePath}/${fileName}`

      await axios({
        method: "PUT",
        url: `${this.baseUrl}/${fullRemotePath}`,
        data: fileBuffer,
        headers: {
          AccessKey: this.apiKey,
          "Content-Type": "application/octet-stream",
        },
      })

      return `${config.bunnyCDN.pullZone}/${fullRemotePath}`
    } catch (error) {
      console.error("Error uploading file to BunnyCDN:", error)
      throw new Error("Failed to upload file to CDN")
    }
  }

  /**
   * Upload a content file with protection for paid content
   * @param fileBuffer File buffer
   * @param fileName File name
   * @param userId User ID
   * @param isProtected Whether the content is protected (paid)
   */
  async uploadContent(fileBuffer: Buffer, fileName: string, userId: string, isProtected = false): Promise<string> {
    const remotePath = isProtected ? `protected/${userId}` : `public/${userId}`

    return this.uploadFile(fileBuffer, fileName, remotePath)
  }

  /**
   * Upload a thumbnail
   * @param fileBuffer File buffer
   * @param fileName File name
   * @param userId User ID
   */
  async uploadThumbnail(fileBuffer: Buffer, fileName: string, userId: string): Promise<string> {
    return this.uploadFile(fileBuffer, fileName, `thumbnails/${userId}`)
  }

  /**
   * Delete a file from BunnyCDN
   * @param remotePath Remote path on BunnyCDN
   */
  async deleteFile(remotePath: string): Promise<void> {
    try {
      await axios({
        method: "DELETE",
        url: `${this.baseUrl}/${remotePath}`,
        headers: {
          AccessKey: this.apiKey,
        },
      })
    } catch (error) {
      console.error("Error deleting file from BunnyCDN:", error)
      throw new Error("Failed to delete file from CDN")
    }
  }

  /**
   * Generate a signed URL for protected content
   * @param remotePath Remote path on BunnyCDN
   * @param expirationMinutes URL expiration in minutes
   */
  generateSignedUrl(remotePath: string, expirationMinutes = 30): string {
    // Implementation depends on BunnyCDN's token authentication system
    // This is a placeholder - actual implementation would use BunnyCDN's security token system
    const expirationTime = Math.floor(Date.now() / 1000) + expirationMinutes * 60

    // In a real implementation, you would generate a security token based on BunnyCDN's requirements
    const securityToken = "placeholder-token"

    return `${config.bunnyCDN.pullZone}/${remotePath}?token=${securityToken}&expires=${expirationTime}`
  }

  /**
   * Generate a blurred preview URL for protected content
   * @param remotePath Remote path on BunnyCDN
   */
  generateBlurredPreviewUrl(remotePath: string): string {
    // Use BunnyCDN's image processing capabilities to generate a blurred version
    // The blur parameter value can be adjusted (1-100) to control blur intensity
    return `${config.bunnyCDN.pullZone}/${remotePath}?blur=80`
  }
}

export const bunnyCDNService = new BunnyCDNService()

