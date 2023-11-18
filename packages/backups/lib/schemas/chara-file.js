import { z } from "zod";

export const ActionCode = z.number().positive().lte(512);

export const CharaChordFile = z.object({
  type: z.literal("chords"),
  chords: z.array(
    z.tuple([z.array(ActionCode).min(2).max(10), z.array(ActionCode).min(1)]),
  ),
});

export const CharaLayoutFile = z.object({ type: z.literal("layout") }).extend(
  z.discriminatedUnion("device", [
    z.object({
      device: z.literal("ONE"),
      layout: z.array(z.array(ActionCode).length(90)).length(3),
    }),
    z.object({
      device: z.literal("LITE"),
      layout: z.array(z.array(ActionCode).length(67)).length(3),
    }),
    z.object({
      device: z.literal("X"),
      layout: z.array(z.array(ActionCode).length(256)).length(3),
    }),
  ]),
);

export const CharaFile = z.discriminatedUnion("type", [
  CharaChordFile,
  CharaLayoutFile,
]);
