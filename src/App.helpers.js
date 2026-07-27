import { DAYS } from "./data/days.js";

export const blankSets = (n) =>
  Array.from({ length: n }, (_, i) => ({ n: i + 1, w: "", r: "", done: false }));

export const initDay = (dayId) => {
  const day = DAYS[dayId];
  const st = {};
  [...day.baseline, ...day.pool].forEach((ex) => {
    st[ex.id] = {
      sets: blankSets(ex.sets),
      note: "",
      variant: ex.variants ? ex.variants[0] : null,
      active: day.baseline.some((b) => b.id === ex.id),
    };
  });
  return st;
};

export const COMPOUND = [
  "Incline Chest Press",
  "Flat Chest Press",
  "Chest-Supported Row",
  "Lat Pulldown",
  "Shoulder Press",
  "Assisted Pull-ups",
  "Seated Cable Row",
  "Hack Squat",
  "Leg Press",
  "Romanian Deadlift",
];
