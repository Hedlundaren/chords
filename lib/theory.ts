export const ROOTS = [
  { id: "C", label: "C" },
  { id: "C#", label: "C♯" },
  { id: "D", label: "D" },
  { id: "Eb", label: "E♭" },
  { id: "E", label: "E" },
  { id: "F", label: "F" },
  { id: "F#", label: "F♯" },
  { id: "G", label: "G" },
  { id: "Ab", label: "A♭" },
  { id: "A", label: "A" },
  { id: "Bb", label: "B♭" },
  { id: "B", label: "B" },
] as const;

export type RootId = (typeof ROOTS)[number]["id"];

export const FAMILIES = [
  { id: "bright", name: "Bright", mood: "Major. Stable and open.", accent: "#a67914" },
  { id: "dark", name: "Dark", mood: "Minor. Softer, a little sad.", accent: "#2a6f97" },
  { id: "warm", name: "Warm", mood: "Dominant. Leans forward.", accent: "#c0562a" },
  { id: "open", name: "Open", mood: "Suspended. No third.", accent: "#2d7a52" },
  { id: "tense", name: "Tense", mood: "Diminished. Tight.", accent: "#5c4cae" },
  { id: "lifted", name: "Lifted", mood: "Augmented. Unstable.", accent: "#b13368" },
  { id: "spicy", name: "Spicy", mood: "Altered. Extra bite.", accent: "#b42318" },
] as const;

/** The left list is the root itself. Major still appears under Common so the triad can be heard. */
export const GROUND_IDS = ["major"] as const;

/** Shown first in the color list, in the order people usually learn them. */
export const COMMON_IDS = ["major", "minor", "7", "maj7", "m7", "sus4", "sus2", "dim", "aug"] as const;

export type FamilyId = (typeof FAMILIES)[number]["id"];

type Step = { degree: number; semitones: number };

export type Quality = {
  id: string;
  family: FamilyId;
  label: string;
  suffix: string;
  steps: Step[];
};

const step = (degree: number, semitones: number): Step => ({ degree, semitones });

