"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";
import { type Company } from "@/lib/companies";

export type CompanyFormData = Omit<Company, "id">;

const COLOR_PRESETS: { label: string; color: string; bg: string }[] = [
  { label: "ม่วง",      color: "oklch(0.44 0.27 292)",  bg: "oklch(0.94 0.055 292)" },
  { label: "ฟ้า-เขียว", color: "oklch(0.42 0.14 195)",  bg: "oklch(0.93 0.04 195)"  },
  { label: "แดง",       color: "oklch(0.50 0.17 25)",   bg: "oklch(0.95 0.04 25)"   },
  { label: "เขียว",     color: "oklch(0.42 0.16 145)",  bg: "oklch(0.93 0.06 145)"  },
  { label: "ทอง",       color: "oklch(0.46 0.16 75)",   bg: "oklch(0.95 0.04 75)"   },
  { label: "ชมพู",      color: "oklch(0.50 0.18 350)",  bg: "oklch(0.95 0.04 350)"  },
  { label: "น้ำเงิน",   color: "oklch(0.44 0.20 250)",  bg: "oklch(0.94 0.04 250)"  },
  { label: "เทา",       color: "oklch(0.40 0.01 292)",  bg: "oklch(0.94 0.005 292)" },
];

const DEFAULT_COLOR = COLOR_PRESETS[0];

// ── Logo picker ────────────────────────────────────────────────

