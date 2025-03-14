/**
 * Validates image files based on DevoteMe requirements
 */
export async function validateImageFile(file: File): Promise<{ valid: boolean; message?: string }> {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, message: "File must be an image" }
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, message: "Image must be smaller than 10MB" }
  }

  // Check dimensions
  try {
    const dimensions = await getImageDimensions(file)

    // Check if dimensions match any of the allowed aspect ratios
    const isSquare = dimensions.width === dimensions.height // 1:1
    const isPortrait = Math.abs(dimensions.width / dimensions.height - 4 / 5) < 0.01 // 4:5
    const isLandscape = Math.abs(dimensions.width / dimensions.height - 1.91) < 0.01 // 1.91:1

    if (!isSquare && !isPortrait && !isLandscape) {
      return {
        valid: false,
        message: "Image must be in one of these ratios: 1:1 (square), 4:5 (portrait), or 1.91:1 (landscape)",
      }
    }

    // Check minimum dimensions
    if (dimensions.width < 320 || dimensions.height < 320) {
      return { valid: false, message: "Image must be at least 320x320 pixels" }
    }

    return { valid: true }
  } catch (error) {
    console.error("Error validating image dimensions:", error)
    return { valid: false, message: "Failed to validate image dimensions" }
  }
}

/**
 * Validates video files based on DevoteMe requirements
 */
export async function validateVideoFile(file: File): Promise<{ valid: boolean; message?: string }> {
  // Check file type
  if (!file.type.startsWith("video/mp4") && !file.type.startsWith("video/quicktime")) {
    return { valid: false, message: "Video must be MP4 or MOV format" }
  }

  // Check file size (4GB max)
  const maxSize = 4 * 1024 * 1024 * 1024 // 4GB in bytes
  if (file.size > maxSize) {
    return { valid: false, message: "Video must be smaller than 4GB" }
  }

  // Check video duration and dimensions
  try {
    const { duration, width, height } = await getVideoMetadata(file)

    // Check duration (120 minutes max)
    const maxDuration = 120 * 60 // 120 minutes in seconds
    if (duration > maxDuration) {
      return { valid: false, message: "Video must be shorter than 120 minutes" }
    }

    // Check aspect ratio
    const aspectRatio = width / height

    // Valid aspect ratios range from 9:16 (0.5625) to 16:9 (1.7778)
    if (aspectRatio < 0.5625 || aspectRatio > 1.7778) {
      return {
        valid: false,
        message: "Video aspect ratio must be between 9:16 and 16:9",
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("Error validating video metadata:", error)
    return { valid: false, message: "Failed to validate video metadata" }
  }
}

/**
 * Gets image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Gets video metadata including duration and dimensions
 */
function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error("Failed to load video metadata"))
    }

    video.src = URL.createObjectURL(file)
  })
}

