import { Tag } from "antd";

export function SurfaceTag({ label }: { label: string }) {
  return (
    <Tag data-register-surface={label} style={{ marginInlineEnd: 0 }}>
      {label}
    </Tag>
  );
}

export function StatusTag({
  label,
  color,
}: {
  label: string;
  color?: "success" | "warning" | "error" | "processing" | "default";
}) {
  return <Tag color={color ?? "default"}>{label}</Tag>;
}

export function chipTone(health: string): "success" | "warning" | "error" | "default" {
  if (health === "Healthy" || health === "released" || health === "complete") return "success";
  if (health === "Watch" || health === "release_pending_window" || health === "held") return "warning";
  if (health === "At risk" || health === "disputed") return "error";
  return "default";
}
