"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaGithub, FaGoogle } from "react-icons/fa";
import { OctagonAlertIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle } from "@/components/ui/alert"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" })
})

export const SignInView = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
 const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null)
    setPending(true)

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password
      },
      {
        onSuccess: () => {
          setPending(false)
          router.push("/")
        },
        onError: ({ error }) => {
          setPending(false)
          setError(error.message)
        }
      }
    )
  }

    const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
        setError(null)
        setPending(true)
        setLoadingProvider(provider)

        await authClient.signIn.social({ provider })

        setPending(false)
        setLoadingProvider(null)
        router.push("/")
    } catch (err: any) {
        setPending(false)
        setLoadingProvider(null)
        setError(err?.message || `Failed to sign in with ${provider}`)
    }
    }



  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-4xl overflow-hidden p-0 shadow-lg">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
          {/* Left Section: Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-muted-foreground">Login to your account</p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button disabled={pending} type="submit" className="w-full">
                  Sign in
                </Button>

                <div className="relative my-4 flex items-center">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="mx-4 text-sm text-muted-foreground">or continue with</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
  <Button
    onClick={() => handleSocialSignIn("google")}
    variant="outline"
    className="w-full h-9 px-3 py-1.5 text-xs flex items-center justify-center gap-2"
  >
    <FaGoogle className="h-3.5 w-3.5" />
    Google
  </Button>

  <Button
    onClick={() => handleSocialSignIn("github")}
    variant="outline"
    className="w-full h-9 px-3 py-1.5 text-xs flex items-center justify-center gap-2"
  >
    <FaGithub className="h-3.5 w-3.5" />
    GitHub
  </Button>
</div>



                <div className="text-center text-sm text-muted-foreground mt-4">
                  Don’t have an account?{" "}
                  <Link href="/sign-up" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* Right Section: Logo */}
          <div className="relative hidden md:flex flex-col items-center justify-center bg-gray-900 p-10 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <img src="/logo.svg" alt="Logo" className="h-16 w-16 object-contain" />
              </div>
              <h2 className="text-3xl font-bold tracking-wide">Sayphora.AI</h2>
              <p className="text-sm text-slate-300 text-center max-w-xs">
                Smarter conversations. Intelligent outcomes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        By clicking, you agree to our{" "}
        <a href="/terms" className="text-primary underline hover:text-primary/80">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary underline hover:text-primary/80">
          Privacy Policy
        </a>.
      </div>
    </div>
  )
}
