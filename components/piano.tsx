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
    <div className="relative h-16 w-full select-none" aria-hidden="true">
      <div className="flex h-full gap-px">
        {whites.map((midi) => {
          const label = activeByMidi.get(midi);
          const on = label !== undefined;
          return (
            <div
              key={midi}
              className="relative flex h-full min-w-0 flex-1 items-end justify-center rounded-b-md border border-black/20 pb-1 text-[10px] font-medium leading-none"
              style={{
                background: on ? accent : "#f3ecdf",
                color: on ? "#1a140c" : "rgba(26, 20, 12, 0.45)",
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
            className="absolute top-0 flex h-9 w-3.5 items-end justify-center rounded-b pb-0.5 text-[9px] font-medium leading-none"
            style={{
              left: `calc(${after} * 100% / ${whites.length} - 0.4375rem)`,
              background: on ? accent : "#241f1a",
              color: on ? "#1a140c" : "transparent",
              boxShadow: "0 2px 0 rgba(0,0,0,0.45)",
            }}
          >
            {on ? pretty(label) : ""}
          </div>
        );
      })}
    </div>
  );
}
