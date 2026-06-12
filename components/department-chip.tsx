import { DEPT_CONFIG } from "@/lib/employees";

export function DepartmentChip({ name }: { name: string }) {
  const dept = DEPT_CONFIG[name];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10px] font-semibold"
      style={{
        backgroundColor: dept?.bg ?? "var(--surface)",
        color: dept?.color ?? "var(--muted)",
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dept?.color ?? "var(--muted)" }}
      />
      {name}
    </span>
  );
}
