const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.window = {};

const detection = require("../src/scamDetection.js");
const scenarioLab = JSON.parse(fs.readFileSync(path.join(__dirname, "scenarioLab.json"), "utf8"));

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

test("infers already-acted context from natural-language descriptions", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "I clicked their link in a bank alert and shared the verification code before realizing it might be fake.",
    notes: ""
  });

  assert.ok(result.exposureActions.includes("clicked_link"));
  assert.ok(result.exposureActions.includes("shared_code"));
  assert.equal(result.hasAlreadyActed, true);
  assert.equal(result.shouldUseRecovery, true);
  assert.match(result.exposureSummary, /already acted/i);
  assert.ok(result.safeVerificationSteps.some((step) => /official account settings/i.test(step)));
});

test("uses optional already-acted context to tailor recovery without making promises", () => {
  const result = detection.assessScamRisk({
    sourceType: "payment",
    requestedAction: "send_money",
    exposureActions: ["paid_money"],
    content:
      "A marketplace buyer asked me to refund an overpayment through Venmo outside the app.",
    notes: ""
  });
  const plan = detection.buildRecoveryPlan(result);

  assert.ok(result.exposureActionLabels.includes("I sent money, gift cards, crypto, or a payment"));
  assert.equal(result.shouldUseRecovery, true);
  assert.ok(result.recommendedNextActions.some((action) => /already acted/i.test(action)));
  assert.ok(plan.groups.some((group) => group.title === "Because you already acted"));
  assert.ok(
    plan.groups
      .find((group) => group.title === "Because you already acted")
      .steps.some((step) => /payment provider/i.test(step.title))
  );
  assert.ok(plan.steps.some((step) => /Contact the payment provider quickly/i.test(step.title)));
  assert.doesNotMatch(plan.steps.map((step) => step.detail).join(" "), /guarantee.*refund|guaranteed.*recover/i);
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

test("treats unfamiliar church donation calls as caution instead of likely safe", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "Someone named Jenny called me claiming to be from the church I go to, but I don't know anyone named jenny, and the church doesn't normally ask for donations",
    notes: ""
  });
  const plan = detection.buildRecoveryPlan(result);

  assert.equal(result.riskLevel, detection.LEVELS.CAUTION);
  assert.equal(result.sourceType, "call");
  assert.equal(result.requestedAction, "trust_person");
  assert.ok(result.detectedSignals.some((signal) => signal.id === "impersonation"));
  assert.ok(result.detectedSignals.some((signal) => signal.id === "unexpected_donation"));
  assert.ok(result.safeVerificationSteps.some((step) => /church|charity|organization/i.test(step)));
  assert.ok(plan.steps.some((step) => /donation request/i.test(step.title)));
  assert.doesNotMatch(result.explanation, /definitely safe/i);
});

test("handles custom red-team cases across high, caution, safe, and unclear outcomes", () => {
  const examples = [
    {
      name: "Apple ID locked login link",
      content:
        "Apple security notice says my Apple ID is locked and I need to verify at http://appleid-security-help.com today.",
      level: detection.LEVELS.HIGH,
      signal: "identity_verification"
    },
    {
      name: "rent wired to new bank account",
      content:
        "My landlord emailed that rent must be wired today to a new bank account because the old one is frozen.",
      level: detection.LEVELS.HIGH,
      signal: "payment_destination_change"
    },
    {
      name: "safe account transfer",
      content:
        "A bank fraud agent called and told me to move my money to a safe account to stop hackers.",
      level: detection.LEVELS.HIGH,
      signal: "payment_destination_change"
    },
    {
      name: "school fundraiser on official channels",
      content:
        "The school newsletter says the fundraiser link is on the official school website and donations are optional at the front office.",
      level: detection.LEVELS.SAFE,
      signal: null
    },
    {
      name: "restaurant menu QR code",
      content:
        "The restaurant table has a QR code for the menu only. It is not asking me to pay or sign in.",
      level: detection.LEVELS.SAFE,
      signal: null
    },
    {
      name: "unclear short call",
      content: "Jenny called. Weird?",
      level: detection.LEVELS.UNKNOWN,
      signal: null
    }
  ];

  for (const example of examples) {
    const result = detection.assessScamRisk({
      sourceType: "",
      requestedAction: "",
      content: example.content,
      notes: ""
    });

    assert.equal(result.riskLevel, example.level, example.name);
    if (example.signal) {
      assert.ok(result.detectedSignals.some((signal) => signal.id === example.signal), example.name);
    } else {
      assert.equal(result.detectedSignals.length, 0, example.name);
    }
    assert.doesNotMatch(result.explanation, /definitely safe/i, example.name);
  }
});

