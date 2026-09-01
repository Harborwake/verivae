const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};

const detection = require("../src/scamDetection.js");

test("flags urgent gift-card code request as high risk", () => {
  const result = detection.assessScamRisk({
    sourceType: "message",
    requestedAction: "buy_gift_cards",
    content:
      "This is your manager. Buy Apple gift cards urgently and send me the codes. Do not tell anyone.",
    notes: ""
  });

  assert.equal(result.riskLevel, detection.LEVELS.HIGH);
  assert.ok(result.detectedSignals.some((signal) => signal.id === "unusual_payment"));
  assert.ok(result.detectedSignals.some((signal) => signal.id === "secrecy"));
});

test("returns not enough information for very short unclear input", () => {
  const result = detection.assessScamRisk({
    sourceType: "other",
    requestedAction: "not_sure",
    content: "Is this ok?",
    notes: ""
  });

  assert.equal(result.riskLevel, detection.LEVELS.UNKNOWN);
  assert.ok(result.missingInformation.length > 0);
});

test("judges natural-language descriptions without required dropdown context", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "I got a text saying it is my bank fraud department. They say my debit card will be locked unless I read back the one-time verification code they just sent me.",
    notes: ""
  });

  assert.equal(result.riskLevel, detection.LEVELS.HIGH);
  assert.equal(result.assessmentMode, "local_rules");
  assert.equal(result.requestedAction, "share_code");
  assert.ok(result.detectedSignals.some((signal) => signal.id === "fake_bank_alert"));
  assert.ok(result.judgment.mainWarningSigns.includes("Bank fraud alert pressure"));
  assert.match(result.judgment.why, /Verivae|requested action/i);
  assert.ok(result.judgment.safestNextSteps.some((step) => /bank|official/i.test(step)));
});

test("keeps an AI-ready assessment shape for future service responses", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "Someone on Marketplace wants to overpay by Zelle business and says I need to refund the extra money to a shipping agent before pickup.",
    notes: ""
  });

  assert.equal(result.assessmentVersion, "local-rules-v1");
  assert.equal(result.inputSummary.inferredRequestedAction, "send_money");
  assert.equal(result.judgment.riskLevel, result.riskLevel);
  assert.deepEqual(result.judgment.whatNotToDo, result.doNotDo);
  assert.deepEqual(result.judgment.missingInformation, result.missingInformation);
});

test("keeps low-signal requests cautious instead of guaranteeing safety", () => {
  const result = detection.assessScamRisk({
    sourceType: "message",
    requestedAction: "trust_person",
    content: "A neighbor said the community meeting was moved to Thursday at the library.",
    notes: ""
  });

  assert.notEqual(result.explanation.includes("guarantee"), false);
  assert.ok(result.doNotDo.some((item) => item.includes("passwords")));
});

test("covers common scam examples with expected risk levels and signals", () => {
  const examples = [
    {
      name: "fake bank fraud alert",
      item: {
        sourceType: "call",
        requestedAction: "share_code",
        content:
          "Fraud department calling. There is an unauthorized charge on your account. Your debit card will be locked unless you read us the one-time verification code we just sent."
      },
      level: detection.LEVELS.HIGH,
      signal: "fake_bank_alert"
    },
    {
      name: "package delivery scam",
      item: {
        sourceType: "link",
        requestedAction: "click_link",
        content:
          "USPS: your package is held for a small unpaid fee. Pay today at https://bit.ly/fee-update or delivery fails."
      },
      level: detection.LEVELS.HIGH,
      signal: "package_fee"
    },
    {
      name: "fake job check scam",
      item: {
        sourceType: "email",
        requestedAction: "send_money",
        content:
          "Welcome to your remote job. Mobile deposit this cashier's check, buy work equipment from our approved vendor, and send back anything left over today."
      },
      level: detection.LEVELS.HIGH,
      signal: "fake_job_check"
    },
    {
      name: "marketplace overpayment",
      item: {
        sourceType: "message",
        requestedAction: "send_money",
        content:
          "I want to buy your couch on Facebook Marketplace. I overpaid by Zelle business, so refund the extra money to my shipping agent before pickup."
      },
      level: detection.LEVELS.HIGH,
      signal: "marketplace_overpayment"
    },
    {
      name: "romance emergency money request",
      item: {
        sourceType: "message",
        requestedAction: "send_money",
        content:
          "I love you and I am stranded overseas after a hospital emergency. I cannot video call, but please send crypto right now and keep this between us."
      },
      level: detection.LEVELS.HIGH,
      signal: "relationship_pressure"
    },
    {
      name: "tech support remote access",
      item: {
        sourceType: "email",
        requestedAction: "install_app",
        content:
          "Your computer has viruses. Install AnyDesk and allow our support team remote access so we can remove the threat."
      },
      level: detection.LEVELS.HIGH,
      signal: "remote_access"
    },
    {
      name: "crypto investment scam",
      item: {
        sourceType: "message",
        requestedAction: "send_money",
        content:
          "My mentor has a secret trading platform with guaranteed profit and daily returns. Send USDT crypto today to double your money before the window closes."
      },
      level: detection.LEVELS.HIGH,
      signal: "too_good_to_be_true"
    },
    {
      name: "qr code payment scam",
      item: {
        sourceType: "qr",
        requestedAction: "send_money",
        content:
          "A note on the parking meter says the old meter is broken. Scan this QR code to pay the parking ticket fee immediately."
      },
      level: detection.LEVELS.HIGH,
      signal: "qr_payment"
    },
    {
      name: "suspicious attachment",
      item: {
        sourceType: "attachment",
        requestedAction: "open_attachment",
        content:
          "Please open the attached invoice zip file today and enable content so the document displays correctly."
      },
      level: detection.LEVELS.HIGH,
      signal: "attachment_pressure"
    },
    {
      name: "account verification code request",
      item: {
        sourceType: "email",
        requestedAction: "share_code",
        content:
          "Security check: verify your account by replying with the login code we sent. If you do not respond today, your account will be suspended."
      },
      level: detection.LEVELS.HIGH,
      signal: "identity_verification"
    }
  ];

  for (const example of examples) {
    const result = detection.assessScamRisk(example.item);
    assert.equal(result.riskLevel, example.level, example.name);
    assert.ok(result.detectedSignals.some((signal) => signal.id === example.signal), example.name);
    assert.ok(result.primaryGuidance.length > 20, example.name);
    assert.ok(result.safeVerificationSteps.length > 0, example.name);
  }
});

