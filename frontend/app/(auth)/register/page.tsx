"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import SocialLoginButtons from "@/components/social-login-buttons"

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  userType: z.enum(["USER", "CONTENT_CREATOR"]),
  country: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const defaultUserType = searchParams.get("type") === "creator" ? "CONTENT_CREATOR" : "USER"

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: defaultUserType,
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true)
      await registerUser(data)
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      })
      router.push("/feed")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="username" className="text-sm font-medium leading-none">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("username")}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="grid gap-2">
                <label htmlFor="userType" className="text-sm font-medium leading-none">
                  Account Type
                </label>
                <Select
                  defaultValue={defaultUserType}
                  onValueChange={(value) => setValue("userType", value as "USER" | "CONTENT_CREATOR")}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Fan</SelectItem>
                    <SelectItem value="CONTENT_CREATOR">Content Creator</SelectItem>
                  </SelectContent>
                </Select>
                {errors.userType && <p className="text-sm text-destructive">{errors.userType.message}</p>}
              </div>
              <div className="grid gap-2">
                <label htmlFor="country" className="text-sm font-medium leading-none">
                  Country (Optional)
                </label>
                <Input id="country" placeholder="United States" disabled={isLoading} {...register("country")} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <SocialLoginButtons setIsLoading={setIsLoading} />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