test("scenario lab fixture matches expected risks and required signals", () => {
  for (const scenario of scenarioLab) {
    assert.ok(scenario.category, `${scenario.id} missing category`);
    const result = detection.assessScamRisk({
      sourceType: "",
      requestedAction: "",
      notes: "",
      ...scenario.input
    });
    const actualSignals = result.detectedSignals.map((signal) => signal.id);

    assert.equal(result.riskLevel, scenario.expectedRiskLevel, scenario.id);
    for (const expectedSignal of scenario.expectedSignals || []) {
      assert.ok(actualSignals.includes(expectedSignal), `${scenario.id} missing ${expectedSignal}`);
    }
    assert.doesNotMatch(result.explanation, /definitely safe/i, scenario.id);
  }
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
  assert.ok(unclear.followUpQuestions.some((question) => question.id === "exact_words"));
  assert.ok(unclear.followUpQuestions.some((question) => question.id === "requested_action"));
});

test("builds safe guided-review questions for messy inputs", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "Someone sent me a link and says my account has a problem. They want me to fix it today."
  });
  const prompts = result.followUpQuestions.map((question) => question.prompt).join(" ");
  const hints = result.followUpQuestions.map((question) => question.hint).join(" ");

  assert.ok(result.followUpQuestions.length >= 3);
  assert.ok(result.followUpQuestions.length <= 5);
  assert.match(prompts, /asking you to do|How did this reach/i);
  assert.match(prompts, /link|QR|verify/i);
  assert.match(hints, /Do not open it|official app|website you type/i);
  assert.match(hints, /Do not include passwords|one-time codes|private keys|recovery phrases/i);
});

test("guided-review details can move an unclear check into a clearer risk judgment", () => {
  const unclear = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content: "My account has a problem."
  });
  const updated = detection.assessScamRisk({
    sourceType: unclear.sourceType,
    requestedAction: unclear.requestedAction,
    content:
      "My account has a problem.\n\nAdditional review details: It came by text and they want me to read them the one-time verification code before my bank account is locked."
  });

  assert.equal(unclear.riskLevel, detection.LEVELS.UNKNOWN);
  assert.equal(updated.riskLevel, detection.LEVELS.HIGH);
  assert.ok(updated.detectedSignals.some((signal) => signal.id === "code_request"));
  assert.ok(updated.followUpQuestions.some((question) => question.id === "access_request"));
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
  assert.ok(plan.groups.some((group) => group.title === "First moves"));
  assert.ok(plan.groups.some((group) => group.title === "Situation-specific steps"));
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

test("infers payment routes for common scam recovery playbooks", () => {
  const examples = [
    {
      name: "gift cards",
      content: "They want me to buy Apple gift cards and send the card codes.",
      route: "gift_card"
    },
    {
      name: "crypto",
      content: "They say to send USDT crypto to a wallet address for guaranteed profit.",
      route: "crypto"
    },
    {
      name: "payment app",
      content: "A buyer says they overpaid through Zelle business and wants a refund on Venmo.",
      route: "payment_app"
    },
    {
      name: "wire transfer",
      content: "They want a wire transfer through Western Union today.",
      route: "wire_transfer"
    },
    {
      name: "bank transfer",
      content: "They asked for a bank transfer and routing number to fix the account.",
      route: "bank_transfer"
    },
    {
      name: "card",
      content: "The message says to update billing with my debit card details.",
      route: "card"
    },
    {
      name: "check",
      content: "The remote job says to mobile deposit a cashier's check and buy equipment.",
      route: "check"
    },
    {
      name: "QR payment",
      content: "A parking sign says to scan this QR code to pay the ticket fee.",
      route: "qr_payment"
    }
  ];

  for (const example of examples) {
    const result = detection.assessScamRisk({
      sourceType: "",
      requestedAction: "",
      content: example.content
    });

    assert.ok(result.paymentRoutes.includes(example.route), example.name);
    assert.ok(result.paymentPlaybooks.some((playbook) => playbook.route === example.route), example.name);
    assert.ok(result.inputSummary.inferredPaymentRoutes.includes(example.route), example.name);
  }
});

test("recovery plan includes payment-specific guidance without refund guarantees", () => {
  const result = detection.assessScamRisk({
    sourceType: "",
    requestedAction: "",
    content:
      "I sent crypto to a trading platform and now a recovery service wants an upfront fee and my private key."
  });
  const plan = detection.buildRecoveryPlan(result);
  const cryptoPlaybook = plan.paymentPlaybooks.find((playbook) => playbook.route === "crypto");

  assert.ok(cryptoPlaybook);
  assert.match(cryptoPlaybook.focus, /difficult to reverse/i);
  assert.ok(cryptoPlaybook.steps.some((step) => /upfront fee/i.test(step)));
  assert.ok(cryptoPlaybook.steps.some((step) => /Never share seed phrases or private keys/i.test(step)));
  assert.doesNotMatch(cryptoPlaybook.steps.join(" "), /guarantee.*refund|guaranteed.*recover/i);
});

