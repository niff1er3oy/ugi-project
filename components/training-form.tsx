"use client";

import { useState, useEffect } from "react";
import { fetchEmployees, DEPT_CONFIG, type Employee } from "@/lib/employees";
import { fetchCompanies, type Company } from "@/lib/companies";
import {
  CATEGORIES,
  type TrainingCategory, type TrainingRecord,
} from "@/lib/training";

export type TrainingFormData = Omit<TrainingRecord, "id">;

// ── Field helpers ───────────────────────────────────────────────
function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold text-muted">{label}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-ink">
        <span className="mb-1.5 block">
          {label}{required && <span className="ml-0.5 text-error">*</span>}
        </span>
        {children}
      </label>
    </div>
  );
}

// ── Participant picker ──────────────────────────────────────────
function ParticipantPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchEmployees().then(setEmployees);
  }, []);

  const filtered = employees.filter((emp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${emp.firstName} ${emp.lastName} ${emp.department}`.toLowerCase().includes(q);
  });

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const selectedEmps = employees.filter((e) => selected.includes(e.id));

  return (
    <div>
      {/* Selected tags */}
      {selectedEmps.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedEmps.map((emp) => {
            const dept = DEPT_CONFIG[emp.department];
            return (
              <span
                key={emp.id}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: dept?.bg ?? "var(--surface)", color: dept?.color ?? "var(--muted)" }}
              >
                {emp.firstName} {emp.lastName}
                <button
                  type="button"
                  onClick={() => toggle(emp.id)}
                  aria-label={`ลบ ${emp.firstName}`}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-[8px] border border-border px-3 py-2.5 text-[12px] text-muted transition-colors hover:bg-surface"
      >
        <span>
          {expanded ? "ซ่อนรายชื่อ" : selected.length > 0 ? `เพิ่ม/แก้ไข (${selected.length} คน)` : "เพิ่มผู้เข้าร่วม"}
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-1.5 overflow-hidden rounded-[8px] border border-border">
          {/* Search */}
          <div className="border-b border-border p-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาพนักงาน..."
              className="field-input py-2 text-[12px]"
            />
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[12px] text-muted text-center">
                {employees.length === 0 ? "กำลังโหลด..." : "ไม่พบพนักงาน"}
              </p>
            ) : (
              filtered.map((emp) => {
                const dept = DEPT_CONFIG[emp.department];
                const checked = selected.includes(emp.id);
                return (
                  <label
                    key={emp.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(emp.id)}
                      className="h-4 w-4 shrink-0 accent-primary rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-[11px] text-muted">{emp.department}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: dept?.bg ?? "var(--surface)", color: dept?.color ?? "var(--muted)" }}
                    >
                      {emp.department}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────
export default function TrainingForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
}: {
  defaultValues?: Partial<TrainingRecord>;
  onSubmit: (data: TrainingFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<TrainingFormData>({
    title:        defaultValues?.title        ?? "",
    category:     defaultValues?.category     ?? "ความปลอดภัย",
    date:         defaultValues?.date         ?? "",
    endDate:      defaultValues?.endDate,
    hours:        defaultValues?.hours        ?? 0,
    location:     defaultValues?.location     ?? "",
    company:      defaultValues?.company      ?? "",
    department:   defaultValues?.department,
    participants: defaultValues?.participants ?? [],
    note:         defaultValues?.note,
  });

  useEffect(() => {
    fetchCompanies().then((cos) => {
      setCompanies(cos);
      if (!defaultValues?.company && cos.length > 0) {
        setForm((f) => ({ ...f, company: f.company || cos[0].name }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof TrainingFormData>(key: K, value: TrainingFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const currentCompany = companies.find((c) => c.name === form.company);
  const depts = currentCompany?.departments ?? [];

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-7">

      {/* ข้อมูลหลักสูตร */}
      <FormSection label="ข้อมูลหลักสูตร">
        <Field label="ชื่อหลักสูตร" required>
          <input
            className="field-input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="เช่น การปฐมพยาบาลเบื้องต้น"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ประเภทการอบรม">
            <select
              className="field-input"
              value={form.category}
              onChange={(e) => set("category", e.target.value as TrainingCategory)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="จำนวนชั่วโมง" required>
            <input
              type="number"
              min={0}
              className="field-input"
              value={form.hours || ""}
              onChange={(e) => set("hours", Number(e.target.value))}
              placeholder="6"
              required
            />
          </Field>
        </div>
      </FormSection>

      {/* วันที่ */}
      <FormSection label="วันที่">
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันที่อบรม" required>
            <input
              className="field-input"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="15 มิ.ย. 2568"
              required
            />
          </Field>
          <Field label="วันที่สิ้นสุด">
            <input
              className="field-input"
              value={form.endDate ?? ""}
              onChange={(e) => set("endDate", e.target.value || undefined)}
              placeholder="16 มิ.ย. 2568"
            />
          </Field>
        </div>
      </FormSection>

      {/* สถานที่ */}
      <FormSection label="สถานที่">
        <Field label="สถานที่">
          <input
            className="field-input"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="เช่น ห้องประชุม A, โรงแรม XYZ"
          />
        </Field>
      </FormSection>

      {/* หน่วยงาน */}
      <FormSection label="หน่วยงาน">
        <Field label="บริษัท" required>
          <select
            className="field-input"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          >
            {form.company && !companies.find((c) => c.name === form.company) && (
              <option value={form.company}>{form.company}</option>
            )}
            {companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>
        {depts.length > 0 && (
          <Field label="ทีม">
            <select
              className="field-input"
              value={form.department ?? ""}
              onChange={(e) => set("department", e.target.value || undefined)}
            >
              <option value="">— ทุกทีม —</option>
              {depts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        )}
      </FormSection>

      {/* ผู้เข้าร่วม */}
      <FormSection label={`ผู้เข้าร่วม${form.participants.length > 0 ? ` (${form.participants.length} คน)` : ""}`}>
        <ParticipantPicker
          selected={form.participants}
          onChange={(ids) => set("participants", ids)}
        />
      </FormSection>

      {/* หมายเหตุ */}
      <div>
        <label htmlFor="training-note" className="mb-3 block text-[12px] font-semibold text-muted">หมายเหตุ</label>
        <textarea
          id="training-note"
          className="field-input min-h-[80px] resize-none"
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value || undefined)}
          placeholder="รายละเอียดเพิ่มเติม เนื้อหาหลักสูตร หรือสิ่งที่ควรทราบ..."
          rows={3}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[10px] border border-border bg-background py-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98]"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="flex-[2] rounded-[10px] bg-primary py-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
