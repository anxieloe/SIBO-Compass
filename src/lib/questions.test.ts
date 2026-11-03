import { describe, expect, it } from "vitest";
import { buildDoctorQuestions, clickRate, emptyAnswers, hasWarningSign, toggleSafety } from "./questions";

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

it("click rate is clicks / next views", () => {
  expect(clickRate(1, 4)).toBe("25%");
  expect(clickRate(0, 0)).toBe("—");
});
