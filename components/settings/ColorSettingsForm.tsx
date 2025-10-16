"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// 1️⃣ Define schema
const colorSchema = z.object({
  key: z.string().min(1, "Key is required"),
  category: z.enum(["system", "state", "language"]),
  system_name: z.string().optional(),
  status: z.enum(["complete", "active", "cancelled"]).optional(),
  language_in: z.string().optional(),
  language_out: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

// 2️⃣ Create form type from schema
type ColorFormData = z.infer<typeof colorSchema>;

export function ColorSettingsForm() {
  // 3️⃣ Connect Zod to RHF
  const form = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      key: "",
      category: "system",
      color: "#ffffff",
    },
  });

  const { register, handleSubmit, watch, formState } = form;
  const category = watch("category");

  const onSubmit = async (data: ColorFormData) => {
    try {
      // Example save call
      console.log(data);
      toast({ title: "Color saved successfully!" });
    } catch (err) {
      toast({ title: "Error saving color", description: String(err) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Key" {...register("key")} />

      <select {...register("category")}>
        <option value="system">System</option>
        <option value="state">State</option>
        <option value="language">Language</option>
      </select>

      {category === "system" && (
        <Input placeholder="System name" {...register("system_name")} />
      )}

      {category === "state" && (
        <select {...register("status")}>
          <option value="active">Active</option>
          <option value="complete">Complete</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )}

      {category === "language" && (
        <div className="flex gap-2">
          <Input placeholder="Language In" {...register("language_in")} />
          <Input placeholder="Language Out" {...register("language_out")} />
        </div>
      )}

      <Input type="color" {...register("color")} />

      <Button type="submit">Save</Button>
    </form>
  );
}