test("handles common natural-language examples without helper fields", () => {
  const examples = [
    {
      name: "gift card scam",
      content:
        "My manager texted me and said this is urgent. They want me to buy Apple gift cards for a client, keep it confidential, and send the card codes.",
      level: detection.LEVELS.HIGH,
      signal: "unusual_payment"
    },
    {
      name: "bank fraud alert scam",
      content:
        "A caller says they are from my bank fraud department. They claim there is an unauthorized charge and I need to read them the one-time verification code.",
      level: detection.LEVELS.HIGH,
      signal: "fake_bank_alert"
    },
    {
      name: "delivery scam",
      content:
        "I got a USPS delivery text saying my package is held for a small fee and I need to pay today at a short link or delivery fails.",
      level: detection.LEVELS.HIGH,
      signal: "package_fee"
    },
    {
      name: "fake job check scam",
      content:
        "A remote job offer says I should mobile deposit a cashier's check, buy equipment from their vendor, and send back the leftover money.",
      level: detection.LEVELS.HIGH,
      signal: "fake_job_check"
    },
    {
      name: "marketplace scam",
      content:
        "A Marketplace buyer says they overpaid by Zelle business and I need to refund the extra money to their shipping agent before pickup.",
      level: detection.LEVELS.HIGH,
      signal: "marketplace_overpayment"
    },
    {
      name: "romance or emergency request",
      content:
        "Someone I met online says they love me but are stranded overseas after a hospital emergency. They cannot video call and want crypto right now.",
      level: detection.LEVELS.HIGH,
      signal: "relationship_pressure"
    },
    {
      name: "tech support remote access scam",
      content:
        "A support message says my computer has viruses and I need to install AnyDesk so they can get remote access and clean it up.",
      level: detection.LEVELS.HIGH,
      signal: "remote_access"
    },
    {
      name: "crypto investment scam",
      content:
        "Someone says their mentor has a secret crypto trading platform with guaranteed profit and daily returns if I send USDT today.",
      level: detection.LEVELS.HIGH,
      signal: "too_good_to_be_true"
    },
    {
      name: "QR code scam",
      content:
        "A parking meter note says the old payment machine is broken and tells me to scan this QR code to pay a ticket fee immediately.",
      level: detection.LEVELS.HIGH,
      signal: "qr_payment"
    },
    {
      name: "suspicious file or attachment",
      content:
        "An email asks me to open the attached invoice zip file today and enable content so the document displays correctly.",
      level: detection.LEVELS.HIGH,
      signal: "attachment_pressure"
    },
    {
      name: "account verification code request",
      content:
        "A message says my account will be suspended unless I verify my account by replying with the login code they just sent.",
      level: detection.LEVELS.HIGH,
      signal: "identity_verification"
    },
    {
      name: "ordinary low-risk message",
      content:
        "My neighbor messaged that the book club moved to Thursday at the library. No payment or account information is needed.",
      level: detection.LEVELS.SAFE,
      signal: null
    },
    {
      name: "unclear not enough information",
      content: "Can you help me with this?",
      level: detection.LEVELS.UNKNOWN,
      signal: null
    }
  ];

  for (const example of examples) {
    const result = detection.assessScamRisk({
      sourceType: "",
      requestedAction: "",
      content: example.content
    });

    assert.equal(result.riskLevel, example.level, example.name);
    assert.ok(result.judgment.why.length > 20, example.name);
    assert.ok(result.judgment.safestNextSteps.length > 0, example.name);
    assert.ok(result.judgment.whatNotToDo.some((item) => item.includes("passwords") || item.includes("codes")), example.name);

    if (example.signal) {
      assert.ok(result.detectedSignals.some((signal) => signal.id === example.signal), example.name);
      assert.equal(result.shouldSaveEvidence, true, example.name);
    }

    if (example.level === detection.LEVELS.UNKNOWN) {
      assert.ok(result.missingInformation.length > 0, example.name);
    }
  }
});

