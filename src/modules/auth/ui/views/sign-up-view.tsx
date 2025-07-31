"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { OctagonAlertIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// 🔐 Form validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z.string().min(1, { message: "Confirm Password is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const SignUpView = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null)
    setPending(true)
    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password
      },
      {
        onSuccess: () => {
          setPending(false)
          router.push("/")
        },
        onError: ({ error }) => {
          setError(error.message)
          setPending(false)
        }
      }
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-4xl overflow-hidden p-0 shadow-lg">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Let&apos;s get started</h1>
                  <p className="text-muted-foreground">Create your Account</p>
                </div>

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Alert */}
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button disabled={pending} type="submit" className="w-full">
                  {pending ? "Creating..." : "Sign up"}
                </Button>

                {/* Divider */}
                <div className="relative my-4 flex items-center">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="mx-4 text-sm text-muted-foreground">or continue with</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                {/* OAuth Buttons */}
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <img src="/google.svg" alt="Google" className="h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <img src="/github.svg" alt="GitHub" className="h-4 w-4" />
                    GitHub
                  </Button>
                </div>

                {/* Already have an account */}
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          {/* Logo Panel */}
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

      {/* Terms & Privacy */}
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
