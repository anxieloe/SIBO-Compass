export type Recipe = { title: string; time: string; ingredients: string[]; steps: string[] };

// Starter examples: simple, low-FODMAP-style meals. Not a treatment diet.
export const RECIPES: Recipe[] = [
  {
    title: "Lemon herb chicken with rice",
    time: "30 min",
    ingredients: ["2 chicken breasts", "1 cup white rice", "1 tbsp olive oil", "Juice of 1 lemon", "Fresh parsley and thyme", "Salt and pepper"],
    steps: ["Cook the rice as directed.", "Season chicken with oil, lemon, herbs, salt and pepper.", "Pan-fry 6–7 minutes per side until cooked through.", "Serve sliced over rice."],
  },
  {
    title: "Garlic-free green-onion omelette",
    time: "10 min",
    ingredients: ["3 eggs", "Green parts of 2 spring onions", "Handful of spinach", "1 tsp butter or oil", "Salt"],
    steps: ["Whisk eggs with a pinch of salt.", "Soften spinach and onion greens in the pan.", "Pour in eggs and cook gently, then fold."],
  },
  {
    title: "Baked salmon with carrots and potatoes",
    time: "35 min",
    ingredients: ["2 salmon fillets", "2 carrots", "2 medium potatoes", "1 tbsp olive oil", "Dill", "Salt"],
    steps: ["Heat oven to 400°F (200°C).", "Cube carrots and potatoes, toss with oil and salt, roast 20 minutes.", "Add salmon with dill, roast 12–15 minutes more."],
  },
  {
    title: "Overnight oats with blueberries",
    time: "5 min + overnight",
    ingredients: ["½ cup rolled oats", "½ cup lactose-free milk or almond milk", "¼ cup blueberries", "1 tsp maple syrup", "1 tbsp chia seeds"],
    steps: ["Mix everything in a jar.", "Refrigerate overnight.", "Top with extra blueberries in the morning."],
  },
  {
    title: "Ginger turkey stir-fry",
    time: "20 min",
    ingredients: ["1 lb ground turkey", "1 red bell pepper", "1 zucchini", "1 tbsp fresh ginger", "2 tbsp tamari", "Garlic-infused oil", "Rice to serve"],
    steps: ["Brown turkey in garlic-infused oil.", "Add sliced pepper, zucchini and ginger, cook 5 minutes.", "Stir in tamari and serve over rice."],
  },
  {
    title: "Simple chicken and vegetable soup",
    time: "40 min",
    ingredients: ["2 chicken thighs", "2 carrots", "1 celery stalk (small)", "Green parts of leeks", "Homemade or onion-free broth", "Parsley, salt"],
    steps: ["Simmer chicken in broth 20 minutes, then shred.", "Add chopped vegetables and cook 15 minutes.", "Return chicken, season and add parsley."],
  },
];

export type Group = { name: string; url: string; about: string };

export const SUPPORT_GROUPS: Group[] = [
  { name: "SIBO Lifestyle (Facebook)", url: "https://www.thesibodoctor.com/", about: "Large moderated patient community run by The SIBO Doctor team. Facebook sign-in needed." },
  { name: "SIBO SOS community", url: "https://sibosos.com/", about: "Free Facebook group plus workshops and a podcast, founded by a SIBO patient." },
  { name: "Mayo Clinic Connect — Digestive Health", url: "https://connect.mayoclinic.org/discussion/sibo-ibs/", about: "Free patient discussion forum hosted by Mayo Clinic." },
  { name: "Inspire — Digestive system disorders", url: "https://www.inspire.com/groups/digestive-system-disorders/discussion/sibo-support/", about: "Free online support community with SIBO discussions." },
  { name: "Smart Patients — SIBO", url: "https://www.smartpatients.com/topics/sibo", about: "Free peer-to-peer forum for patients and families." },
];
