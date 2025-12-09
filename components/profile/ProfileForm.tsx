"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
  C_user: z.string().optional(),
  TE_user: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<"name" | "email" | "C_user" | "TE_user" | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // 🔹 Load user data
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsOAuthUser(user.app_metadata?.provider !== "email");

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setValue("name", profile.name || "");
        setValue("email", user.email || "");
        setValue("role", profile.role || "—");
        setValue("C_user", profile.C_user || "");
        setValue("TE_user", profile.TE_user || "");
      }
    }

    loadProfile();
  }, [supabase, setValue]);

  async function onSubmit(data: ProfileFormData) {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update name, C_user, and TE_user
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          name: data.name,
          C_user: data.C_user,
          TE_user: data.TE_user
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Handle email change
      if (!isOAuthUser && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;

        toast.info(
          `A confirmation email has been sent to ${data.email}. Please check your inbox to confirm the change.`
        );
      } else {
        toast.success("Profile updated successfully!");
      }

      setEditingField(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <div className="flex items-center gap-2">
          <Input
            {...register("name")}
            readOnly={editingField !== "name"}
            className={`flex-1 ${
              editingField === "name"
                ? "border-primary focus-visible:ring-primary"
                : "border-gray-300 bg-gray-100 cursor-default"
            }`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setEditingField(editingField === "name" ? null : "name")
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center gap-2">
          <Input
            {...register("email")}
            readOnly={editingField !== "email" || isOAuthUser}
            className={`flex-1 ${
              editingField === "email" && !isOAuthUser
                ? "border-primary focus-visible:ring-primary"
                : "border-gray-300 bg-gray-100 cursor-default"
            }`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              !isOAuthUser &&
              setEditingField(editingField === "email" ? null : "email")
            }
            disabled={isOAuthUser}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {isOAuthUser && (
          <p className="text-xs text-gray-500 mt-1">
            Email updates are disabled for OAuth users.
          </p>
        )}
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* 🔹 Role Field (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <Input
          {...register("role")}
          readOnly
          className="border-gray-300 bg-gray-100 cursor-default text-gray-800 font-medium"
        />
      </div>

      {/* 🔹 C_user Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          C User
        </label>
        <div className="flex items-center gap-2">
          <Input
            {...register("C_user")}
            readOnly={editingField !== "C_user"}
            className={`flex-1 ${
              editingField === "C_user"
                ? "border-primary focus-visible:ring-primary"
                : "border-gray-300 bg-gray-100 cursor-default"
            }`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setEditingField(editingField === "C_user" ? null : "C_user")
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {errors.C_user && (
          <p className="text-sm text-red-500 mt-1">{errors.C_user.message}</p>
        )}
      </div>

      {/* 🔹 TE_user Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          TE User
        </label>
        <div className="flex items-center gap-2">
          <Input
            {...register("TE_user")}
            readOnly={editingField !== "TE_user"}
            className={`flex-1 ${
              editingField === "TE_user"
                ? "border-primary focus-visible:ring-primary"
                : "border-gray-300 bg-gray-100 cursor-default"
            }`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setEditingField(editingField === "TE_user" ? null : "TE_user")
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {errors.TE_user && (
          <p className="text-sm text-red-500 mt-1">{errors.TE_user.message}</p>
        )}
      </div>

      {/* Submit Button – only show if editing */}
      {editingField && (
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}