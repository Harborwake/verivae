(function (root) {
  const LEVELS = {
    SAFE: "likely_safe",
    CAUTION: "caution",
    HIGH: "high_risk",
    UNKNOWN: "not_enough_information"
  };

  const levelLabels = {
    [LEVELS.SAFE]: "Likely safe, with basic caution",
    [LEVELS.CAUTION]: "Caution",
    [LEVELS.HIGH]: "High risk",
    [LEVELS.UNKNOWN]: "Not enough information"
  };

  const signalRules = [
    {
      id: "urgency",
      label: "Urgency or fear pressure",
      weight: 2,
      pattern:
        /\b(urgent(?:ly)?|immediately|right now|final notice|act now|today only|last chance|within \d+\s?(minutes?|hours?)|account will be (closed|locked)|account (closed|locked|suspended)|arrest|lawsuit|warrant|delivery fails|will be cancelled)\b/i,
      explanation: "Scams often rush people so they do not pause or verify."
    },
    {
      id: "secrecy",
      label: "Pressure to keep it secret",
      weight: 3,
      pattern:
        /\b(do not tell|don't tell|keep this secret|confidential|between us|no one else|do not contact|avoid telling|hide this)\b/i,
      explanation: "Requests that discourage asking someone else deserve extra caution."
    },
    {
      id: "unusual_payment",
      label: "Unusual or hard-to-reverse payment method",
      weight: 4,
      pattern:
        /\b(gift cards?|steam card|apple card|google play|crypto|bitcoin|ethereum|usdt|wire transfer|western union|moneygram|cashapp|cash app|zelle|venmo|prepaid|voucher|friends and family|payment app)\b/i,
      explanation: "Gift cards, crypto, wires, and instant payment apps are common scam payment rails."
    },
    {
      id: "code_request",
      label: "Request for a code, password, or account access",
      weight: 4,
      pattern:
        /\b(one[- ]?time code|verification code|2fa|mfa|login code|password|passcode|security code|reset code|recovery phrase|private key)\b/i,
      explanation: "Legitimate support teams should not ask for passwords, recovery phrases, or login codes."
    },
    {
      id: "remote_access",
      label: "Remote access or software installation pressure",
      weight: 4,
      pattern:
        /\b(anydesk|teamviewer|remote access|remote desktop|screen share|install this app|download this app|allow access|device cleanup|virus removal)\b/i,
      explanation: "Remote access requests can let a scammer control accounts or steal information."
    },
    {
      id: "suspicious_link",
      label: "Suspicious link or shortened URL",
      weight: 2,
      pattern:
        /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly|qr code|scan this qr|scan the qr)/i,
      explanation: "Links and QR codes can hide the true destination or lead to fake login and payment pages."
    },
    {
      id: "impersonation",
      label: "Possible authority or company impersonation",
      weight: 2,
      pattern:
        /\b(bank|irs|social security|police|sheriff|fbi|support team|fraud department)\b|\b(amazon|paypal|apple|microsoft|netflix|usps|fedex|ups)\s+(support|account|security|billing|notice|delivery)\b|\b(from|with)\s+(amazon|paypal|apple|microsoft|netflix|usps|fedex|ups)\b/i,
      explanation: "Scammers often pretend to be a trusted organization or official."
    },
    {
      id: "relationship_pressure",
      label: "Romance, family, or emergency pressure",
      weight: 3,
      pattern:
        /\b(love you|romance|military|overseas|hospital|surgery|bail|grandson|granddaughter|mom it's me|dad it's me|new number|emergency|stranded|stuck at customs|cannot video call)\b/i,
      explanation: "Emotional emergencies and new-number stories are common impersonation patterns."
    },
    {
      id: "attachment_pressure",
      label: "Attachment or download pressure",
      weight: 3,
      pattern:
        /\b(attachment|invoice attached|open the file|download the file|pdf invoice|docx|zip file|apk file|macro|enable editing|enable content|shared document)\b/i,
      explanation: "Unexpected attachments or downloads can be risky, especially when paired with urgency."
    },
    {
      id: "too_good_to_be_true",
      label: "Unrealistic reward or investment promise",
      weight: 3,
      pattern:
        /\b(guaranteed profit|double your money|risk[- ]?free|lottery|prize|grant|free money|investment opportunity|limited investors|huge returns|daily returns|mentor|trading platform|secret platform)\b/i,
      explanation: "Guaranteed money, prizes, or high returns are frequent scam hooks."
    },
    {
      id: "fake_bank_alert",
      label: "Bank fraud alert pressure",
      weight: 4,
      pattern:
        /\b(fraud alert|fraud department|unauthorized charge|suspicious transaction|bank alert|debit card locked|account locked|reverse the charge|secure your account)\b/i,
      explanation: "Fake bank alerts often push people to share codes, call fake numbers, or move money."
    },
    {
      id: "package_fee",
      label: "Package fee or delivery problem",
      weight: 3,
      pattern:
        /\b(package|parcel|delivery|shipment|usps|fedex|ups|customs fee|redelivery|delivery fee|address confirmation|held for a fee)\b/i,
      explanation: "Fake delivery messages commonly ask for small fees, card details, or link clicks."
    },
    {
      id: "fake_job_check",
      label: "Job or fake-check setup",
      weight: 4,
      pattern:
        /\b(remote job|new hire|mystery shopper|personal assistant|equipment vendor|mobile deposit|deposit this check|cashier'?s check|certified check|send back|buy equipment|payroll setup)\b/i,
      explanation: "Fake job scams often use checks, equipment purchases, or money-forwarding requests."
    },
    {
      id: "marketplace_overpayment",
      label: "Marketplace overpayment or shipping pressure",
      weight: 4,
      pattern:
        /\b(marketplace|facebook marketplace|craigslist|buyer|seller|courier|shipper|shipping agent|overpay|overpayment|refund the difference|zelle business|venmo business|upgrade your account)\b/i,
      explanation: "Marketplace scams often involve overpayments, fake business-account fees, or outside shipping pressure."
    },
    {
      id: "qr_payment",
      label: "QR code payment pressure",
      weight: 3,
      pattern: /\b(qr code|scan this qr|scan the qr|payment qr|qr payment|parking ticket qr)\b/i,
      explanation: "Payment QR codes can hide the destination or route money to an account the user did not intend."
    },
    {
      id: "identity_verification",
      label: "Account verification or identity check request",
      weight: 3,
      pattern:
        /\b(verify (your|my|the) account|account will be suspended|confirm your identity|identity verification|security check|validate your login|confirm your card|update billing|reactivate your account)\b/i,
      explanation: "Account-verification messages can lead to fake login, payment, or identity forms."
    }
  ];

  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b(?:\d[ -]*?){13,19}\b/,
    /\b(seed phrase|recovery phrase|private key|full card number|bank password|one[- ]?time code|verification code)\b/i
  ];

  const sourceLabels = {
    message: "Text or chat message",
    email: "Email",
    link: "Link or website",
    payment: "Payment request",
    qr: "QR code situation",
    attachment: "Attachment concern",
    call: "Phone call or voicemail",
    other: "Other situation"
  };

  const actionLabels = {
    send_money: "Send money",
    buy_gift_cards: "Buy gift cards",
    share_code: "Share a code",
    click_link: "Click a link",
    open_attachment: "Open an attachment",
    install_app: "Install an app or allow access",
    share_personal_info: "Share personal information",
    trust_person: "Trust a person or identity",
    not_sure: "Not sure yet"
  };

  const sensitiveReminder =
    "Do not share passwords, one-time codes, full card numbers, private keys, or recovery phrases.";

  function normalize(value) {
    return String(value || "").trim();
  }

  function hasExplicitValue(value, fallback) {
    const normalized = normalize(value);
    return normalized && normalized !== fallback;
  }

  function inferSourceType(content, provided) {
    if (hasExplicitValue(provided, "other")) {
      return provided;
    }

    if (/\b(qr code|scan this qr|scan the qr)\b/i.test(content)) {
      return "qr";
    }

    if (/\b(attachment|attached|invoice attached|pdf|docx|zip file|shared document)\b/i.test(content)) {
      return "attachment";
    }

    if (/\b(email|subject line|inbox|sender address)\b/i.test(content)) {
      return "email";
    }

    if (/\b(called me|caller|phone call|voicemail|robocall|on the phone)\b/i.test(content)) {
      return "call";
    }

    if (/(https?:\/\/|www\.|bit\.ly|tinyurl|link|website)/i.test(content)) {
      return "link";
    }

    if (/\b(zelle|venmo|cash app|cashapp|paypal|wire|gift card|crypto|bitcoin|payment request)\b/i.test(content)) {
      return "payment";
    }

    if (/\b(text|texted me|chat|dm|message|messaged me)\b/i.test(content)) {
      return "message";
    }

    return normalize(provided) || "other";
  }

  function inferRequestedAction(content, provided) {
    if (hasExplicitValue(provided, "not_sure")) {
      return provided;
    }

    if (/\b(gift cards?|apple card|google play|steam card|prepaid card|send (me )?the card (numbers?|codes?))\b/i.test(content)) {
      return "buy_gift_cards";
    }

    if (/\b(one[- ]?time code|verification code|login code|reset code|password|passcode|private key|recovery phrase|2fa|mfa)\b/i.test(content)) {
      return "share_code";
    }

    if (/\b(anydesk|teamviewer|remote access|remote desktop|screen share|install|download this app|allow access)\b/i.test(content)) {
      return "install_app";
    }

    if (/\b(attachment|open the file|download the file|invoice attached|enable content|enable macros|zip file|apk file)\b/i.test(content)) {
      return "open_attachment";
    }

    if (/\b(click|tap|open this link|verify at|log in at|scan this qr|scan the qr|update billing|reactivate)\b/i.test(content)) {
      return "click_link";
    }

    if (/\b(ssn|social security|driver'?s license|full card number|bank login|date of birth|personal information|confirm your card)\b/i.test(content)) {
      return "share_personal_info";
    }

    if (/\b(pay|send money|send crypto|want(s)? (me to )?(send|pay|transfer)? ?(crypto|money|payment)|usdt|bitcoin|ethereum|transfer|wire|zelle|venmo|cash app|cashapp|refund|deposit this check|buy equipment|fee|payment)\b/i.test(content)) {
      if (!/\b(no payment|not asking for money|no money|no account information|no card information)\b/i.test(content)) {
        return "send_money";
      }
    }

    if (/\b(is this really|new number|cannot video call|pretending|says they are|claims to be|trust them)\b/i.test(content)) {
      return "trust_person";
    }

    return normalize(provided) || "not_sure";
  }

  function prepareAssessmentInput(item) {
    const content = normalize(item.content);
    const sourceType = inferSourceType(content, item.sourceType);
    const requestedAction = inferRequestedAction(content, item.requestedAction);

    return {
      ...item,
      content,
      sourceType,
      requestedAction,
      providedSourceType: normalize(item.sourceType),
      providedRequestedAction: normalize(item.requestedAction)
    };
  }

  function hasEnoughContext(item) {
    const contentLength = normalize(item.content).replace(/\s+/g, " ").length;
    const action = normalize(item.requestedAction);
    return contentLength >= 18 || (contentLength >= 8 && action && action !== "not_sure");
  }

  function getActionSignal(action) {
    const actionWeights = {
      send_money: 4,
      buy_gift_cards: 5,
      share_code: 5,
      click_link: 2,
      open_attachment: 2,
      install_app: 4,
      share_personal_info: 3,
      trust_person: 2,
      not_sure: 0
    };

    if (!action || action === "not_sure") {
      return null;
    }

    return {
      id: `action_${action}`,
      label: `Requested action: ${actionLabels[action] || action}`,
      weight: actionWeights[action] || 1,
      explanation:
        "This action matters because money, account access, downloads, and personal details can be hard to take back."
    };
  }

  function dedupeSignals(signals) {
    const seen = new Set();
    return signals.filter((signal) => {
      if (seen.has(signal.id)) {
        return false;
      }
      seen.add(signal.id);
      return true;
    });
  }

  function scoreToLevel(score, signals, item) {
    const content = normalize(item.content);

    if (!hasEnoughContext(item)) {
      return LEVELS.UNKNOWN;
    }

    const hasHighAttentionAction = signals.some((signal) =>
      [
        "action_send_money",
        "action_buy_gift_cards",
        "action_share_code",
        "action_install_app",
        "unusual_payment",
        "code_request",
        "remote_access",
        "secrecy",
        "fake_bank_alert",
        "fake_job_check",
        "marketplace_overpayment",
        "attachment_pressure",
        "qr_payment"
      ].includes(signal.id)
    );

    if (score >= 7 || (score >= 5 && hasHighAttentionAction)) {
      return LEVELS.HIGH;
    }

    if (score >= 3 || signals.length > 0) {
      return LEVELS.CAUTION;
    }

    if (content.length < 45 && normalize(item.requestedAction) === "not_sure") {
      return LEVELS.UNKNOWN;
    }

    return LEVELS.SAFE;
  }

  function buildMissingInformation(item, level, signals) {
    const missing = [];
    const content = normalize(item.content);
    const providedSource = normalize(item.providedSourceType || item.sourceType);
    const providedAction = normalize(item.providedRequestedAction || item.requestedAction);

    if (content.length < 45) {
      missing.push("Add the exact wording, who contacted you, and how they reached you if you can do that safely.");
    }

    if (!providedSource || providedSource === "other") {
      missing.push("If you know it, add where this came from: text, email, call, link, QR code, payment request, or file.");
    }

    if (!providedAction || providedAction === "not_sure") {
      missing.push("Describe what they want you to do next, such as pay, click, call, reply, open a file, or share information.");
    }

    if (level === LEVELS.CAUTION && !signals.some((signal) => signal.id === "impersonation")) {
      missing.push("The sender's real identity has not been independently verified.");
    }

    if (signals.some((signal) => signal.id === "suspicious_link")) {
      missing.push("The true destination of the link or QR code has not been verified through an official source.");
    }

    if (signals.some((signal) => signal.id === "unusual_payment")) {
      missing.push("It is not clear whether the payment request was verified through an official or already-trusted channel.");
    }

    return missing;
  }

  function buildInputSummary(item) {
    const content = normalize(item.content).replace(/\s+/g, " ");
    const shortContent = content.length > 180 ? `${content.slice(0, 177)}...` : content;

    return {
      naturalDescription: shortContent,
      inferredSourceType: item.sourceType,
      inferredRequestedAction: item.requestedAction,
      userProvidedSourceType: item.providedSourceType || "",
      userProvidedRequestedAction: item.providedRequestedAction || ""
    };
  }

  function buildDoNotDo(level, signals) {
    const items = [];

    if (level === LEVELS.HIGH) {
      items.push("Do not send money, buy gift cards, transfer crypto, or share login codes right now.");
      items.push("Do not click links, scan payment QR codes, open attachments, or install remote-access apps from this request.");
      items.push("Do not call phone numbers or use websites provided only in the suspicious message.");
    } else if (level === LEVELS.CAUTION) {
      items.push("Do not act from the message itself until you verify through a separate trusted contact method.");
    } else if (level === LEVELS.UNKNOWN) {
      items.push("Do not take the requested action until you have more context or a trusted person helps review it.");
    }

    if (signals.some((signal) => signal.id === "code_request")) {
      items.push("Do not share any one-time code, reset code, password, private key, or recovery phrase.");
    } else {
      items.push(sensitiveReminder);
    }

    return items;
  }

  function buildPrimaryGuidance(level) {
    if (level === LEVELS.HIGH) {
      return "Pause now. Do not send money, codes, gift cards, crypto, or account access from this request.";
    }

    if (level === LEVELS.CAUTION) {
      return "Slow down and verify through a separate trusted channel before acting.";
    }

    if (level === LEVELS.UNKNOWN) {
      return "Do not decide yet. Add more context or ask a trusted person to review it with you.";
    }

    return "No strong warning signs were found, but keep basic caution and use official channels.";
  }

  function buildReasoningSummary(level, signals) {
    if (level === LEVELS.UNKNOWN) {
      return "The details entered are too limited for Verivae to assess safely. This is a real outcome, not a failure.";
    }

    if (!signals.length) {
      return "The message did not match the MVP warning signs, but that does not prove it is safe.";
    }

    const signalNames = signals
      .filter((signal) => !signal.id.startsWith("action_"))
      .map((signal) => signal.label.toLowerCase());
    const actionSignal = signals.find((signal) => signal.id.startsWith("action_"));

    if (signalNames.length && actionSignal) {
      return `The requested action raised attention, and Verivae also found ${signalNames.join(", ")}.`;
    }

    if (signalNames.length) {
      return `Verivae found ${signalNames.join(", ")} in the information entered.`;
    }

    return "The requested action itself deserves caution because it could affect money, access, or personal information.";
  }

  function buildVerificationSteps(level, signals) {
    const steps = [
      "Contact the person or company using a phone number, app, or website you already trust.",
      "Slow down and ask someone you trust to review the request before you act."
    ];

    if (signals.some((signal) => signal.id === "suspicious_link")) {
      steps.push("Navigate to the official website yourself instead of using the link or QR code in the message.");
    }

    if (signals.some((signal) => signal.id === "impersonation")) {
      steps.push("Check the account or notice by signing in through the official app or typed website address.");
    }

    if (signals.some((signal) => signal.id === "fake_bank_alert")) {
      steps.push("Call the number on your card or bank statement, not a number from the alert.");
    }

    if (signals.some((signal) => signal.id === "fake_job_check")) {
      steps.push("Wait for any check to fully clear and verify the employer through an official company website before buying equipment or sending money.");
    }

    if (signals.some((signal) => signal.id === "marketplace_overpayment")) {
      steps.push("Keep marketplace payments and shipping inside the platform when possible, and avoid refunding extra money from an overpayment.");
    }

    if (signals.some((signal) => signal.id === "attachment_pressure")) {
      steps.push("Confirm the file through a known contact path before opening it, and do not enable macros or content.");
    }

    if (level === LEVELS.UNKNOWN) {
      steps.unshift("Add more details about who contacted you, what they asked for, and how they want you to pay or respond.");
    }

    return steps;
  }

  function buildRecommendedActions(level, signals) {
    if (level === LEVELS.HIGH) {
      return [
        "Pause the conversation and do not respond from the suspicious message.",
        "Save the evidence if it does not include passwords, codes, full card numbers, private keys, or recovery phrases.",
        "Use Recovery to organize bank, account, and password safety steps if you already acted.",
        "Ask a trusted helper to review a short summary before responding."
      ];
    }

    if (level === LEVELS.CAUTION) {
      return [
        "Verify independently before clicking, paying, or sharing information.",
        "Save the check if you may need to compare details later.",
        "Ask a trusted helper if the request involves money, accounts, or urgency."
      ];
    }

    if (level === LEVELS.UNKNOWN) {
      return [
        "Add who contacted you, what they asked for, and how they want you to respond.",
        "Include whether there is a link, file, QR code, payment method, code request, or deadline.",
        "Use trusted verification before deciding.",
        "Avoid sharing money, codes, passwords, or personal details while uncertain."
      ];
    }

    return [
      "Keep basic caution and use official channels for payments, account notices, and support.",
      "Save evidence only if you may need a record later."
    ];
  }

  function assessScamRisk(item) {
    const assessmentInput = prepareAssessmentInput(item);
    const content = assessmentInput.content;
    const actionSignal = getActionSignal(normalize(assessmentInput.requestedAction));
    const matchedSignals = signalRules
      .filter((rule) => rule.pattern.test(content))
      .map((rule) => ({
        id: rule.id,
        label: rule.label,
        weight: rule.weight,
        explanation: rule.explanation
      }));

    const signals = dedupeSignals(actionSignal ? [actionSignal, ...matchedSignals] : matchedSignals);
    const score = signals.reduce((total, signal) => total + signal.weight, 0);
    const level = scoreToLevel(score, signals, assessmentInput);
    const missingInformation = buildMissingInformation(assessmentInput, level, signals);
    const hasSensitiveContent = sensitivePatterns.some((pattern) => pattern.test(content));
    const confidence =
      level === LEVELS.UNKNOWN ? "Low" : signals.length >= 3 || content.length > 80 ? "Moderate" : "Limited";
    const primaryGuidance = buildPrimaryGuidance(level);
    const reasoningSummary = buildReasoningSummary(level, signals);
    const doNotDo = buildDoNotDo(level, signals);
    const safeVerificationSteps = buildVerificationSteps(level, signals);
    const recommendedNextActions = buildRecommendedActions(level, signals);
    const sourceType = normalize(assessmentInput.sourceType) || "other";
    const requestedAction = normalize(assessmentInput.requestedAction) || "not_sure";

    // Keep this shape close to what a future AI assessment service could return.
    return {
      id: `check-${Date.now()}`,
      checkedAt: new Date().toISOString(),
      assessmentVersion: "local-rules-v1",
      assessmentMode: "local_rules",
      inputSummary: buildInputSummary(assessmentInput),
      riskLevel: level,
      riskLabel: levelLabels[level],
      score,
      confidence,
      sourceType,
      sourceLabel: sourceLabels[sourceType] || sourceLabels.other,
      requestedAction,
      requestedActionLabel: actionLabels[requestedAction] || actionLabels.not_sure,
      detectedSignals: signals,
      explanation:
        level === LEVELS.UNKNOWN
          ? "Verivae does not have enough information to judge this safely yet."
          : signals.length
            ? "Verivae found warning signs that are common in scam attempts. This is a simulated MVP assessment, not a guarantee."
            : "Verivae did not find strong warning signs in the information provided, but this is not a guarantee of safety.",
      primaryGuidance,
      reasoningSummary,
      missingInformation,
      doNotDo,
      safeVerificationSteps,
      recommendedNextActions,
      judgment: {
        riskLevel: level,
        riskLabel: levelLabels[level],
        confidence,
        mainWarningSigns: signals.map((signal) => signal.label),
        why: reasoningSummary,
        safestNextSteps: safeVerificationSteps,
        whatNotToDo: doNotDo,
        missingInformation
      },
      shouldSaveEvidence: level !== LEVELS.SAFE || signals.length > 0,
      shouldUseRecovery: level === LEVELS.HIGH,
      shouldAskHelper: level === LEVELS.HIGH || level === LEVELS.UNKNOWN || score >= 4,
      sensitiveContentWarning: hasSensitiveContent
        ? `This check may include sensitive details. ${sensitiveReminder}`
        : ""
    };
  }

  function summarizeForEvidence(checkItem, result) {
    const signals = result.detectedSignals.map((signal) => signal.label).join(", ") || "No strong warning signs";
    const content = normalize(checkItem.content).replace(/\s+/g, " ");

    return {
      headline: `${result.riskLabel} - ${result.requestedActionLabel}`,
      riskLevel: result.riskLevel,
      riskLabel: result.riskLabel,
      confidence: result.confidence,
      source: result.sourceLabel,
      sourceType: result.sourceType,
      requestedAction: result.requestedActionLabel,
      requestedActionType: result.requestedAction,
      signals,
      warningSigns: result.detectedSignals.map((signal) => signal.label),
      guidance: result.primaryGuidance,
      checkedAt: result.checkedAt,
      originalExcerpt: content.length > 220 ? `${content.slice(0, 217)}...` : content,
      shouldSaveEvidence: result.shouldSaveEvidence,
      shouldUseRecovery: result.shouldUseRecovery,
      savedReminder: "Review before sharing. Remove passwords, codes, full card numbers, private keys, and recovery phrases."
    };
  }

  function hasSignal(result, id) {
    return Boolean(result?.detectedSignals?.some((signal) => signal.id === id));
  }

  function buildRecoveryPlan(result) {
    const baseSteps = [
      {
        title: "Stop the conversation for now",
        detail:
          "Do not reply, call back, click links, scan QR codes, open files, or follow instructions from the suspicious request.",
        priority: "First"
      },
      {
        title: "Do not send more money or codes",
        detail:
          "Pause any payment, gift card, crypto transfer, wire, verification code, password reset, or account-access request.",
        priority: "First"
      },
      {
        title: "Preserve useful evidence",
        detail:
          "Save screenshots, messages, links, usernames, phone numbers, payment details, dates, and your plain summary. Remove passwords, codes, full card numbers, private keys, and recovery phrases.",
        priority: "Next"
      },
      {
        title: "Ask a trusted person to sit with you",
        detail:
          "Scams are designed to create pressure. A calm second person can help you verify and slow the situation down.",
        priority: "Next"
      }
    ];

    const situationSteps = [];

    if (
      hasSignal(result, "fake_bank_alert") ||
      hasSignal(result, "unusual_payment") ||
      hasSignal(result, "qr_payment") ||
      hasSignal(result, "package_fee") ||
      hasSignal(result, "action_send_money") ||
      hasSignal(result, "action_buy_gift_cards")
    ) {
      situationSteps.push({
        title: "Contact the bank or payment app yourself",
        detail:
          "Use the official app, website you type yourself, or the number on your card or statement. Do not use contact details from the suspicious message.",
        priority: "Money"
      });
    }

    if (
      hasSignal(result, "code_request") ||
      hasSignal(result, "identity_verification") ||
      hasSignal(result, "action_share_code") ||
      hasSignal(result, "action_share_personal_info")
    ) {
      situationSteps.push({
        title: "Secure accounts through official settings",
        detail:
          "Change passwords only from official account settings, sign out of unfamiliar sessions if available, and turn on multi-factor authentication.",
        priority: "Account"
      });
    }

    if (hasSignal(result, "remote_access") || hasSignal(result, "action_install_app")) {
      situationSteps.push({
        title: "Review remote access carefully",
        detail:
          "Disconnect from the caller, close remote-access apps, uninstall tools you were pressured to install, and use trusted device-security guidance if you already allowed access.",
        priority: "Device"
      });
    }

    if (hasSignal(result, "attachment_pressure") || hasSignal(result, "action_open_attachment")) {
      situationSteps.push({
        title: "Treat the file as unverified",
        detail:
          "Do not reopen the file or enable macros/content. Confirm with the sender through a known contact path and use trusted security tools if you already opened it.",
        priority: "File"
      });
    }

    if (hasSignal(result, "fake_job_check")) {
      situationSteps.push({
        title: "Pause any job-check or equipment transaction",
        detail:
          "Do not send money back or buy equipment from a required vendor. Contact your bank if you deposited a check or moved money.",
        priority: "Job"
      });
    }

    if (hasSignal(result, "marketplace_overpayment")) {
      situationSteps.push({
        title: "Keep marketplace activity inside trusted channels",
        detail:
          "Do not refund overpayments or pay shipping agents. Use the marketplace support flow and avoid moving the conversation off-platform.",
        priority: "Marketplace"
      });
    }

    if (
      hasSignal(result, "suspicious_link") ||
      hasSignal(result, "qr_payment") ||
      hasSignal(result, "package_fee") ||
      hasSignal(result, "action_click_link")
    ) {
      situationSteps.push({
        title: "Verify links, QR codes, and deliveries separately",
        detail:
          "Go to the official app or website yourself. Do not use the link, QR code, or phone number from the suspicious request.",
        priority: "Link"
      });
    }

    if (hasSignal(result, "relationship_pressure")) {
      situationSteps.push({
        title: "Verify the person outside the pressure",
        detail:
          "Use a known phone number, video call, family contact, or trusted mutual contact before sending money or sharing private information.",
        priority: "Person"
      });
    }

    if (hasSignal(result, "too_good_to_be_true")) {
      situationSteps.push({
        title: "Do not add funds to the investment",
        detail:
          "Avoid sending more money, paying withdrawal fees, or trusting screenshots of profits until you verify the company through official sources.",
        priority: "Investment"
      });
    }

    const finalSteps = [
      {
        title: "Report suspicious activity when appropriate",
        detail:
          "Use official reporting channels for your bank, payment app, account provider, marketplace, carrier, or local non-emergency reporting. Verivae does not submit reports for you in MVP 1.",
        priority: "Later"
      },
      {
        title: "Be kind to yourself",
        detail:
          "Being targeted is not a personal failure. The safest next move is to slow down, preserve evidence, and get help from trusted people or official providers.",
        priority: "Care"
      }
    ];

    return {
      headline: result
        ? `Recovery steps for ${result.riskLabel.toLowerCase()}`
        : "General recovery steps",
      context: result
        ? `${result.requestedActionLabel} from ${result.sourceLabel}. Confidence: ${result.confidence}. ${result.primaryGuidance}`
        : "Use these steps if something may have gone wrong.",
      steps: [...baseSteps, ...situationSteps, ...finalSteps]
    };
  }

  function buildHelperSummary(checkItem, result) {
    const content = normalize(checkItem.content);
    const notes = normalize(checkItem.notes);
    const excerpt = content.length > 220 ? `${content.slice(0, 220)}...` : content;
    const warningSigns =
      result.detectedSignals.map((signal) => signal.label).join("; ") ||
      "None strong from the information entered.";
    const safeSteps = result.safeVerificationSteps.slice(0, 4).join("; ");
    const unclear =
      result.missingInformation.join("; ") ||
      "Nothing specific from this check, but the result is still not a guarantee.";

    return [
      "I need help reviewing a possible scam risk.",
      excerpt ? `What happened: "${excerpt}"` : "",
      `Source: ${result.sourceLabel || sourceLabels[checkItem.sourceType] || sourceLabels.other}.`,
      `Requested action: ${result.requestedActionLabel || actionLabels[checkItem.requestedAction] || actionLabels.not_sure}.`,
      `Verivae result: ${result.riskLabel}.`,
      `Confidence: ${result.confidence}.`,
      `Main guidance: ${result.primaryGuidance}`,
      `Why: ${result.reasoningSummary}`,
      `Warning signs: ${warningSigns}`,
      `Safest next steps: ${safeSteps}`,
      `What is still unclear: ${unclear}`,
      notes ? `My notes: ${notes}.` : "",
      "Before sharing this, I should remove passwords, one-time codes, full card numbers, bank login details, private keys, recovery phrases, and private account details.",
      "Please help me decide whether to pause, verify independently, contact my bank or payment app through official channels, or take recovery steps."
    ]
      .filter(Boolean)
      .join("\n");
  }

  const api = {
    LEVELS,
    assessScamRisk,
    buildHelperSummary,
    buildRecoveryPlan,
    summarizeForEvidence,
    sourceLabels,
    actionLabels
  };

  root.VerivaeDetection = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
