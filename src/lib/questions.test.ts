import { describe, expect, it } from "vitest";
import { buildDoctorQuestions, clickRate, emptyAnswers, hasWarningSign, NO_FOOD_YET, normalizeAnswers, suspectedFoodsText, SUSPECTED_FOODS, toggleFood, toggleSafety } from "./questions";

const base = { ...emptyAnswers, symptoms: ["Bloating"], frequency: "Daily", duration: "Under 3 months", mealPattern: "No pattern" };

describe("doctor questions", () => {
  it("always includes the causes question only, by default", () => {
    expect(buildDoctorQuestions(base)).toEqual(["What could be causing my symptoms, and which tests make sense for me?"]);
  });
  it("adds referral for 1-3 years and more", () => {
    expect(buildDoctorQuestions({ ...base, duration: "1-3 years" })).toContain("Should I be referred to a gastroenterologist?");
    expect(buildDoctorQuestions({ ...base, duration: "3-12 months" })).not.toContain("Should I be referred to a gastroenterologist?");
  });
  it("adds diary when meal pattern is specific", () => {
    expect(buildDoctorQuestions({ ...base, mealPattern: "1-3 hours later" })).toContain("Could a food and symptom diary help us find a pattern?");
    expect(buildDoctorQuestions({ ...base, mealPattern: "Not sure" })).not.toContain("Could a food and symptom diary help us find a pattern?");
  });
  it("adds diarrhea question", () => {
    expect(buildDoctorQuestions({ ...base, symptoms: ["Diarrhea"] })).toContain("Should other causes of diarrhea be checked as well?");
  });
  it("adds review question for antibiotics or breath test", () => {
    expect(buildDoctorQuestions({ ...base, tried: ["A previous breath test"] })).toContain("Can my earlier treatment or test results be reviewed?");
  });
});

describe("safety", () => {
  it("None of these clears others and vice versa", () => {
    expect(toggleSafety(["Blood in stool"], "None of these")).toEqual(["None of these"]);
    expect(toggleSafety(["None of these"], "Fever with symptoms")).toEqual(["Fever with symptoms"]);
  });
  it("warning sign triggers alert", () => {
    expect(hasWarningSign(["None of these"])).toBe(false);
    expect(hasWarningSign(["Trouble swallowing"])).toBe(true);
  });
});

describe("suspected foods", () => {
  it("lists more than the four named suspects", () => {
    expect(SUSPECTED_FOODS.length).toBeGreaterThan(4);
    for (const f of ["Garlic", "Onions", "Milk and other dairy (lactose)", "Gluten in general"]) {
      expect(SUSPECTED_FOODS).toContain(f);
    }
  });
  it("No specific food yet is exclusive with named foods", () => {
    expect(toggleFood(["Garlic"], NO_FOOD_YET)).toEqual([NO_FOOD_YET]);
    expect(toggleFood([NO_FOOD_YET], "Garlic")).toEqual(["Garlic"]);
    expect(toggleFood(["Garlic", "Apples"], "Apples")).toEqual(["Garlic"]);
  });
  it("summary line keeps tapped foods first, then typed extras", () => {
    expect(
      suspectedFoodsText({ suspectedFoods: ["Garlic", "Onions"], suspectedFoodsExtra: ["Coffee"] }),
    ).toBe("Garlic, Onions, Coffee");
  });
  it("older comma-string answers are read back as a list", () => {
    const fixed = normalizeAnswers({ ...emptyAnswers, suspectedFoods: "onions, milk" as unknown as string[] });
    expect(fixed.suspectedFoods).toEqual(["onions", "milk"]);
    expect(fixed.suspectedFoodsExtra).toEqual([]);
  });
});

it("click rate is clicks / next views", () => {
  expect(clickRate(1, 4)).toBe("25%");
  expect(clickRate(0, 0)).toBe("—");
});