test("builds a privacy-limited official report preparation draft", () => {
  const checkItem = {
    sourceType: "message",
    requestedAction: "",
    content:
      "Someone from a marketplace wants me to pay with Zelle outside the app and says the buyer protection fee is urgent.",
    notes: "They sent a phone number and a payment handle."
  };
  const result = detection.assessScamRisk(checkItem);
  const prep = detection.buildReportPrep(checkItem, result);

  assert.match(prep.title, /report prep/i);
  assert.match(prep.draft, /Possible scam report preparation/);
  assert.match(prep.draft, /Verivae result:/);
  assert.match(prep.draft, /Confidence:/);
  assert.match(prep.draft, /Payment route:/);
  assert.match(prep.draft, /What is still unclear:/);
  assert.match(prep.draft, /does not submit this report/i);
  assert.ok(prep.suggestedChannels.some((channel) => /official/i.test(channel.detail)));
  assert.ok(prep.beforeSubmitting.some((step) => /Remove passwords, one-time codes/i.test(step)));
  assert.ok(prep.beforeSubmitting.some((step) => /Do not pay anyone who promises guaranteed recovery/i.test(step)));
  assert.doesNotMatch(prep.draft, /Verivae can guarantee|Verivae guarantees/i);
});

test("report prep still gives safer reporting guidance when details are unclear", () => {
  const checkItem = {
    sourceType: "other",
    requestedAction: "not_sure",
    content: "Is this ok?",
    notes: ""
  };
  const result = detection.assessScamRisk(checkItem);
  const prep = detection.buildReportPrep(checkItem, result);

  assert.equal(result.riskLevel, detection.LEVELS.UNKNOWN);
  assert.match(prep.draft, /Payment method not clear yet/);
  assert.match(prep.draft, /What is still unclear:/);
  assert.ok(prep.evidenceChecklist.some((item) => /What you already did/i.test(item)));
  assert.ok(prep.suggestedChannels.some((channel) => /Do not use contact details from the suspicious message/i.test(channel.detail)));
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

test("local storage saves, updates, reads, and deletes case packets", () => {
  const storage = require("../src/storage.js");
  storage.clearCasePackets();

  const checkItem = {
    sourceType: "message",
    requestedAction: "share_code",
    content:
      "A caller says they are from my bank and need the one-time verification code to stop fraud.",
    notes: "They sounded urgent."
  };
  const result = detection.assessScamRisk(checkItem);
  const packet = {
    id: `case-${result.id}`,
    status: "Recovery review",
    createdAt: result.checkedAt,
    checkItem,
    result,
    evidenceSummary: detection.summarizeForEvidence(checkItem, result),
    recoveryPlan: detection.buildRecoveryPlan(result),
    helperSummary: detection.buildHelperSummary(checkItem, result)
  };

  const saved = storage.saveCasePacket(packet);
  assert.equal(saved.length, 1);
  assert.equal(storage.getCasePacket(packet.id).status, "Recovery review");
  assert.ok(storage.getCasePacket(packet.id).savedAt);
  assert.ok(storage.getCasePacket(packet.id).updatedAt);

  storage.saveCasePacket({ ...packet, status: "Needs more information" });
  assert.equal(storage.getCasePackets().length, 1);
  assert.equal(storage.getCasePacket(packet.id).status, "Needs more information");

  storage.saveCasePacket({
    ...packet,
    caseTitle: "Bank code request",
    status: "waiting_bank",
    statusLabel: "Waiting on bank",
    caseNotes: "Called the bank through the number on the card.",
    taskProgress: { 0: true, 2: true }
  });
  assert.equal(storage.getCasePacket(packet.id).caseTitle, "Bank code request");
  assert.equal(storage.getCasePacket(packet.id).status, "waiting_bank");
  assert.equal(storage.getCasePacket(packet.id).statusLabel, "Waiting on bank");
  assert.equal(storage.getCasePacket(packet.id).caseNotes, "Called the bank through the number on the card.");
  assert.deepEqual(storage.getCasePacket(packet.id).taskProgress, { 0: true, 2: true });

  storage.deleteCasePacket(packet.id);
  assert.equal(storage.getCasePackets().length, 0);
});
