"use client";

import { useState } from "react";

export type TeamEntry = {
  id: string;
  name: string;
  color: string;
  bg: string;
  count: number;
};

const COLOR_PRESETS = [
  { label: "ม่วง",      color: "oklch(0.44 0.27 292)",  bg: "oklch(0.94 0.055 292)" },
  { label: "ฟ้า-เขียว", color: "oklch(0.42 0.14 195)",  bg: "oklch(0.93 0.04 195)"  },
  { label: "แดง",       color: "oklch(0.50 0.17 25)",   bg: "oklch(0.95 0.04 25)"   },
  { label: "เขียว",     color: "oklch(0.42 0.16 145)",  bg: "oklch(0.93 0.06 145)"  },
  { label: "ทอง",       color: "oklch(0.46 0.16 75)",   bg: "oklch(0.95 0.04 75)"   },
  { label: "ชมพู",      color: "oklch(0.50 0.18 350)",  bg: "oklch(0.95 0.04 350)"  },
  { label: "น้ำเงิน",   color: "oklch(0.44 0.20 250)",  bg: "oklch(0.94 0.04 250)"  },
  { label: "เทา",       color: "oklch(0.40 0.01 292)",  bg: "oklch(0.94 0.005 292)" },
];

type FormState = { name: string; color: string; bg: string };
const EMPTY_FORM: FormState = {
  name: "",
  color: COLOR_PRESETS[0].color,
  bg: COLOR_PRESETS[0].bg,
};

// ── Inline form ────────────────────────────────────────────────

function TeamInlineForm({
  form,
  onChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-2.5 bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="text"
          placeholder="ชื่อทีม"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); onSave(); }
            if (e.key === "Escape") { e.preventDefault(); onCancel(); }
          }}
          className="field-input flex-1 text-[13px]"
        />
        <button
          onClick={onSave}
          disabled={!form.name.trim()}
          aria-label={saveLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary text-white transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </button>
        <button
          onClick={onCancel}
          aria-label="ยกเลิก"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-ink active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Color swatches */}
      <div className="flex gap-1.5">
        {COLOR_PRESETS.map((preset) => {
          const active = form.color === preset.color;
          return (
            <button
              key={preset.color}
              type="button"
              title={preset.label}
              aria-label={preset.label}
              aria-pressed={active}
              onClick={() => onChange({ ...form, color: preset.color, bg: preset.bg })}
              className="relative h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ backgroundColor: preset.color }}
            >
              {active && (
                <svg className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── TeamManager ────────────────────────────────────────────────

export default function TeamManager({ teams: initial, onUpdate }: { teams: TeamEntry[]; onUpdate?: (names: string[]) => void }) {
  const [teams, setTeams] = useState<TeamEntry[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function startEdit(team: TeamEntry) {
    setAdding(false);
    setConfirmDeleteId(null);
    setEditForm({ name: team.name, color: team.color, bg: team.bg });
    setEditingId(team.id);
  }

  function saveEdit() {
    if (!editForm.name.trim()) return;
    const newTeams = teams.map((t) =>
      t.id === editingId
        ? { ...t, name: editForm.name.trim(), color: editForm.color, bg: editForm.bg }
        : t,
    );
    setTeams(newTeams);
    onUpdate?.(newTeams.map((t) => t.name));
    setEditingId(null);
  }

  function startAdd() {
    setEditingId(null);
    setConfirmDeleteId(null);
    setAddForm(EMPTY_FORM);
    setAdding(true);
  }

  function saveAdd() {
    if (!addForm.name.trim()) return;
    const newTeams = [...teams, { id: crypto.randomUUID(), name: addForm.name.trim(), color: addForm.color, bg: addForm.bg, count: 0 }];
    setTeams(newTeams);
    onUpdate?.(newTeams.map((t) => t.name));
    setAdding(false);
    setAddForm(EMPTY_FORM);
  }

  function requestDelete(id: string) {
    setEditingId(null);
    setAdding(false);
    setConfirmDeleteId(id);
  }

  function commitDelete() {
    const newTeams = teams.filter((t) => t.id !== confirmDeleteId);
    setTeams(newTeams);
    onUpdate?.(newTeams.map((t) => t.name));
    setConfirmDeleteId(null);
  }

  return (
    <div className="animate-enter">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[13px] font-medium text-muted">ทีมในบริษัท</p>
        <button
          onClick={startAdd}
          className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] font-medium text-primary-text transition-colors hover:bg-primary-ghost active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มทีม
        </button>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-background divide-y divide-border">
        {/* Empty state */}
        {teams.length === 0 && !adding && (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-muted">ยังไม่มีทีมในบริษัทนี้</p>
          </div>
        )}

        {teams.map((team) => {
          /* ── Edit form row ── */
          if (editingId === team.id) {
            return (
              <TeamInlineForm
                key={team.id}
                form={editForm}
                onChange={setEditForm}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
                saveLabel="บันทึก"
              />
            );
          }

          /* ── Delete confirm row ── */
          if (confirmDeleteId === team.id) {
            return (
              <div key={team.id} className="flex items-center gap-3 bg-surface px-4 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
                <span className="flex-1 truncate text-[13px] text-ink">{team.name}</span>
                <span className="shrink-0 text-[12px] font-medium text-error">ลบทีมนี้?</span>
                <button
                  onClick={commitDelete}
                  className="shrink-0 rounded-[6px] bg-error px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity hover:opacity-80 active:scale-95"
                >
                  ลบ
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="shrink-0 rounded-[6px] border border-border px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:bg-background active:scale-95"
                >
                  ยกเลิก
                </button>
              </div>
            );
          }

          /* ── Normal row ── */
          return (
            <div key={team.id} className="group flex items-center gap-3 px-4 py-3">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
              <span className="flex-1 text-[13px] text-ink">{team.name}</span>
              {team.count > 0 ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: team.bg, color: team.color }}
                >
                  {team.count} คน
                </span>
              ) : (
                <span className="shrink-0 text-[11px] text-muted">0 คน</span>
              )}
              <button
                onClick={() => startEdit(team)}
                aria-label={`แก้ไข ${team.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted opacity-100 transition-colors hover:bg-surface hover:text-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                onClick={() => requestDelete(team.id)}
                aria-label={`ลบ ${team.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted opacity-100 transition-colors hover:bg-surface hover:text-error focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add form row */}
        {adding && (
          <TeamInlineForm
            form={addForm}
            onChange={setAddForm}
            onSave={saveAdd}
            onCancel={() => setAdding(false)}
            saveLabel="เพิ่มทีม"
          />
        )}
      </div>
    </div>
  );
}
