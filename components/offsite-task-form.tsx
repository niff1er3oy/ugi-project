"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload";
import { type OffsiteTask } from "@/lib/offsite-tasks";

export type OffsiteTaskFormData = Omit<OffsiteTask, "id">;

const TASK_ICON_PATH = "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z";

// ── Icon picker ─────────────────────────────────────────────────
function IconPicker({
  photoURL, uploading, onChange, onClear,
}: {
  photoURL?: string;
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
          className="relative h-20 w-20 rounded-[18px] ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:ring-primary focus-visible:outline-none focus-visible:ring-primary"
          aria-label="เปลี่ยนรูปปกงาน"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="h-full w-full rounded-[18px] object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-primary-ghost">
              <svg className="h-8 w-8" fill="none" stroke="var(--primary)" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={TASK_ICON_PATH} />
              </svg>
            </div>
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-ink/60">
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
            aria-label="ลบรูปปก"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white shadow-sm ring-2 ring-background after:absolute after:content-[''] after:-inset-3"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted">{uploading ? "กำลังอัปโหลด…" : "แตะเพื่อเปลี่ยนรูปปก"}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Work photos picker ──────────────────────────────────────────
function WorkPhotoPicker({
  photos, uploadingIndex, onAdd, onRemove,
}: {
  photos: string[];
  uploadingIndex: number | null;
  onAdd: (file: File) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-[8px] bg-surface">
            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white shadow-sm"
              aria-label="ลบรูป"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {uploadingIndex !== null && (
          <div className="flex aspect-square items-center justify-center rounded-[8px] bg-surface">
            <svg className="h-5 w-5 animate-spin text-muted" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {photos.length < 5 && uploadingIndex === null && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-border text-muted transition-colors hover:border-primary hover:text-primary-text"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[10px] font-medium">{photos.length}/5</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }} />
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
      <label className="block text-[12px] font-medium text-ink">
        <span className="mb-1.5 block">
          {label}{required && <span className="ml-0.5 text-error">*</span>}
        </span>
        {children}
      </label>
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────
export default function OffsiteTaskForm({
  defaultValues,
  taskId,
  departments = [],
  onSubmit,
  onCancel,
  submitLabel = "บันทึก",
}: {
  defaultValues?: Partial<OffsiteTask>;
  taskId?: string;
  departments?: string[];
  onSubmit: (data: OffsiteTaskFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<OffsiteTaskFormData>({
    title:      defaultValues?.title      ?? "",
    type:       defaultValues?.type       ?? "",
    startDate:  defaultValues?.startDate  ?? "",
    startTime:  defaultValues?.startTime  ?? "",
    endDate:    defaultValues?.endDate,
    endTime:    defaultValues?.endTime,
    department: defaultValues?.department ?? departments[0] ?? "",
    location:   defaultValues?.location   ?? "",
    note:       defaultValues?.note       ?? "",
    workPhotos: defaultValues?.workPhotos ?? [],
    photoURL:   defaultValues?.photoURL,
  });

  const [iconUploading, setIconUploading] = useState(false);
  const [photoUploadingIdx, setPhotoUploadingIdx] = useState<number | null>(null);

  const uploading = iconUploading || photoUploadingIdx !== null;

  function set<K extends keyof OffsiteTaskFormData>(key: K, value: OffsiteTaskFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleIconChange(file: File) {
    setIconUploading(true);
    try {
      const path = taskId
        ? `offsite/tasks/${taskId}/icon`
        : `offsite/tasks/temp_${Date.now()}/icon`;
      const url = await uploadFile(file, path);
      set("photoURL", url);
    } catch (err) {
      console.error("Icon upload failed:", err);
    } finally {
      setIconUploading(false);
    }
  }

  async function handlePhotoAdd(file: File) {
    const idx = (form.workPhotos ?? []).length;
    setPhotoUploadingIdx(idx);
    try {
      const path = taskId
        ? `offsite/tasks/${taskId}/photos/${Date.now()}`
        : `offsite/tasks/temp_${Date.now()}/photos/${idx}`;
      const url = await uploadFile(file, path);
      setForm((f) => ({ ...f, workPhotos: [...(f.workPhotos ?? []), url] }));
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setPhotoUploadingIdx(null);
    }
  }

  function handlePhotoRemove(i: number) {
    setForm((f) => ({ ...f, workPhotos: (f.workPhotos ?? []).filter((_, idx) => idx !== i) }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-7">

      {/* Icon picker */}
      <IconPicker
        photoURL={form.photoURL}
        uploading={iconUploading}
        onChange={handleIconChange}
        onClear={() => set("photoURL", undefined)}
      />

      {/* ข้อมูลงาน */}
      <FormSection label="ข้อมูลงาน">
        <Field label="ชื่องาน" required>
          <input
            className="field-input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="เช่น ซ่อมท่อน้ำอาคาร A"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ประเภทงาน">
            <input
              className="field-input"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              placeholder="เช่น ซ่อมบำรุง, ติดตั้ง..."
            />
          </Field>
          <Field label="ทีม">
            {departments.length === 0 ? (
              <div className="field-input text-muted">ยังไม่มีทีมในระบบ — เพิ่มทีมในหน้าบริษัทก่อน</div>
            ) : (
              <select className="field-input" value={form.department}
                onChange={(e) => set("department", e.target.value)}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </Field>
        </div>
        <Field label="สถานที่">
          <input
            className="field-input"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="เช่น อาคาร A ชั้น 3"
          />
        </Field>
      </FormSection>

      {/* วันเวลา */}
      <FormSection label="วันเวลา">
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันที่เริ่ม" required>
            <input
              className="field-input"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              placeholder="12 มิ.ย. 2568"
              required
            />
          </Field>
          <Field label="เวลาเริ่ม" required>
            <input
              className="field-input"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              placeholder="09:00"
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันที่สิ้นสุด">
            <input
              className="field-input"
              value={form.endDate ?? ""}
              onChange={(e) => set("endDate", e.target.value || undefined)}
              placeholder="12 มิ.ย. 2568"
            />
          </Field>
          <Field label="เวลาสิ้นสุด">
            <input
              className="field-input"
              value={form.endTime ?? ""}
              onChange={(e) => set("endTime", e.target.value || undefined)}
              placeholder="11:30"
            />
          </Field>
        </div>
      </FormSection>

      {/* รายละเอียดงาน */}
      <div>
        <label htmlFor="task-note" className="mb-3 block text-[12px] font-semibold text-muted">รายละเอียดงาน</label>
        <textarea
          id="task-note"
          className="field-input min-h-[80px] resize-none"
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value || undefined)}
          placeholder="อธิบายรายละเอียดงาน หมายเหตุ หรือสิ่งที่พบ..."
          rows={3}
        />
      </div>

      {/* รูปภาพการปฏิบัติงาน */}
      <FormSection label="รูปภาพการปฏิบัติงาน">
        <WorkPhotoPicker
          photos={form.workPhotos ?? []}
          uploadingIndex={photoUploadingIdx}
          onAdd={handlePhotoAdd}
          onRemove={handlePhotoRemove}
        />
        <p className="text-[11px] text-muted">เพิ่มได้สูงสุด 5 รูป</p>
      </FormSection>

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
          disabled={uploading}
          className="flex-[2] rounded-[10px] bg-primary py-3 text-[13px] font-medium text-white transition-colors hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