function LogoPicker({
  logoURL,
  initials,
  bg,
  color,
  uploading,
  onChange,
  onClear,
}: {
  logoURL?: string;
  initials: string;
  bg: string;
  color: string;
  uploading: boolean;
  onChange: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2 pb-1">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="อัปโหลดโลโก้บริษัท"
          className="relative h-20 w-20 overflow-hidden rounded-[20px] ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:ring-primary focus-visible:outline-none focus-visible:ring-primary"
        >
          {logoURL ? (
            <img src={logoURL} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-bold text-[22px]"
              style={{ backgroundColor: bg, color }}
            >
              {initials}
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm ring-2 ring-background">
              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.04l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </span>
          )}
        </button>

        {logoURL && !uploading && (
          <button
            type="button"
            onClick={onClear}
            aria-label="ลบโลโก้"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white shadow-sm ring-2 ring-background after:absolute after:content-[''] after:-inset-3"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted">
        {uploading ? "กำลังอัปโหลด…" : logoURL ? "แตะเพื่อเปลี่ยนโลโก้" : "อัปโหลดโลโก้บริษัท"}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Field helpers ──────────────────────────────────────────────

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
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>
        {children}
      </label>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────

export default function CompanyForm({
  defaultValues,
  companyId,
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
}: {
  defaultValues?: Partial<Company>;
  companyId?: string;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<CompanyFormData>({
    name:        defaultValues?.name        ?? "",
    shortName:   defaultValues?.shortName   ?? "",
    type:        defaultValues?.type        ?? "จำกัด",
    taxId:       defaultValues?.taxId       ?? "",
    address:     defaultValues?.address     ?? "",
    phone:       defaultValues?.phone       ?? "",
    email:       defaultValues?.email       ?? "",
    website:     defaultValues?.website     ?? "",
    founded:     defaultValues?.founded     ?? "",
    color:       defaultValues?.color       ?? DEFAULT_COLOR.color,
    bg:          defaultValues?.bg          ?? DEFAULT_COLOR.bg,
    logoURL:     defaultValues?.logoURL,
    departments: defaultValues?.departments ?? [],
  });
  const [uploading, setUploading] = useState(false);
  const [deptInput, setDeptInput] = useState("");

  function set<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogoChange(file: File) {
    setUploading(true);
    try {
      const path = companyId
        ? `companies/${companyId}/logo`
        : `companies/temp_${Date.now()}/logo`;
      const url = await uploadFile(file, path);
      set("logoURL", url);
    } catch (err) {
      console.error("Logo upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  const initials =
    form.shortName.replace(/[^A-Z]/g, "").slice(0, 2) ||
    form.shortName.slice(0, 2).toUpperCase() ||
    "บ";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-7">

      {/* Logo picker */}
      <LogoPicker
        logoURL={form.logoURL}
        initials={initials}
        bg={form.bg}
        color={form.color}
        uploading={uploading}
        onChange={handleLogoChange}
        onClear={() => set("logoURL", undefined)}
      />

      <FormSection label="ข้อมูลบริษัท">
        <Field label="ชื่อย่อ" required>
          <input
            className="field-input"
            value={form.shortName}
            onChange={(e) => set("shortName", e.target.value)}
            placeholder="UGI Manufacturing"
            autoFocus
            required
          />
        </Field>
        <Field label="ชื่อเต็ม" required>
          <input
            className="field-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="บริษัท UGI แมนูแฟคเจอริ่ง จำกัด"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ประเภทนิติบุคคล">
            <select
              className="field-input"
              value={form.type}
              onChange={(e) => set("type", e.target.value as Company["type"])}
            >
              <option value="จำกัด">จำกัด</option>
              <option value="มหาชน">มหาชน</option>
              <option value="จำกัด (มหาชน)">จำกัด (มหาชน)</option>
            </select>
          </Field>
          <Field label="ปีก่อตั้ง (พ.ศ.)">
            <input
              className="field-input"
              value={form.founded}
              onChange={(e) => set("founded", e.target.value)}
              placeholder="2556"
              maxLength={4}
            />
          </Field>
        </div>
        <Field label="เลขทะเบียนนิติบุคคล">
          <input
            className="field-input font-mono"
            value={form.taxId}
            onChange={(e) => set("taxId", e.target.value)}
            placeholder="0105556123456"
            maxLength={13}
          />
        </Field>
      </FormSection>

      <FormSection label="ช่องทางติดต่อ">
        <Field label="โทรศัพท์">
          <input
            type="tel"
            className="field-input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="02-200-3000"
          />
        </Field>
        <Field label="อีเมล">
          <input
            type="email"
            className="field-input"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="info@company.co.th"
          />
        </Field>
        <Field label="เว็บไซต์">
          <input
            className="field-input"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="www.ugi.co.th"
          />
        </Field>
        <Field label="ที่อยู่">
          <textarea
            className="field-input min-h-[72px] resize-none"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="เลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
            rows={3}
          />
        </Field>
      </FormSection>

      <FormSection label="แผนก">
        <div className="flex flex-wrap gap-2">
          {form.departments.map((dept) => (
            <span
              key={dept}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-ink"
            >
              {dept}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, departments: f.departments.filter((d) => d !== dept) }))}
                aria-label={`ลบ ${dept}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-error hover:text-white transition-colors"
              >
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="field-input flex-1"
            value={deptInput}
            onChange={(e) => setDeptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const d = deptInput.trim();
                if (d && !form.departments.includes(d)) {
                  setForm((f) => ({ ...f, departments: [...f.departments, d] }));
                }
                setDeptInput("");
              }
            }}
            placeholder="เช่น ฝ่ายผลิต, ฝ่ายวิศวกรรม"
          />
          <button
            type="button"
            onClick={() => {
              const d = deptInput.trim();
              if (d && !form.departments.includes(d)) {
                setForm((f) => ({ ...f, departments: [...f.departments, d] }));
              }
              setDeptInput("");
            }}
            className="rounded-[8px] border border-border bg-background px-3 py-2 text-[12px] font-medium text-ink hover:bg-surface active:scale-[0.98]"
          >
            เพิ่ม
          </button>
        </div>
      </FormSection>

      <FormSection label="สีบริษัท">
        <div className="grid grid-cols-8 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const active = form.color === preset.color;
            return (
              <button
                key={preset.color}
                type="button"
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={active}
                onClick={() => setForm((f) => ({ ...f, color: preset.color, bg: preset.bg }))}
                className="relative aspect-square rounded-[8px] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: preset.color }}
              >
                {active && (
                  <svg className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {/* Live preview */}
        <div
          className="mt-1 flex items-center gap-3 rounded-[10px] px-3 py-2.5"
          style={{ backgroundColor: form.bg }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-[11px] font-bold"
            style={form.logoURL ? { backgroundColor: form.bg } : { backgroundColor: form.color, color: "white" }}
          >
            {form.logoURL ? (
              <img src={form.logoURL} alt="" className="h-full w-full object-contain p-0.5" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-snug" style={{ color: form.color }}>
              {form.shortName || "ชื่อย่อบริษัท"}
            </p>
            <p className="truncate text-[11px] leading-snug" style={{ color: form.color, opacity: 0.65 }}>
              {form.name || "ชื่อเต็มบริษัท"}
            </p>
          </div>
        </div>
      </FormSection>

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
          disabled={uploading}
          className="flex-[2] rounded-[10px] bg-primary py-3 text-[13px] font-medium text-white transition-[background-color,opacity] hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
