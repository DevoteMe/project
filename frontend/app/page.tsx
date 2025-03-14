import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DevoteMe Logo" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">DevoteMe</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#creators" className="text-sm font-medium hover:text-primary">
              For Creators
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Connect with your favorite <span className="text-primary">content creators</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
          DevoteMe is a platform where content creators can connect with their audience and monetize their content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link href="/register?type=user">
            <Button size="lg" className="gap-2">
              Join as a Fan <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?type=creator">
            <Button size="lg" variant="outline" className="gap-2">
              Become a Creator <Zap className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose DevoteMe?</h2>
          <p className="max-w-[700px] mx-auto text-muted-foreground">
            We provide a platform that puts creators first, with fair revenue sharing and powerful tools.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Support Creators</h3>
            <p className="text-muted-foreground">
              Directly support your favorite content creators through subscriptions and tips.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Content Ownership</h3>
            <p className="text-muted-foreground">
              Creators maintain full ownership of their content with our creator-first policies.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fair Revenue</h3>
            <p className="text-muted-foreground">
              We offer one of the most competitive revenue shares in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section id="creators" className="bg-muted py-24">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">For Content Creators</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground">
              DevoteMe provides everything you need to build and monetize your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Subscription Model</h3>
              <p className="text-muted-foreground">
                Set your own subscription price and offer exclusive content to your subscribers.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Direct Messaging</h3>
              <p className="text-muted-foreground">Connect directly with your fans through our messaging system.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track your growth, engagement, and earnings with detailed analytics.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Premium Spots</h3>
              <p className="text-muted-foreground">Boost your visibility with premium placement in category pages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Fair Pricing</h2>
          <p className="max-w-[700px] mx-auto text-muted-foreground">
            DevoteMe takes a small commission on transactions, ensuring creators keep most of their earnings.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col p-6 border rounded-lg">
            <h3 className="text-xl font-bold">Platform Fee</h3>
            <div className="mt-4 text-4xl font-bold">15%</div>
            <p className="mt-2 text-muted-foreground">
              We take a 15% commission on all transactions, which is lower than most platforms.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Subscription revenue</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Tips and donations</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Pay-per-view content</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col p-6 border rounded-lg bg-primary text-primary-foreground">
            <h3 className="text-xl font-bold">Referral Program</h3>
            <div className="mt-4 text-4xl font-bold">5%</div>
            <p className="mt-2 opacity-90">Refer other creators and earn 5% of their revenue for a full year.</p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">No cap on earnings</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Passive income</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">Easy referral links</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col p-6 border rounded-lg">
            <h3 className="text-xl font-bold">Premium Spots</h3>
            <div className="mt-4 text-4xl font-bold">From $9.99</div>
            <p className="mt-2 text-muted-foreground">
              Boost your visibility with premium placement in category pages.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">3 hours: $9.99</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">24 hours: $39.99</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2">1 week: $199.99</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
          <p className="max-w-[600px] mx-auto opacity-90">
            Join thousands of content creators and fans on DevoteMe today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link href="/register?type=user">
              <Button size="lg" variant="secondary" className="gap-2">
                Join as a Fan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?type=creator">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white hover:bg-white/10">
                Become a Creator <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="DevoteMe Logo" width={24} height={24} className="h-6 w-6" />
              <span className="text-lg font-bold text-primary">DevoteMe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A platform where content creators can connect with their audience and monetize their content.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#creators" className="text-muted-foreground hover:text-foreground">
                  For Creators
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} DevoteMe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