export const QUALITIES: Quality[] = [
  { id: "major", family: "bright", label: "Major", suffix: "", steps: [step(1, 0), step(3, 4), step(5, 7)] },
  { id: "6", family: "bright", label: "Major 6", suffix: "6", steps: [step(1, 0), step(3, 4), step(5, 7), step(6, 9)] },
  { id: "maj7", family: "bright", label: "Major 7", suffix: "maj7", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 11)] },
  { id: "add9", family: "bright", label: "Add 9", suffix: "add9", steps: [step(1, 0), step(3, 4), step(5, 7), step(9, 14)] },
  { id: "69", family: "bright", label: "6/9", suffix: "6/9", steps: [step(1, 0), step(3, 4), step(5, 7), step(6, 9), step(9, 14)] },
  { id: "maj9", family: "bright", label: "Major 9", suffix: "maj9", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 11), step(9, 14)] },

  { id: "minor", family: "dark", label: "Minor", suffix: "m", steps: [step(1, 0), step(3, 3), step(5, 7)] },
  { id: "m6", family: "dark", label: "Minor 6", suffix: "m6", steps: [step(1, 0), step(3, 3), step(5, 7), step(6, 9)] },
  { id: "m7", family: "dark", label: "Minor 7", suffix: "m7", steps: [step(1, 0), step(3, 3), step(5, 7), step(7, 10)] },
  { id: "mmaj7", family: "dark", label: "Minor major 7", suffix: "mMaj7", steps: [step(1, 0), step(3, 3), step(5, 7), step(7, 11)] },
  { id: "madd9", family: "dark", label: "Minor add 9", suffix: "madd9", steps: [step(1, 0), step(3, 3), step(5, 7), step(9, 14)] },
  { id: "m9", family: "dark", label: "Minor 9", suffix: "m9", steps: [step(1, 0), step(3, 3), step(5, 7), step(7, 10), step(9, 14)] },
  { id: "m11", family: "dark", label: "Minor 11", suffix: "m11", steps: [step(1, 0), step(3, 3), step(7, 10), step(9, 14), step(11, 17)] },

  { id: "7", family: "warm", label: "Dominant 7", suffix: "7", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 10)] },
  { id: "9", family: "warm", label: "Dominant 9", suffix: "9", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 10), step(9, 14)] },
  { id: "13", family: "warm", label: "Dominant 13", suffix: "13", steps: [step(1, 0), step(3, 4), step(7, 10), step(9, 14), step(13, 21)] },
  { id: "11", family: "warm", label: "Dominant 11", suffix: "11", steps: [step(1, 0), step(5, 7), step(7, 10), step(9, 14), step(11, 17)] },
  { id: "7sus4", family: "warm", label: "7 sus 4", suffix: "7sus4", steps: [step(1, 0), step(4, 5), step(5, 7), step(7, 10)] },

  { id: "sus2", family: "open", label: "Sus 2", suffix: "sus2", steps: [step(1, 0), step(2, 2), step(5, 7)] },
  { id: "sus4", family: "open", label: "Sus 4", suffix: "sus4", steps: [step(1, 0), step(4, 5), step(5, 7)] },
  { id: "9sus4", family: "open", label: "9 sus 4", suffix: "9sus4", steps: [step(1, 0), step(4, 5), step(5, 7), step(7, 10), step(9, 14)] },

  { id: "dim", family: "tense", label: "Diminished", suffix: "dim", steps: [step(1, 0), step(3, 3), step(5, 6)] },
  { id: "m7b5", family: "tense", label: "Half-diminished", suffix: "m7♭5", steps: [step(1, 0), step(3, 3), step(5, 6), step(7, 10)] },
  { id: "dim7", family: "tense", label: "Diminished 7", suffix: "dim7", steps: [step(1, 0), step(3, 3), step(5, 6), step(6, 9)] },

  { id: "aug", family: "lifted", label: "Augmented", suffix: "aug", steps: [step(1, 0), step(3, 4), step(5, 8)] },
  { id: "aug7", family: "lifted", label: "Augmented 7", suffix: "aug7", steps: [step(1, 0), step(3, 4), step(5, 8), step(7, 10)] },
  { id: "maj7s5", family: "lifted", label: "Major 7 ♯5", suffix: "maj7♯5", steps: [step(1, 0), step(3, 4), step(5, 8), step(7, 11)] },

  { id: "7b9", family: "spicy", label: "7 ♭9", suffix: "7♭9", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 10), step(9, 13)] },
  { id: "7s9", family: "spicy", label: "7 ♯9", suffix: "7♯9", steps: [step(1, 0), step(3, 4), step(5, 7), step(7, 10), step(9, 15)] },
  { id: "7s11", family: "spicy", label: "7 ♯11", suffix: "7♯11", steps: [step(1, 0), step(3, 4), step(7, 10), step(9, 14), step(11, 18)] },
  { id: "7b13", family: "spicy", label: "7 ♭13", suffix: "7♭13", steps: [step(1, 0), step(3, 4), step(7, 10), step(9, 14), step(13, 20)] },
  { id: "alt", family: "spicy", label: "Altered", suffix: "alt", steps: [step(1, 0), step(3, 4), step(5, 8), step(7, 10), step(9, 13)] },
];

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_SEMI = [0, 2, 4, 5, 7, 9, 11];

export type Spelled = { pc: string; chroma: number };

export function spell(root: string, degree: number, semitones: number): Spelled {
  const letter = root[0] ?? "C";
  const ri = LETTERS.indexOf(letter as (typeof LETTERS)[number]);
  const acc = root.endsWith("b") ? -1 : root.endsWith("#") ? 1 : 0;
  const rootChroma = (LETTER_SEMI[ri] + acc + 12) % 12;
  const li = (ri + (degree - 1)) % 7;
  const natural = LETTER_SEMI[li];
  const target = (rootChroma + (semitones % 12) + 12) % 12;
  let delta = target - natural;
  if (delta > 6) delta -= 12;
  if (delta < -6) delta += 12;
  const accidental = delta === 0 ? "" : delta > 0 ? "#".repeat(delta) : "b".repeat(-delta);
  return { pc: LETTERS[li] + accidental, chroma: target };
}

export function pretty(note: string): string {
  return note.replaceAll("b", "♭").replaceAll("#", "♯");
}

export function rootLabel(root: RootId): string {
  return ROOTS.find((item) => item.id === root)?.label ?? root;
}

export function chordSymbol(root: RootId, quality: Quality): string {
  return rootLabel(root) + quality.suffix;
}

export type Voicing = {
  notes: string[];
  midis: number[];
  pitchClasses: string[];
};

const LOW_MIDI = 48;
const HIGH_MIDI = 96;

