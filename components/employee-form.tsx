"use client";

import { useRef, useState, useEffect } from "react";
import { uploadFile } from "@/lib/upload";
import { DEPT_CONFIG, STATUS_CONFIG, type Employee, type EmpStatus } from "@/lib/employees";
import { fetchCompanies, type Company } from "@/lib/companies";

export type EmployeeFormData = Omit<Employee, "id">;

// ── Avatar picker ───────────────────────────────────────────────
function AvatarPicker({
  photoURL,
  initials,
  bg,
  color,
  uploading,
  onChange,
  onClear,
}: {
  photoURL?: string;
  initials: string;
  bg: string;
  color: string;
  uploading: boolean;
  onChange: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2 pb-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative h-20 w-20 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:ring-primary focus-visible:outline-none focus-visible:ring-primary"
          aria-label="เปลี่ยนรูปโปรไฟล์"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-full font-bold text-[22px]"
              style={{ backgroundColor: bg, color }}
            >
              {initials}
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm ring-2 ring-background">
              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.04l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </span>
          )}
        </button>

        {photoURL && !uploading && (
          <button
            type="button"
            onClick={onClear}
            aria-label="ลบรูปโปรไฟล์"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white shadow-sm ring-2 ring-background"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted">{uploading ? "กำลังอัปโหลด…" : "แตะเพื่อเปลี่ยนรูป"}</p>

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
      <label className="mb-1.5 block text-[12px] font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────
export default function EmployeeForm({
  defaultValues,
  empId,
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
}: {
  defaultValues?: Partial<Employee>;
  empId?: string;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<EmployeeFormData>({
    firstName:  defaultValues?.firstName  ?? "",
    lastName:   defaultValues?.lastName   ?? "",
    company:    defaultValues?.company    ?? "",
    department: defaultValues?.department ?? "",
    position:   defaultValues?.position   ?? "",
    status:     defaultValues?.status     ?? "active",
    phone:      defaultValues?.phone      ?? "",
    email:      defaultValues?.email      ?? "",
    startDate:  defaultValues?.startDate  ?? "",
    photoURL:   defaultValues?.photoURL,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCompanies().then((cos) => {
      setCompanies(cos);
      if (!defaultValues?.company && cos.length > 0) {
        setForm((f) => ({
          ...f,
          company:    f.company    || cos[0].name,
          department: f.department || cos[0].departments[0] || "",
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof EmployeeFormData>(key: K, value: EmployeeFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAvatarChange(file: File) {
    setUploading(true);
    try {
      const path = empId
        ? `employees/${empId}/avatar`
        : `employees/temp_${Date.now()}/avatar`;
      const url = await uploadFile(file, path);
      set("photoURL", url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  const currentCompany = companies.find((c) => c.name === form.company);
  const availableDepts = currentCompany?.departments ?? [];
  const dept = DEPT_CONFIG[form.department];
  const initials = (form.firstName.charAt(0) || "?") + (form.lastName.charAt(0) || "");

  function handleCompanyChange(company: string) {
    const co = companies.find((c) => c.name === company);
    const depts = co?.departments ?? [];
    setForm((f) => ({
      ...f,
      company,
      department: depts.includes(f.department) ? f.department : (depts[0] ?? ""),
    }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-7"
    >
      {/* Avatar */}
      <AvatarPicker
        photoURL={form.photoURL}
        initials={initials}
        bg={dept?.bg ?? "var(--surface)"}
        color={dept?.color ?? "var(--muted)"}
        uploading={uploading}
        onChange={handleAvatarChange}
        onClear={() => set("photoURL", undefined)}
      />

      <FormSection label="ข้อมูลส่วนตัว">
        <div className="grid grid-cols-2 gap-3">
          <Field label="ชื่อ" required>
            <input
              className="field-input"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="สมชาย"
              required
            />
          </Field>
          <Field label="นามสกุล" required>
            <input
              className="field-input"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="กิจจา"
              required
            />
          </Field>
        </div>
        <Field label="บริษัท">
          <select
            className="field-input"
            value={form.company}
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            {form.company && !companies.find((c) => c.name === form.company) && (
              <option value={form.company}>{form.company}</option>
            )}
            {companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ทีม">
            <select
              className="field-input"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              {form.department && !availableDepts.includes(form.department) && (
                <option value={form.department}>{form.department}</option>
              )}
              {availableDepts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="ตำแหน่ง" required>
            <input
              className="field-input"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              placeholder="ผู้จัดการ"
              required
            />
          </Field>
        </div>
        <Field label="วันที่เริ่มงาน">
          <input
            className="field-input"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            placeholder="1 ม.ค. 2560"
          />
        </Field>
      </FormSection>

      <FormSection label="สถานะ">
        <div className="flex gap-2">
          {(Object.entries(STATUS_CONFIG) as [EmpStatus, (typeof STATUS_CONFIG)[EmpStatus]][]).map(([value, cfg]) => {
            const active = form.status === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => set("status", value)}
                aria-pressed={active}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border py-2.5 text-[12px] font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary/5 text-primary-text"
                    : "border-border text-muted hover:border-border-strong hover:text-ink"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection label="ช่องทางติดต่อ">
        <Field label="เบอร์โทรศัพท์">
          <input
            type="tel"
            className="field-input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="081-234-5678"
          />
        </Field>
        <Field label="อีเมล">
          <input
            type="email"
            className="field-input"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@ugi.co.th"
          />
        </Field>
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
          className="flex-[2] rounded-[10px] bg-primary py-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
