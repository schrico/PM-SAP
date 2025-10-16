"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSetting } from "../ColorSettings";

interface Props {
  setting: ColorSetting;
  onEdit: (s: ColorSetting) => void;
  onDelete: (id: number) => void;
}

export function ColorCard({ setting, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-card">
      <div
        className="h-8 rounded flex items-center justify-center font-mono text-sm text-white shadow-sm"
        style={{ backgroundColor: setting.color_value }}
      >
        {setting.setting_key}
      </div>

      <div className="text-xs text-muted-foreground">
        Category: {setting.category.toUpperCase()}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs">
          {setting.category === "system" && <div>System: {setting.system_name}</div>}
          {setting.category === "status" && <div>Status: {setting.status_key}</div>}
          {setting.category === "language" && (
            <div>
              Lang: {setting.language_in} → {setting.language_out}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(setting)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(setting.id)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
