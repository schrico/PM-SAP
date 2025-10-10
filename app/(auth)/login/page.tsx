"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const AuthForm = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        } else {
          router.refresh();
          router.push("/");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) {
          throw error;
        } else {
          setShowVerifyPopup(true);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="mx-auto w-full max-w-sm space-y-6 justify-center items-center">
        <h1 className="text-2xl font-semibold text-center  ">
          {isLogin ? "Sign In" : "Create Account"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Your full name"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary underline underline-offset-2"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
        {showVerifyPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
            <div className="bg-white text-black rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-semibold mb-2">Verify your email</h2>
              <p className="mb-4">
                A confirmation email has been sent to your address. Please check
                your inbox and follow the link to activate your account.
              </p>
              <Button
                onClick={() => setShowVerifyPopup(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
