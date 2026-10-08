import { pretty } from "@/lib/theory";

type ActiveNote = { midi: number; label: string };

const BLACK = new Set([1, 3, 6, 8, 10]);

export function Piano({
  low,
  high,
  active,
  accent,
}: {
  low: number;
  high: number;
  active: ActiveNote[];
  accent: string;
}) {
  const whites: number[] = [];
  const blacks: { midi: number; after: number }[] = [];
  let whitesSoFar = 0;

  for (let midi = low; midi <= high; midi++) {
    if (BLACK.has(midi % 12)) {
      blacks.push({ midi, after: whitesSoFar });
    } else {
      whites.push(midi);
      whitesSoFar += 1;
    }
  }

  const activeByMidi = new Map(active.map((note) => [note.midi, note.label]));

  return (
    <div className="relative h-9 w-full select-none" aria-hidden="true">
      <div className="flex h-full gap-px">
        {whites.map((midi) => {
          const label = activeByMidi.get(midi);
          const on = label !== undefined;
          return (
            <div
              key={midi}
              className="relative flex h-full min-w-0 flex-1 items-end justify-center rounded-b-sm border border-ink/15 pb-0.5 text-[9px] font-medium leading-none"
              style={{
                background: on ? accent : "#fffcf7",
                color: on ? "#fffcf7" : "rgba(27, 25, 22, 0.4)",
              }}
            >
              {on ? pretty(label) : midi % 12 === 0 ? "C" : ""}
            </div>
          );
        })}
      </div>
      {blacks.map(({ midi, after }) => {
        const label = activeByMidi.get(midi);
        const on = label !== undefined;
        return (
          <div
            key={midi}
            className="absolute top-0 flex h-5 w-2.5 items-end justify-center rounded-b-sm text-[8px] font-medium leading-none"
            style={{
              left: `calc(${after} * 100% / ${whites.length} - 0.3125rem)`,
              background: on ? accent : "#1b1916",
              color: on ? "#fffcf7" : "transparent",
            }}
          >
            {on ? pretty(label) : ""}
          </div>
        );
      })}
    </div>
  );
}