export function voiceChord(root: RootId, quality: Quality, octave: number, inversion: number): Voicing {
  const spelled = quality.steps.map((item) => spell(root, item.degree, item.semitones));
  const inv = Math.min(Math.max(inversion, 0), spelled.length - 1);
  const ordered = spelled.slice(inv).concat(spelled.slice(0, inv));
  const bassMidi = (octave + 1) * 12 + ordered[0].chroma;
  const midis = [bassMidi];
  for (let i = 1; i < ordered.length; i++) {
    let midi = ordered[i].chroma;
    while (midi <= midis[i - 1]) midi += 12;
    midis.push(midi);
  }

  let placed = midis;
  while (placed[placed.length - 1] > HIGH_MIDI && placed[0] - 12 >= LOW_MIDI) {
    placed = placed.map((midi) => midi - 12);
  }

  const notes = placed.map((midi) => {
    const match = spelled.find((item) => item.chroma === midi % 12);
    const oct = Math.floor(midi / 12) - 1;
    return `${match?.pc ?? "C"}${oct}`;
  });

  return {
    notes,
    midis: placed,
    pitchClasses: spelled.map((item) => item.pc),
  };
}

export function noteToMidi(note: string): number {
  const match = /^([A-G])(#{1,}|b{1,}|)(-?\d+)$/.exec(note);
  if (!match) return 60;
  const letter = match[1];
  const acc = match[2];
  const oct = Number(match[3]);
  const alt = acc.startsWith("b") ? -acc.length : acc.length;
  const stepIndex = LETTERS.indexOf(letter as (typeof LETTERS)[number]);
  return LETTER_SEMI[stepIndex] + alt + 12 * (oct + 1);
}

export function keyboardBounds(midis: number[]): { low: number; high: number } {
  if (midis.length === 0) return { low: 60, high: 83 };
  const bottom = Math.min(...midis);
  const top = Math.max(...midis);
  const low = bottom - (bottom % 12);
  let high = low + 23;
  if (high < top) high = top - (top % 12) + 11;
  return { low, high };
}

export type ChordPick = { root: RootId; qualityId: string };

const ROOT_IDS = ROOTS.map((item) => item.id);

export function transposeRoot(root: RootId, semitones: number): RootId {
  const index = ROOT_IDS.indexOf(root);
  const next = (((index + semitones) % 12) + 12) % 12;
  return ROOT_IDS[next];
}

function pick(root: RootId, semitones: number, qualityId: string): ChordPick {
  return { root: transposeRoot(root, semitones), qualityId };
}

/**
 * Chords that usually follow this one, from common-practice functional harmony.
 * Major and minor chords are treated as I or i. Dominants resolve down a fifth.
 */
export function suggestNext(root: RootId, qualityId: string | null): ChordPick[] {
  const quality = qualityId ? QUALITIES.find((item) => item.id === qualityId) : undefined;
  const family = quality?.family ?? "bright";
  let moves: ChordPick[];

  if (quality?.id === "m7b5") {
    moves = [pick(root, -2, "minor"), pick(root, 5, "7"), pick(root, 6, "major"), pick(root, 3, "minor")];
  } else if (family === "tense") {
    moves = [pick(root, 1, "major"), pick(root, 1, "minor"), pick(root, 6, "major"), pick(root, 10, "minor")];
  } else if (family === "warm" || family === "spicy") {
    moves = [pick(root, 5, "major"), pick(root, 2, "minor"), pick(root, 10, "major"), pick(root, 5, "minor")];
  } else if (family === "dark") {
    moves = [pick(root, 8, "major"), pick(root, 5, "minor"), pick(root, 3, "major"), pick(root, 7, "major")];
  } else if (family === "open") {
    moves = [pick(root, 0, "major"), pick(root, 0, "minor"), pick(root, 7, "major"), pick(root, 5, "major")];
  } else if (family === "lifted") {
    moves = [pick(root, 5, "major"), pick(root, 0, "major"), pick(root, 9, "minor"), pick(root, 7, "major")];
  } else {
    moves = [pick(root, 7, "major"), pick(root, 5, "major"), pick(root, 9, "minor"), pick(root, 2, "minor")];
  }

  const current = qualityId ?? "major";
  const seen = new Set<string>();
  return moves.filter((item) => {
    const key = `${item.root}:${item.qualityId}`;
    if (seen.has(key) || (item.root === root && item.qualityId === current)) return false;
    seen.add(key);
    return QUALITIES.some((entry) => entry.id === item.qualityId);
  });
}
