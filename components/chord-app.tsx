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
  GROUND_IDS,
  COMMON_IDS,
  QUALITIES,
  ROOTS,
  chordSymbol,
  keyboardBounds,
  noteToMidi,
  pretty,
  rootLabel,
  spell,
  voiceChord,
  type Quality,
  type RootId,
} from "@/lib/theory";

const GROUND = new Set<string>(GROUND_IDS);

function groundPitch(root: RootId, octave: number) {
  const note = `${spell(root, 1, 0).pc}${octave}`;
  return { note, midi: noteToMidi(note) };
}

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
  const [qualityId, setQualityId] = useState<string | null>(null);
  const [hearingRoot, setHearingRoot] = useState(false);
  const [lit, setLit] = useState<{ midi: number; label: string }[]>([]);
  const timers = useRef<number[]>([]);
  const colorsScroller = useRef<HTMLDivElement>(null);

  const quality = QUALITIES.find((item) => item.id === qualityId) ?? null;
  const familyMeta = FAMILIES.find((item) => item.id === quality?.family);
  const accent = familyMeta?.accent ?? FAMILIES[0].accent;
  const voicing = quality ? voiceChord(root, quality, octave, inversion) : null;
  const pitch = groundPitch(root, octave);
  const soundedInversion = quality ? Math.min(inversion, quality.steps.length - 1) : 0;
  const bounds = keyboardBounds(voicing?.midis ?? (hearingRoot ? [pitch.midi] : []));
  const loadingLabel = INSTRUMENTS.find((item) => item.id === (activeInstrument ?? instrument))?.label;

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
    setInversion(nextInversion);
    setQualityId(nextQuality.id);
    setRoot(nextRoot);
    setHearingRoot(false);
    lightNotes(next.notes, next.midis, nextMode);
    void play(next.notes, nextMode, nextInstrument);
  }

  function playRoot(nextRoot: RootId, nextOctave = octave, nextInstrument = instrument) {
    const next = groundPitch(nextRoot, nextOctave);
    setRoot(nextRoot);
    setQualityId(null);
    setInversion(0);
    setHearingRoot(true);
    lightNotes([next.note], [next.midi], "chord");
    void play([next.note], "chord", nextInstrument);
    colorsScroller.current?.scrollTo({ top: 0 });
  }

  function colorRow(color: Quality, key: string) {
    const selected = qualityId === color.id;
    const symbol = chordSymbol(root, color);
    const notes = voiceChord(root, color, octave, 0).pitchClasses;
    return (
      <button
        key={key}
        type="button"
        aria-pressed={selected}
        aria-label={`Play ${symbol}, ${color.label}`}
        onClick={() => sound(color, root, octave, 0)}
        className="flex h-10 w-full items-center gap-2.5 border-b border-line px-2.5 text-left"
        style={{
          background: selected ? "#1b1916" : "transparent",
          color: selected ? "#f4f1ea" : "#1b1916",
        }}
      >
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-serif text-[17px] leading-none">{symbol}</span>
          <span className={`hidden text-[11px] leading-none sm:inline ${selected ? "text-[#f4f1ea]/65" : "text-muted"}`}>
            {notes.map((pc) => pretty(pc)).join(" ")}
          </span>
        </span>
        <span className={`min-w-0 flex-1 truncate text-[13px] ${selected ? "text-[#f4f1ea]/70" : "text-muted"}`}>
          {color.label}
        </span>
      </button>
    );
  }

  const commonChords = COMMON_IDS.map((id) => QUALITIES.find((item) => item.id === id)).filter(
    (item): item is Quality => item !== undefined,
  );

  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-line px-3">
        <h1 className="font-serif text-lg leading-none">Chords</h1>
        <p className="truncate text-[13px] text-muted">
          {status === "loading" ? `Loading ${loadingLabel?.toLowerCase()}…` : status === "error" ? error : null}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[9.5rem_1fr]">
        <section className="flex min-h-0 flex-col overflow-hidden border-r border-line bg-rail" aria-label="Roots">
          {ROOTS.map((item) => {
            const selected = root === item.id && hearingRoot;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                aria-label={`Play ${item.label}`}
                onClick={() => playRoot(item.id)}
                className="flex min-h-0 w-full max-h-10 flex-1 items-center px-3 text-left font-serif text-[17px] leading-none"
                style={{
                  background: selected ? "#1b1916" : "transparent",
                  color: selected ? "#f4f1ea" : "#1b1916",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden" aria-label="Chord colors">
          <h2 className="flex h-8 shrink-0 items-center justify-between border-b border-line px-2.5 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            <span>Colors</span>
            <span className="font-serif text-base tracking-normal text-ink normal-case">{ROOTS.find((item) => item.id === root)?.label}</span>
          </h2>
          <div ref={colorsScroller} className="pane min-h-0 flex-1 overflow-y-auto">
            <div id="colors-common">
              <div className="sticky top-0 z-10 flex h-7 items-center gap-2 border-b border-line bg-paper/95 px-2.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-ink" />
                <span className="text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">Common</span>
                <span className="truncate text-[12px] text-muted">Reach for these first.</span>
              </div>
              {commonChords.map((color) => colorRow(color, `common-${color.id}`))}
            </div>
            {FAMILIES.map((family) => {
              const colors = QUALITIES.filter((item) => item.family === family.id && !GROUND.has(item.id));
              return (
                <div key={family.id} id={`colors-${family.id}`}>
                  <div className="sticky top-0 z-10 flex h-7 items-center gap-2 border-b border-line bg-paper/95 px-2.5 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full" style={{ background: family.accent }} />
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: family.accent }}>
                      {family.name}
                    </span>
                    <span className="truncate text-[12px] text-muted">{family.mood}</span>
                  </div>
                  {colors.map((color) => colorRow(color, `${family.id}-${color.id}`))}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="shrink-0 border-t border-line bg-paper pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
            <p className="shrink-0 font-serif text-xl leading-none" aria-live="polite">
              {quality ? chordSymbol(root, quality) : hearingRoot ? rootLabel(root) : "—"}
            </p>
            <p className="min-w-0 truncate text-[11px] leading-none text-muted">
              {voicing
                ? voicing.notes.map((note) => pretty(note)).join(" ")
                : hearingRoot
                  ? pretty(pitch.note)
                  : "Tap a chord"}
            </p>
          </div>
          {quality && voicing && (
            <div className="flex items-center gap-0.5" role="group" aria-label="Bass note">
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
                    className="h-7 min-w-7 rounded-full px-1.5 text-[12px] font-semibold"
                    style={{
                      background: selected ? accent : "transparent",
                      color: selected ? "#fffcf7" : "#1b1916",
                      boxShadow: selected ? "none" : "inset 0 0 0 1px #d8d1c4",
                    }}
                  >
                    {pretty(pc)}
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (quality) sound(quality);
              else if (hearingRoot) playRoot(root);
            }}
            disabled={!quality && !hearingRoot}
            className="h-7 shrink-0 rounded-full bg-ink px-2.5 text-[12px] font-semibold text-paper disabled:opacity-30"
          >
            Again
          </button>
        </div>
        <div className="px-2.5">
          <Piano low={bounds.low} high={bounds.high} active={lit} accent={accent} />
        </div>
        <div className="flex flex-nowrap items-center gap-1 px-2 pt-1.5 pb-1.5">
          <Segmented
            label="How it plays"
            value={mode}
            options={[
              { value: "chord", label: "Chord" },
              { value: "notes", label: "Notes" },
            ]}
            onChange={(next) => {
              setMode(next);
              if (quality) sound(quality, root, octave, inversion, next);
              else if (hearingRoot) playRoot(root);
            }}
          />
          <Segmented
            label="Octave"
            value={String(octave)}
            options={OCTAVES.map((item) => ({ value: String(item.value), label: item.label }))}
            onChange={(next) => {
              const value = Number(next) as 3 | 4 | 5;
              setOctave(value);
              if (quality) sound(quality, root, value);
              else if (hearingRoot) playRoot(root, value);
            }}
          />
          <Segmented
            label="Instrument"
            value={instrument}
            options={INSTRUMENTS.map((item) => ({ value: item.id, label: item.label }))}
            onChange={(next) => {
              setInstrument(next);
              if (quality) sound(quality, root, octave, inversion, mode, next);
              else if (hearingRoot) playRoot(root, octave, next);
            }}
          />
        </div>
      </footer>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-full bg-rail p-0.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className="h-7 whitespace-nowrap rounded-full px-1.5 text-[12px] font-semibold"
            style={{
              background: selected ? "#1b1916" : "transparent",
              color: selected ? "#f4f1ea" : "#6f675c",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
