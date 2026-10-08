"use client";

import { useRef, useState } from "react";
import { Piano } from "@/components/piano";
import {
  INSTRUMENTS,
  useChordPlayer,
  type InstrumentId,
  type PlayMode,
} from "@/lib/player";
import {
  FAMILIES,
  QUALITIES,
  ROOTS,
  chordSymbol,
  keyboardBounds,
  pretty,
  voiceChord,
  type FamilyId,
  type Quality,
  type RootId,
} from "@/lib/theory";

const OCTAVES = [
  { value: 3, label: "Low" },
  { value: 4, label: "Mid" },
  { value: 5, label: "High" },
] as const;

export function ChordApp() {
  const { play, status, error, activeInstrument } = useChordPlayer();
  const [root, setRoot] = useState<RootId>("C");
  const [octave, setOctave] = useState<3 | 4 | 5>(4);
  const [inversion, setInversion] = useState(0);
  const [mode, setMode] = useState<PlayMode>("chord");
  const [instrument, setInstrument] = useState<InstrumentId>("piano");
  const [family, setFamily] = useState<FamilyId | "all">("all");
  const [qualityId, setQualityId] = useState<string | null>(null);
  const [lit, setLit] = useState<{ midi: number; label: string }[]>([]);
  const timers = useRef<number[]>([]);

  const quality = QUALITIES.find((item) => item.id === qualityId) ?? null;
  const familyMeta = FAMILIES.find((item) => item.id === (quality?.family ?? "bright")) ?? FAMILIES[0];
  const accent = quality ? familyMeta.accent : "#e6b15a";
  const voicing = quality ? voiceChord(root, quality, octave, inversion) : null;
  const soundedInversion = quality ? Math.min(inversion, quality.steps.length - 1) : 0;
  const bounds = keyboardBounds(voicing?.midis ?? []);
  const visibleFamilies = FAMILIES.filter((item) => family === "all" || item.id === family);

  function lightNotes(notes: string[], midis: number[], nextMode: PlayMode) {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const marks = notes.map((note, index) => ({
      midi: midis[index],
      label: note.replace(/-?\d+$/, ""),
    }));
    if (nextMode === "chord") {
      setLit(marks);
      return;
    }
    setLit([]);
    marks.forEach((mark, index) => {
      const id = window.setTimeout(() => {
        setLit(marks.slice(0, index + 1));
      }, index * 340);
      timers.current.push(id);
    });
  }

  function sound(
    nextQuality: Quality,
    nextRoot = root,
    nextOctave = octave,
    nextInversion = inversion,
    nextMode = mode,
    nextInstrument = instrument,
  ) {
    const next = voiceChord(nextRoot, nextQuality, nextOctave, nextInversion);
    setQualityId(nextQuality.id);
    lightNotes(next.notes, next.midis, nextMode);
    void play(next.notes, nextMode, nextInstrument);
  }

  const loadingLabel = INSTRUMENTS.find((item) => item.id === (activeInstrument ?? instrument))?.label;

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3">
          <div>
            <h1 className="font-serif text-3xl leading-none tracking-tight">Chords</h1>
            <p className="mt-1 text-sm text-muted">Tap one and hear the color.</p>
          </div>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" role="group" aria-label="Root note">
            {ROOTS.map((item) => {
              const selected = item.id === root;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setRoot(item.id);
                    if (quality) sound(quality, item.id);
                  }}
                  className="touch-manipulation h-11 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: selected ? "#f3ecdf" : "transparent",
                    color: selected ? "#1a140c" : "#f3ecdf",
                    boxShadow: selected ? "none" : "inset 0 0 0 1px rgba(243,236,223,0.16)",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Chord colors">
            <FilterChip
              label="All colors"
              selected={family === "all"}
              accent="#f3ecdf"
              onClick={() => setFamily("all")}
            />
            {FAMILIES.map((item) => (
              <FilterChip
                key={item.id}
                label={item.name}
                selected={family === item.id}
                accent={item.accent}
                onClick={() => setFamily(item.id)}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-5 pb-88">
        {visibleFamilies.map((item) => {
          const chords = QUALITIES.filter((qualityItem) => qualityItem.family === item.id);
          return (
            <section key={item.id} aria-labelledby={`color-${item.id}`}>
              <div className="mb-3">
                <h2 id={`color-${item.id}`} className="flex items-center gap-2 text-lg font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.accent }} />
                  {item.name}
                </h2>
                <p className="mt-0.5 text-sm text-muted">{item.mood}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {chords.map((qualityItem) => {
                  const selected = qualityItem.id === qualityId;
                  const symbol = chordSymbol(root, qualityItem);
                  const preview = voiceChord(root, qualityItem, octave, 0);
                  return (
                    <button
                      key={qualityItem.id}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`Play ${symbol}, ${qualityItem.label}`}
                      onClick={() => sound(qualityItem)}
                      className="touch-manipulation flex min-h-24 flex-col items-start rounded-2xl px-3 py-3 text-left transition-transform active:scale-[0.98]"
                      style={{
                        background: selected
                          ? `color-mix(in srgb, ${item.accent} 34%, #1c1915)`
                          : `color-mix(in srgb, ${item.accent} 12%, #1c1915)`,
                        boxShadow: selected
                          ? `inset 0 0 0 1.5px ${item.accent}`
                          : `inset 3px 0 0 ${item.accent}, inset 0 0 0 1px rgba(243,236,223,0.06)`,
                      }}
                    >
                      <span className="font-serif text-[1.65rem] leading-none tracking-tight">{symbol}</span>
                      <span className="mt-1 text-xs text-muted">{qualityItem.label}</span>
                      <span className="mt-auto pt-3 text-[11px] tracking-wide text-ink/80">
                        {preview.pitchClasses.map((pc) => pretty(pc)).join("  ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[#1a1714]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-serif text-3xl leading-none" aria-live="polite">
                {quality ? chordSymbol(root, quality) : "—"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {status === "loading"
                  ? `Loading ${loadingLabel?.toLowerCase()}…`
                  : status === "error"
                    ? error
                    : quality
                      ? `${quality.label} · ${familyMeta.name}`
                      : "Pick a chord above"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => quality && sound(quality)}
              disabled={!quality}
              className="touch-manipulation shrink-0 rounded-full px-3 py-2 text-sm font-semibold disabled:opacity-40"
              style={{ background: accent, color: "#1a140c" }}
            >
              Again
            </button>
          </div>

          {voicing && (
            <p className="text-sm tracking-wide">
              {voicing.notes.map((note) => pretty(note)).join("   ")}
            </p>
          )}

          <Piano
            low={bounds.low}
            high={bounds.high}
            active={lit}
            accent={accent}
          />

          {quality && voicing && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Bass note">
              <span className="mr-1 text-[11px] uppercase tracking-wider text-muted">Bass</span>
              {voicing.pitchClasses.map((pc, index) => {
                const selected = index === soundedInversion;
                return (
                  <button
                    key={`${pc}-${index}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setInversion(index);
                      sound(quality, root, octave, index);
                    }}
                    className="touch-manipulation h-8 min-w-8 rounded-full px-2 text-sm font-semibold"
                    style={{
                      background: selected ? accent : "transparent",
                      color: selected ? "#1a140c" : "#f3ecdf",
                      boxShadow: selected ? "none" : "inset 0 0 0 1px rgba(243,236,223,0.16)",
                    }}
                  >
                    {pretty(pc)}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Segmented
                fill
                label="How it plays"
                value={mode}
                options={[
                  { value: "chord", label: "Chord" },
                  { value: "notes", label: "Notes" },
                ]}
                onChange={(next) => {
                  setMode(next);
                  if (quality) sound(quality, root, octave, inversion, next);
                }}
              />
              <Segmented
                fill
                label="Octave"
                value={String(octave)}
                options={OCTAVES.map((item) => ({ value: String(item.value), label: item.label }))}
                onChange={(next) => {
                  const value = Number(next) as 3 | 4 | 5;
                  setOctave(value);
                  if (quality) sound(quality, root, value, inversion, mode);
                }}
              />
            </div>
            <Segmented
              fill
              label="Instrument"
              value={instrument}
              options={INSTRUMENTS.map((item) => ({ value: item.id, label: item.label }))}
              onChange={(next) => {
                setInstrument(next);
                if (quality) sound(quality, root, octave, inversion, mode, next);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  selected,
  accent,
  onClick,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="touch-manipulation shrink-0 rounded-full px-3 py-1.5 text-sm font-medium"
      style={{
        background: selected ? accent : "transparent",
        color: selected ? "#1a140c" : accent,
        boxShadow: `inset 0 0 0 1px ${accent}`,
      }}
    >
      {label}
    </button>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  fill = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  fill?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className={`flex rounded-full bg-white/5 p-0.5 ${fill ? "w-full" : ""}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`touch-manipulation rounded-full px-2.5 py-1.5 text-xs font-semibold ${fill ? "flex-1" : ""}`}
            style={{
              background: selected ? "#f3ecdf" : "transparent",
              color: selected ? "#1a140c" : "#a89b8c",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
