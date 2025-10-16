// components/settings/ColorSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, Palette, PlusCircle, Trash2, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Category = "system" | "language" | "status";

interface ColorSetting {
  id: number;
  setting_key: string;
  color_value: string;
  category: Category;
  system_name?: string | null;
  status_key?: string | null;
  language_in?: string | null;
  language_out?: string | null;
  description?: string | null;
}

interface ColorSettingsProps {
  userRole?: string;
}

export function ColorSettings({ userRole }: ColorSettingsProps) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [settings, setSettings] = useState<ColorSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ColorSetting | null>(null);

  const [form, setForm] = useState<Partial<ColorSetting>>({
    category: "system",
    color_value: "#000000",
  });

  const isAdmin = userRole === "admin";

  // fetch settings
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("color_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("setting_key", { ascending: true });
    if (error) {
      console.error("fetchSettings error:", error);
      toast({
        title: "Error",
        description: "Failed to load color settings.",
        variant: "destructive",
      });
    } else {
      setSettings((data || []) as ColorSetting[]);
    }
    setLoading(false);
  }

  // generate setting_key
  function genSettingKey(obj: Partial<ColorSetting>) {
    let key = "";
    if (obj.category === "system") {
      key = `system_${(obj.system_name || "").trim()}`;
    } else if (obj.category === "status") {
      key = `status_${(obj.status_key || "").trim()}`;
    } else if (obj.category === "language") {
      key = `lang_${(obj.language_in || "").trim()}_${(obj.language_out || "").trim()}`;
    }
    // sanitize: lowercase, spaces -> _, non-alphanum -> _
    return key
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/__+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  // validate form before save/insert
  function validateForm(obj: Partial<ColorSetting>) {
    if (!obj.category) return "Category is required.";
    if (!obj.color_value) return "Color is required.";
    if (obj.category === "system" && !obj.system_name) return "System name is required for system category.";
    if (obj.category === "status" && !obj.status_key) return "Status selection is required.";
    if (obj.category === "language" && (!obj.language_in || !obj.language_out)) return "Both language in and out are required.";
    return null;
  }

  // open add modal
  function openAdd() {
    setEditing(null);
    setForm({ category: "system", color_value: "#000000" });
    setModalOpen(true);
  }

  // open edit modal
  function openEdit(setting: ColorSetting) {
    setEditing(setting);
    setForm({ ...setting });
    setModalOpen(true);
  }

  // save (insert or update)
  async function handleSave() {
    const validationError = validateForm(form);
    if (validationError) {
      toast({ title: "Validation error", description: validationError, variant: "destructive" });
      return;
    }

    const setting_key = genSettingKey(form);
    if (!setting_key) {
      toast({ title: "Invalid key", description: "Failed to generate a valid setting key.", variant: "destructive" });
      return;
    }

    const payload: any = {
      setting_key,
      color_value: form.color_value,
      category: form.category,
      system_name: form.category === "system" ? form.system_name : null,
      status_key: form.category === "status" ? form.status_key : null,
      language_in: form.category === "language" ? form.language_in : null,
      language_out: form.category === "language" ? form.language_out : null,
      description: form.description ?? null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editing) {
        // update
        const { error } = await supabase.from("color_settings").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Color updated successfully." });
      } else {
        // insert
        const { error } = await supabase.from("color_settings").insert([payload]);
        if (error) {
          // Unique constraint (duplicate key)
          if ((error as any).code === "23505" || (error as any).message?.includes("duplicate key")) {
            toast({ title: "Already exists", description: "A setting with this key already exists.", variant: "destructive" });
            return;
          }
          throw error;
        }
        toast({ title: "Added", description: "New color setting added." });
      }

      setModalOpen(false);
      setEditing(null);
      setForm({ category: "system", color_value: "#000000" });
      await fetchSettings();
    } catch (err) {
      console.error("handleSave error:", err);
      toast({ title: "Error", description: "Failed to save color setting.", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    const ok = confirm("Are you sure you want to delete this color setting?");
    if (!ok) return;
    const { error } = await supabase.from("color_settings").delete().eq("id", id);
    if (error) {
      console.error("delete error:", error);
      toast({ title: "Error", description: "Failed to delete color setting.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Color setting deleted." });
      fetchSettings();
    }
  }

  // UI dynamic fields
  function renderDynamicFields() {
    const cat = form.category as Category;
    if (cat === "system") {
      return (
        <Input
          placeholder="System name (e.g. XTM)"
          value={form.system_name || ""}
          onChange={(e) => setForm((f) => ({ ...f, system_name: e.target.value }))}
        />
      );
    }
    if (cat === "status") {
      return (
        <Select
          value={form.status_key || ""}
          onValueChange={(val) => setForm((f) => ({ ...f, status_key: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    if (cat === "language") {
      return (
        <div className="flex gap-2">
          <Input
            placeholder="From (e.g. Eng)"
            value={form.language_in || ""}
            onChange={(e) => setForm((f) => ({ ...f, language_in: e.target.value }))}
          />
          <Input
            placeholder="To (e.g. Pt)"
            value={form.language_out || ""}
            onChange={(e) => setForm((f) => ({ ...f, language_out: e.target.value }))}
          />
        </div>
      );
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Restricted</h3>
        <p className="text-sm text-muted-foreground">Only administrators can change system colors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6" /> Color Customization
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure colors used across project tables</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd}>
                <PlusCircle className="w-4 h-4 mr-2" /> New Color
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Color" : "Add Color"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm({
                      category: val as Category,
                      color_value: form.color_value || "#000000",
                      system_name: "",
                      status_key: "",
                      language_in: "",
                      language_out: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                  </SelectContent>
                </Select>

                {renderDynamicFields()}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Color</p>
                  <Input
                    type="color"
                    value={form.color_value || "#000000"}
                    onChange={(e) => setForm((f) => ({ ...f, color_value: e.target.value }))}
                    className="w-16 h-10 p-1 rounded"
                  />
                </div>

                <div>
                  <Input
                    placeholder="Description to appear in tooltips (optional)"
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {editing ? "Save changes" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 space-y-2 bg-card">
            <div
              className="h-8 rounded flex items-center justify-center font-mono text-sm"
              style={{ backgroundColor: s.color_value }}
            >
              {s.setting_key}
            </div>

            <div className="text-xs text-muted-foreground">
              Category: {s.category.toUpperCase()}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs">
                {s.category === "system" && <div>System: {s.system_name}</div>}
                {s.category === "status" && <div>Status: {s.status_key}</div>}
                {s.category === "language" && (
                  <div>
                    Lang: {s.language_in} → {s.language_out}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(s)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
