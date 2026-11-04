export const SYMPTOMS = ["Bloating", "Gas", "Abdominal pain", "Diarrhea", "Constipation", "Nausea", "Fatigue"];
export const FREQUENCIES = ["Daily", "A few times a week", "Weekly"];
export const DURATIONS = ["Under 3 months", "3-12 months", "1-3 years", "More than 3 years"];
export const MEAL_PATTERNS = ["Right after eating", "1-3 hours later", "No pattern", "Not sure"];
export const SUSPECTED_FOODS = [
  "Garlic",
  "Onions",
  "Leeks and shallots",
  "Wheat (bread, pasta)",
  "Rye and barley",
  "Gluten in general",
  "Milk and other dairy (lactose)",
  "Yoghurt and soft cheese",
  "Honey and agave syrup",
  "Apples",
  "Pears",
  "Watermelon",
  "Stone fruits (peaches, plums, cherries)",
  "Dried fruit (dates, raisins)",
  "Mushrooms",
  "Cauliflower and artichokes",
  "Beans, lentils and chickpeas",
  "Cashews and pistachios",
  "Sugar alcohols (sorbitol, xylitol)",
  "Sugar-free gum and mints",
  "Inulin or chicory root (added fibre)",
  "Beer and sparkling wine",
  "Soy",
  "Fatty or fried meals",
];
export const NO_FOOD_YET = "No specific food yet";

export const TRIED = [
  "Diet changes (FODMAP, gluten-free, dairy-free)",
  "Lactose or gluten test",
  "Probiotics",
  "Antibiotics",
  "Seen a doctor",
  "A previous breath test",
  "None yet",
];
export const DIAGNOSIS = ["Yes", "No", "Not sure"];
export const WARNING_SIGNS = [
  "Unintended weight loss",
  "Blood in stool",
  "Black or tarry stool",
  "Trouble swallowing",
  "Severe or constant pain",
  "Fever with symptoms",
];
export const NONE_OF_THESE = "None of these";

export type Answers = {
  symptoms: string[];
  frequency: string | null;
  duration: string | null;
  mealPattern: string | null;
  suspectedFoods: string[];
  suspectedFoodsExtra: string[];

  tried: string[];
  diagnosisStatus: string | null;
  safety: string[];
};

export const emptyAnswers: Answers = {
  symptoms: [],
  frequency: null,
  duration: null,
  mealPattern: null,
  suspectedFoods: [],
  suspectedFoodsExtra: [],

  tried: [],
  diagnosisStatus: null,
  safety: [],
};

export function buildDoctorQuestions(a: Answers): string[] {
  const q = ["What could be causing my symptoms, and which tests make sense for me?"];
  if (a.duration === "1-3 years" || a.duration === "More than 3 years")
    q.push("Should I be referred to a gastroenterologist?");
  if (a.mealPattern && a.mealPattern !== "No pattern" && a.mealPattern !== "Not sure")
    q.push("Could a food and symptom diary help us find a pattern?");
  if (a.symptoms.includes("Diarrhea")) q.push("Should other causes of diarrhea be checked as well?");
  if (a.tried.includes("Antibiotics") || a.tried.includes("A previous breath test"))
    q.push("Can my earlier treatment or test results be reviewed?");
  return q;
}

/** "None of these" is exclusive with every warning sign. */
export function toggleSafety(current: string[], item: string): string[] {
  if (current.includes(item)) return current.filter((x) => x !== item);
  if (item === NONE_OF_THESE) return [NONE_OF_THESE];
  return [...current.filter((x) => x !== NONE_OF_THESE), item];
}

/** "No specific food yet" is exclusive with every named food. */
export function toggleFood(current: string[], item: string): string[] {
  if (current.includes(item)) return current.filter((x) => x !== item);
  if (item === NO_FOOD_YET) return [NO_FOOD_YET];
  return [...current.filter((x) => x !== NO_FOOD_YET), item];
}

/** One text line with the tapped foods first, then anything the person typed in. */
export function suspectedFoodsText(a: Pick<Answers, "suspectedFoods" | "suspectedFoodsExtra">): string {
  return [...a.suspectedFoods, ...a.suspectedFoodsExtra].join(", ");
}

/** Older saved sessions stored suspected foods as one comma string; keep them readable. */
export function normalizeAnswers(raw: Partial<Answers> | null | undefined): Answers {
  const toList = (xs: unknown): string[] =>
    (Array.isArray(xs) ? xs : typeof xs === "string" ? xs.split(",") : [])
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
  const a = { ...emptyAnswers, ...(raw ?? {}) };
  return { ...a, suspectedFoods: toList(a.suspectedFoods), suspectedFoodsExtra: toList(a.suspectedFoodsExtra) };
}

export function hasWarningSign(safety: string[]): boolean {
  return safety.some((s) => WARNING_SIGNS.includes(s));
}

export function clickRate(clicks: number, views: number): string {
  if (!views) return "—";
  return `${Math.round((clicks / views) * 1000) / 10}%`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
