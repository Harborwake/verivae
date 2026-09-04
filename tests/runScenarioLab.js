const fs = require("node:fs");
const path = require("node:path");

global.window = {};

const detection = require("../src/scamDetection.js");

const scenarioPath = path.join(__dirname, "scenarioLab.json");
const scenarios = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));

function includesAllSignals(actualSignals, expectedSignals) {
  return expectedSignals.every((signal) => actualSignals.includes(signal));
}

const results = scenarios.map((scenario) => {
  const assessment = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    notes: "",
    ...scenario.input
  });
  const actualSignals = assessment.detectedSignals.map((signal) => signal.id);
  const riskMatches = assessment.riskLevel === scenario.expectedRiskLevel;
  const signalsMatch = includesAllSignals(actualSignals, scenario.expectedSignals || []);

  return {
    id: scenario.id,
    category: scenario.category || "uncategorized",
    title: scenario.title,
    passed: riskMatches && signalsMatch,
    expectedRiskLevel: scenario.expectedRiskLevel,
    actualRiskLevel: assessment.riskLevel,
    expectedSignals: scenario.expectedSignals || [],
    actualSignals,
    requestedAction: assessment.requestedAction,
    sourceType: assessment.sourceType,
    confidence: assessment.confidence
  };
});

const failures = results.filter((result) => !result.passed);
const categories = results.reduce((summary, result) => {
  const current = summary.get(result.category) || { total: 0, passed: 0 };
  current.total += 1;
  if (result.passed) {
    current.passed += 1;
  }
  summary.set(result.category, current);
  return summary;
}, new Map());

console.log(`Scenario Lab: ${results.length - failures.length}/${results.length} passed`);
console.log("\nBy category:");
for (const [category, summary] of [...categories.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`- ${category}: ${summary.passed}/${summary.total} passed`);
}

if (failures.length) {
  console.log("\nFailures:");
  failures.forEach((failure) => {
    console.log(`- ${failure.id} [${failure.category}]: ${failure.title}`);
    console.log(`  risk: expected ${failure.expectedRiskLevel}, got ${failure.actualRiskLevel}`);
    console.log(`  signals: expected ${failure.expectedSignals.join(", ") || "(none)"}`);
    console.log(`  actual: ${failure.actualSignals.join(", ") || "(none)"}`);
  });
  process.exitCode = 1;
} else {
  console.log("All scenarios matched expected risk levels and required signals.");
}
