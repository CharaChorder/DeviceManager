import { persistentWritable } from "$lib/storage";

interface ChordStats {
  level: number;
  lastUprank: number;
}

export const chordStats = persistentWritable<Record<string, ChordStats>>(
  "chord-stats",
  {},
);
