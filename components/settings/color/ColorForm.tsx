"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ColorDynamicFields } from "./ColorDynamicFields";

export type Category = "system" | "language" | "status";

export const colorSchema = z
  .object({
    color_value: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Invalid hex"),
    category: z.enum(["system", "language", "status"]),
    system_name: z.string().optional().nullable(),
    status_key: z.string().optional().nullable(),
    language_in: z.string().optional().nullable(),
    language_out: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.category === "system") {
        return data.system_name && data.system_name.trim().length > 0;
      }
      if (data.category === "status") {
        return data.status_key && data.status_key.trim().length > 0;
      }
      if (data.category === "language") {
        return (
          data.language_in &&
          data.language_in.trim().length > 0 &&
          data.language_out &&
          data.language_out.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please fill in all required fields for the selected category",
      path: ["category"],
    }
  );

export type ColorFormValues = z.infer<typeof colorSchema>;

interface Props {
  editing:
    | (Partial<ColorFormValues> & { id?: number; setting_key?: string })
    | null;
  onDone: () => void;
  closeDialog: () => void;
}

export function ColorForm({ editing, onDone, closeDialog }: Props) {
  const supabase = createClientComponentClient();

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      color_value: "#000000",
      category: "system",
      system_name: null,
      status_key: null,
      language_in: null,
      language_out: null,
      description: null,
    },
  });

  const isEdit = !!editing;

  useEffect(() => {
    if (editing) {
      form.reset({
        color_value: editing.color_value || "#000000",
        category: editing.category || "system",
        system_name: editing.system_name ?? null,
        status_key: editing.status_key ?? null,
        language_in: editing.language_in ?? null,
        language_out: editing.language_out ?? null,
        description: editing.description ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function genKeyFromFields(values: Partial<ColorFormValues>) {
    if (!values.category) return "";
    let key = "";
    if (values.category === "system")
      key = `system_${(values.system_name || "").trim()}`;
    else if (values.category === "status")
      key = `status_${(values.status_key || "").trim()}`;
    else if (values.category === "language")
      key = `lang_${(values.language_in || "").trim()}_${(values.language_out || "").trim()}`;

    return key
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/__+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  const onSubmit = async (values: ColorFormValues) => {
    const payload: any = {
      ...values,
      updated_at: new Date().toISOString(),
    };

    if (!isEdit) {
      payload.setting_key = genKeyFromFields(values);
      // null out fields not in category
      payload.system_name =
        values.category === "system" ? values.system_name : null;
      payload.status_key =
        values.category === "status" ? values.status_key : null;
      payload.language_in =
        values.category === "language" ? values.language_in : null;
      payload.language_out =
        values.category === "language" ? values.language_out : null;
    }

    try {
      if (isEdit && editing?.id) {
        const { error } = await supabase
          .from("color_settings")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Color updated successfully.");
      } else {
        const { error } = await supabase.from("color_settings").insert(payload);
        if (error) {
          if ((error as any).code === "23505") {
            toast.error("This color setting already exists.");
            return;
          }
          throw error;
        }
        toast.success("New color added.");
      }

      onDone();
      closeDialog();
    } catch (err) {
      console.error("save error", err);
      toast.error("Failed to save color setting.");
    }
  };

  const watchedColor = form.watch("color_value") ?? "#000000";
  const selectedCategory = form.watch("category") ?? "system";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "system"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!isEdit && (
          <ColorDynamicFields category={selectedCategory} form={form} />
        )}

        <FormField
          control={form.control}
          name="color_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    value={field.value ?? "#000000"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-12 h-9 p-0"
                  />
                </FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-36 font-mono"
                />
                <div
                  aria-hidden
                  className="w-12 h-8 rounded border shadow-sm"
                  style={{ backgroundColor: watchedColor }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {isEdit ? "Update Color" : "Add Color"}
        </Button>
      </form>
    </Form>
  );
}
