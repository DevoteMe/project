import { PrismaClient, UserType } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const adminPassword = "Admin@123"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@devoteme.com" },
    update: {},
    create: {
      email: "admin@devoteme.com",
      username: "admin",
      passwordHash: adminPasswordHash,
      userType: UserType.ADMIN,
      nsfwSettings: {
        showNsfw: true,
        blurNsfw: false,
      },
      notificationSettings: {
        payment: true,
        systemInfo: true,
        newTip: true,
        newDevotee: true,
        creatorAnnouncements: true,
        creatorPromotion: true,
        creatorPosts: true,
        newLikes: true,
        newComments: true,
      },
    },
  })

  console.log("Admin user created:", admin.username)

  // Create default categories
  const defaultCategories = [
    { name: "Sports", isFixed: true },
    { name: "Gaming", isFixed: true },
    { name: "Exercise", isFixed: true },
    { name: "Lifestyle", isFixed: true },
    { name: "Travel", isFixed: true },
    { name: "Shopping", isFixed: true },
    { name: "Health", isFixed: true },
    { name: "Social", isFixed: true },
    { name: "Entertainment", isFixed: true },
    { name: "Body", isFixed: true },
    { name: "Misc", isFixed: true },
  ]

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log("Default categories created")

  // Create default admin settings
  const defaultSettings = [
    {
      key: "premiumSpotPrices",
      value: {
        "3hours": 9.99,
        "6hours": 14.99,
        "12hours": 24.99,
        "24hours": 39.99,
        "3days": 99.99,
        "1week": 199.99,
      },
    },
    {
      key: "loginQuotes",
      value: [
        "Join DevoteMe and connect with your favorite content creators",
        "DevoteMe - Where content creators own their content",
        "Support your favorite content creators directly",
      ],
    },
    {
      key: "ambassadorProfiles",
      value: [],
    },
  ]

  for (const setting of defaultSettings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log("Default admin settings created")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

