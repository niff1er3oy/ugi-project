import { ReactNode } from "react";

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="animate-enter">
      <p className="mb-2 px-1 text-[13px] font-medium text-muted">{label}</p>
      <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

export function InfoRow({
  label,
  value,
  labelWidth = "w-28",
}: {
  label: string;
  value: ReactNode;
  labelWidth?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className={`${labelWidth} shrink-0 text-[12px] text-muted`}>{label}</span>
      <span className="text-right text-[13px] text-ink">{value}</span>
    </div>
  );
}
