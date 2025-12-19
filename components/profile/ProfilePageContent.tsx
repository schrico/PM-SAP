"use client";

import { useMemo, useState, useEffect } from "react";
import { Save, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileFormField } from "./ProfileFormField";
import { ProfileStatus } from "./ProfileStatus";
import { Loader2 as LoaderIcon } from "lucide-react";

interface ProfileFormData {
  name: string;
  short_name: string;
  email: string;
  C_user: string;
  TE_user: string;
  role: string;
}

export function ProfilePageContent() {
  const { data: user, isLoading: userLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    short_name: "",
    email: "",
    C_user: "",
    TE_user: "",
    role: "",
  });
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        short_name: user.short_name || "",
        email: user.email || "",
        C_user: user.C_user || "",
        TE_user: user.TE_user || "",
        role:
          user.role === "admin"
            ? "Administrator"
            : user.role === "pm"
            ? "Project Manager"
            : "Translator",
      });
    }
  }, [user]);

  const initialData = useMemo(() => {
    if (!user) return formData;
    return {
      name: user.name || "",
      short_name: user.short_name || "",
      email: user.email || "",
      C_user: user.C_user || "",
      TE_user: user.TE_user || "",
      role:
        user.role === "admin"
          ? "Administrator"
          : user.role === "pm"
          ? "Project Manager"
          : "Translator",
    };
  }, [user]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        short_name: formData.short_name || "",
        C_user: formData.C_user || "",
        TE_user: formData.TE_user || "",
        email: formData.email,
      });
      setLastSavedAt(new Date());
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderIcon className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2 text-3xl font-bold">
          Profile Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update your personal information and account details
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Avatar Section */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <ProfileAvatar name={formData.name} />
            <div>
              <h2 className="text-gray-900 dark:text-white mb-1 text-lg font-semibold">
                {formData.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {formData.email}
              </p>
            </div>
          </div>

          <ProfileStatus hasChanges={hasChanges} lastSavedAt={lastSavedAt} />
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-8">
          {/* Personal info */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Personal information
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will be visible to project managers and colleagues.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <ProfileFormField label="Full Name" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </ProfileFormField>

              {/* Short Name */}
              <ProfileFormField
                label="Preferred Name"
                description="This is how your name will appear in project views."
              >
                <input
                  type="text"
                  value={formData.short_name}
                  onChange={(e) => handleChange("short_name", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </ProfileFormField>

              {/* Email */}
              <ProfileFormField label="Email Address">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </ProfileFormField>

              {/* Role (Read-only) */}
              <ProfileFormField label="Role">
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </ProfileFormField>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Account details */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Account details
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Integration usernames for your CAT tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* C User */}
              <ProfileFormField label="C Username">
                <input
                  type="text"
                  value={formData.C_user}
                  onChange={(e) => handleChange("C_user", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </ProfileFormField>

              {/* TE User */}
              <ProfileFormField label="TE Username">
                <input
                  type="text"
                  value={formData.TE_user}
                  onChange={(e) => handleChange("TE_user", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </ProfileFormField>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges || updateProfile.isPending}
              className={`px-6 py-3 cursor-pointer rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm font-medium ${
                !hasChanges || updateProfile.isPending
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              type="button"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Link to Settings for notifications */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          <p className="text-gray-700 dark:text-gray-200 text-sm">
            Notification rules are managed in{" "}
            <span className="font-medium">Settings</span>.
          </p>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Open Settings
        </Link>
      </div>

      {/* Additional Info Card */}
      <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <p className="text-blue-900 dark:text-blue-200 text-sm">
          <span>💡 </span>
          Your role is assigned by project managers and cannot be changed here.
          Contact your PM if you believe your role needs updating.
        </p>
      </div>
    </div>
  );
}

