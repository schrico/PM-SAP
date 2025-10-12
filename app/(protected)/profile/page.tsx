"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="flex justify-center mt-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-semibold mb-5">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
