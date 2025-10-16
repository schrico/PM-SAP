"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
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
import { ColorFormValues, Category } from "./ColorForm";

interface Props {
  category: string | Category;
  form: UseFormReturn<ColorFormValues>;
}

export function ColorDynamicFields({ category, form }: Props) {
  const cat = (category || "system") as Category;

  if (cat === "system")
    return (
      <FormField
        control={form.control}
        name="system_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>System Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. XTM"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );

  if (cat === "status")
    return (
      <FormField
        control={form.control}
        name="status_key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Select onValueChange={(v) => field.onChange(v)} value={field.value ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );

  if (cat === "language")
    return (
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="language_in"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From (language)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Eng"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language_out"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To (language)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Pt"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );

  return null;
}