test("ordinary and unclear examples avoid false confidence", () => {
  const ordinary = detection.assessScamRisk({
    sourceType: "message",
    requestedAction: "not_sure",
    content:
      "Hi, the neighborhood book club moved from Tuesday to Thursday at the library. No payment or account information is needed."
  });

  assert.equal(ordinary.riskLevel, detection.LEVELS.SAFE);
  assert.match(ordinary.explanation, /not a guarantee/i);

  const unclear = detection.assessScamRisk({
    sourceType: "other",
    requestedAction: "not_sure",
    content: "Can you help me with this?"
  });

  assert.equal(unclear.riskLevel, detection.LEVELS.UNKNOWN);
  assert.ok(unclear.missingInformation.some((item) => item.includes("what they want you to do")));
});

test("builds useful helper and evidence summaries", () => {
  const checkItem = {
    sourceType: "message",
    requestedAction: "send_money",
    content:
      "I am stranded overseas after an emergency. Please send crypto right now and keep this between us.",
    notes: "They say they cannot video call."
  };
  const result = detection.assessScamRisk(checkItem);
  const helperSummary = detection.buildHelperSummary(checkItem, result);
  const evidenceSummary = detection.summarizeForEvidence(checkItem, result);

  assert.match(helperSummary, /What happened/);
  assert.match(helperSummary, /Verivae result: High risk/);
  assert.match(helperSummary, /Confidence:/);
  assert.match(helperSummary, /Main guidance/);
  assert.match(helperSummary, /Safest next steps/);
  assert.match(helperSummary, /What is still unclear|Warning signs/);
  assert.match(helperSummary, /Remove passwords|remove passwords/i);
  assert.match(helperSummary, /one-time codes/);
  assert.match(helperSummary, /official channels/);
  assert.equal(evidenceSummary.headline, `${result.riskLabel} - ${result.requestedActionLabel}`);
  assert.equal(evidenceSummary.confidence, result.confidence);
  assert.equal(evidenceSummary.sourceType, result.sourceType);
  assert.equal(evidenceSummary.requestedActionType, result.requestedAction);
  assert.equal(evidenceSummary.shouldSaveEvidence, result.shouldSaveEvidence);
  assert.equal(evidenceSummary.shouldUseRecovery, result.shouldUseRecovery);
  assert.ok(Array.isArray(evidenceSummary.warningSigns));
  assert.match(evidenceSummary.originalExcerpt, /stranded overseas/);
  assert.ok(evidenceSummary.savedReminder.includes("Remove passwords"));
});

test("builds situation-aware recovery steps from warning signs", () => {
  const result = detection.assessScamRisk({
    sourceType: "call",
    requestedAction: "share_code",
    content:
      "Fraud department calling. There is an unauthorized charge on your account. Your debit card will be locked unless you read us the one-time verification code we just sent."
  });
  const plan = detection.buildRecoveryPlan(result);

  assert.match(plan.headline, /high risk/i);
  assert.ok(plan.steps.some((step) => step.title.includes("bank or payment app")));
  assert.ok(plan.steps.some((step) => step.title.includes("Secure accounts")));
  assert.ok(plan.steps.some((step) => step.detail.includes("Verivae does not submit reports")));
});

test("recovery plan uses inferred natural-language risk context", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "Someone says my laptop has viruses and I need to install AnyDesk for remote access, then scan a QR code to pay the cleanup fee."
  });
  const plan = detection.buildRecoveryPlan(result);

  assert.equal(result.riskLevel, detection.LEVELS.HIGH);
  assert.match(plan.context, /Confidence:/);
  assert.ok(plan.steps.some((step) => step.priority === "Device"));
  assert.ok(plan.steps.some((step) => step.priority === "Link"));
  assert.ok(plan.steps.some((step) => step.priority === "Money"));
});

test("local storage saves, filters, and deletes prototype evidence data", () => {
  const storage = require("../src/storage.js");
  storage.clearEvidence();

  const result = detection.assessScamRisk({
    sourceType: "message",
    requestedAction: "buy_gift_cards",
    content:
      "This is your manager. I need Apple gift cards urgently for a client. Do not tell anyone. Buy them now and send the card numbers and codes."
  });
  const item = {
    id: result.id,
    checkItem: {
      sourceType: "message",
      requestedAction: "buy_gift_cards",
      content: "Gift card test",
      notes: "Saved from a test"
    },
    result,
    evidenceSummary: detection.summarizeForEvidence(
      {
        sourceType: "message",
        requestedAction: "buy_gift_cards",
        content: "Gift card test",
        notes: "Saved from a test"
      },
      result
    )
  };

  const saved = storage.saveEvidence(item);
  assert.equal(saved.length, 1);
  assert.equal(storage.getEvidence()[0].result.riskLevel, detection.LEVELS.HIGH);

  storage.deleteEvidence(result.id);
  assert.equal(storage.getEvidence().length, 0);
});
