"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const HomeView = () => {
const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome 👋</h1>

        <p className="text-gray-700 mb-6">
          Logged in as <span className="font-semibold">{session.user.name}</span>
        </p>

        <Button
          variant="destructive"
          onClick={() => {
            authClient.signOut()
                .then(() => router.push("/sign-in"))
                .catch(() => window.alert("Sign-out failed"));
                ;
          }}
          className="w-full"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};
