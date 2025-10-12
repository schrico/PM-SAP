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
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<"name" | "email" | null>(
    null
  );
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

  // Load user data
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsOAuthUser(user.app_metadata?.provider !== "email");

      const { data: profile } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", user.id)
        .single();

      if (profile) {
        setValue("name", profile.name || "");
        setValue("email", user.email || "");
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

      // Update name in your users table
      const { error: updateError } = await supabase
        .from("users")
        .update({ name: data.name })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Handle email change
      if (!isOAuthUser && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;

        // 👇 Add this toast to guide the user
        toast.info(`A confirmation email has been sent to ${data.email}. 
Please check your inbox to confirm the change.`);
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

      {/* Submit Button — only show if editing */}
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
