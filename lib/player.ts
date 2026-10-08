"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Soundfont } from "smplr";

export const INSTRUMENTS = [
  { id: "piano", label: "Piano", soundfont: "acoustic_grand_piano" },
  { id: "epiano", label: "E. piano", soundfont: "electric_piano_1" },
  { id: "guitar", label: "Guitar", soundfont: "acoustic_guitar_nylon" },
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number]["id"];
export type PlayMode = "chord" | "notes";
export type PlayerStatus = "idle" | "loading" | "ready" | "error";

const NOTE_RANGE = Array.from({ length: 49 }, (_, index) => 48 + index);

type Engine = {
  ready: Promise<void>;
  start: (event: { note: string; velocity?: number; time?: number; duration?: number }) => void;
  stop: () => void;
  dispose: () => void;
};

export function useChordPlayer() {
  const cacheRef = useRef(new Map<InstrumentId, Engine>());
  const pendingRef = useRef(new Map<InstrumentId, Promise<Engine>>());
  const ctxRef = useRef<AudioContext | null>(null);
  const requestRef = useRef(0);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [activeInstrument, setActiveInstrument] = useState<InstrumentId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (instrument: InstrumentId) => {
    const cached = cacheRef.current.get(instrument);
    if (cached) return cached;

    const pending = pendingRef.current.get(instrument);
    if (pending) return pending;

    const ctx = ctxRef.current;
    if (!ctx) throw new Error("Audio is not ready yet.");

    const soundfontName = INSTRUMENTS.find((item) => item.id === instrument)?.soundfont;
    const created = (async () => {
      const { Soundfont } = await import("smplr");
      const engine: Soundfont = Soundfont(ctx, {
        instrument: soundfontName,
        kit: "MusyngKite",
        volume: 78,
        extraGain: 3,
        notesToLoad: { notes: NOTE_RANGE, fallback: "nearest" },
      });
      await engine.ready;
      return engine;
    })();

    pendingRef.current.set(instrument, created);
    try {
      const engine = await created;
      cacheRef.current.set(instrument, engine);
      return engine;
    } catch (cause) {
      pendingRef.current.delete(instrument);
      throw cause;
    }
  }, []);

  const play = useCallback(
    async (notes: string[], mode: PlayMode, instrument: InstrumentId) => {
      const token = ++requestRef.current;
      setError(null);
      setActiveInstrument(instrument);

      const ctx = ctxRef.current ?? new AudioContext();
      ctxRef.current = ctx;
      void ctx.resume();

      for (const engine of cacheRef.current.values()) engine.stop();

      if (!cacheRef.current.has(instrument)) setStatus("loading");

      try {
        const engine = await load(instrument);
        if (token !== requestRef.current) return;
        if (ctx.state === "suspended") await ctx.resume();
        if (token !== requestRef.current) return;

        engine.stop();
        const start = ctx.currentTime + 0.04;
        const gap = mode === "notes" ? 0.34 : 0.018;
        notes.forEach((note, index) => {
          engine.start({
            note,
            time: start + index * gap,
            duration: mode === "notes" ? 1.7 : 2.5,
            velocity: mode === "notes" ? 96 : 102 - index * 7,
          });
        });
        setStatus("ready");
      } catch {
        if (token !== requestRef.current) return;
        setStatus("error");
        setError("Couldn’t load the instrument. Check your connection and tap again.");
      }
    },
    [load],
  );

  useEffect(() => {
    const cache = cacheRef.current;
    const ctx = ctxRef;
    return () => {
      for (const engine of cache.values()) {
        try {
          engine.dispose();
        } catch {
          // Already torn down.
        }
      }
      void ctx.current?.close();
    };
  }, []);

  return { play, status, error, activeInstrument };
}
