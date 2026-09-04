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
        /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly|\blink\b|\blinks?\b|qr code|scan this qr|scan the qr)/i,
      explanation: "Links and QR codes can hide the true destination or lead to fake login and payment pages."
    },
    {
      id: "impersonation",
      label: "Possible authority or company impersonation",
      weight: 2,
      pattern:
        /\b(bank|irs|social security|police|sheriff|fbi|support team|fraud department|church|pastor|charity|nonprofit|non-profit|donation office)\b|\b(amazon|paypal|apple|microsoft|netflix|usps|fedex|ups)\s+(support|account|security|billing|notice|delivery)\b|\b(from|with|claiming to be from|claims to be from|says they are from)\s+(amazon|paypal|apple|microsoft|netflix|usps|fedex|ups|a church|the church|my church|our church|a charity|the charity)\b/i,
      explanation: "Scammers often pretend to be a trusted organization or official."
    },
    {
      id: "unexpected_donation",
      label: "Unexpected donation or charity request",
      weight: 2,
      pattern:
        /\b(church|pastor|charity|nonprofit|non-profit|fundraiser|relief fund|mission trip|congregation)\b.*\b(donat(?:e|ion|ions)|give money|send money|contribute|offering|pledge)\b|\b(donat(?:e|ion|ions)|give money|send money|contribute|offering|pledge)\b.*\b(church|pastor|charity|nonprofit|non-profit|fundraiser|relief fund|mission trip|congregation)\b/i,
      explanation: "Unexpected donation requests should be verified through the organization directly, especially when the caller or sender is unfamiliar."
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
        /\b(verify (your|my|the) account|account will be suspended|account is locked|apple id is locked|confirm your identity|identity verification|security check|validate your login|confirm your card|update billing|reactivate your account)\b/i,
      explanation: "Account-verification messages can lead to fake login, payment, or identity forms."
    },
    {
      id: "payment_destination_change",
      label: "Changed payment destination or safe-account request",
      weight: 5,
      pattern:
        /\b(new|different|updated|changed|replacement)\s+(bank account|account number|routing number|payment details|wire instructions|vendor account)\b|\b(account|payment details|wire instructions)\s+(changed|updated)\b|\b(move|transfer|wire|send)\s+((my|your|the)\s+)?(money|funds|balance|rent|payment)\s+(to|into)\s+(a\s+)?(safe|secure|new|different)\s+(account|wallet)\b/i,
      explanation: "Requests to move money to a new destination or so-called safe account are high-attention payment-change patterns."
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

  const paymentRouteLabels = {
    gift_card: "Gift card",
    crypto: "Crypto",
    payment_app: "Payment app",
    wire_transfer: "Wire transfer",
    bank_transfer: "Bank transfer",
    card: "Credit or debit card",
    check: "Check",
    qr_payment: "QR payment",
    unknown: "Payment method unclear"
  };

  const exposureActionLabels = {
    not_sure: "Not sure yet",
    not_acted: "No, I paused before acting",
    replied: "I replied or kept talking",
    clicked_link: "I clicked a link or scanned a QR code",
    opened_file: "I opened a file or attachment",
    shared_info: "I shared personal or account information",
    shared_code: "I shared a login or verification code",
    paid_money: "I sent money, gift cards, crypto, or a payment",
    installed_app: "I installed an app or allowed remote access"
  };

  const paymentRoutePlaybooks = {
    gift_card: {
      focus: "Keep the card, receipt, packaging, photos, and messages together.",
      steps: [
        "Do not send any unused card codes or buy more cards.",
        "Contact the gift card issuer through its official website or phone number and ask whether the value can be frozen.",
        "Save the store receipt, card numbers shown on packaging, dates, amounts, and any messages asking for codes."
      ]
    },
    crypto: {
      focus: "Crypto transfers are often difficult to reverse, so preserve transaction details quickly.",
      steps: [
        "Do not send more crypto or pay a recovery service that asks for an upfront fee.",
        "If an exchange was involved, contact the exchange through official support and provide the transaction hash and wallet address.",
        "Save the coin/token, network, amount, date, transaction hash, receiving wallet address, website, and messages. Never share seed phrases or private keys."
      ]
    },
    payment_app: {
      focus: "Payment apps may have in-app dispute or report flows, but outcomes are not guaranteed.",
      steps: [
        "Do not send a second payment, refund an overpayment, or move the conversation off the official app.",
        "Open the payment app yourself and look for transaction reporting, support, or dispute options.",
        "Save usernames, payment handles, transaction IDs, dates, amounts, and screenshots without full bank or card numbers."
      ]
    },
    wire_transfer: {
      focus: "Wire transfers can move quickly, so contact the sending institution yourself as soon as possible.",
      steps: [
        "Do not follow any new instructions from the requester about recalling, redirecting, or fixing the transfer.",
        "Call your bank or wire provider using a number from your card, statement, or official website.",
        "Save the recipient name, destination bank, amount, date, confirmation number, and messages."
      ]
    },
    bank_transfer: {
      focus: "Bank transfers and account debits should be handled through official bank channels.",
      steps: [
        "Do not share online banking login details, one-time codes, or remote access with anyone claiming to help.",
        "Contact your bank from its official app, typed website, card, or statement.",
        "Save transaction dates, amounts, recipient details, account nickname, and messages, but not full account numbers or passwords."
      ]
    },
    card: {
      focus: "Card issuers may be able to review suspicious charges or replace a card.",
      steps: [
        "Do not enter the full card number into Verivae or a link from the suspicious message.",
        "Contact the card issuer through the official app, the number on the card, or a statement.",
        "Save merchant name, amount, date, last four digits only if useful, and screenshots of the suspicious request."
      ]
    },
    check: {
      focus: "Checks can appear available before they fully clear, especially in fake-job or overpayment scams.",
      steps: [
        "Do not send money back, buy equipment, forward funds, or spend money from a suspicious check.",
        "Contact your bank through official channels if you deposited or received instructions about a check.",
        "Save check images, sender details, deposit date, amount, job or buyer messages, and shipping/payment instructions."
      ]
    },
    qr_payment: {
      focus: "Payment QR codes can hide where money is going.",
      steps: [
        "Do not scan or pay from a QR code that appeared in an unexpected message, sticker, sign, or note.",
        "Use the official app or website for the service and type the address yourself when possible.",
        "Save a photo of the QR context, where you found it, the claimed payment reason, and any receipt or transaction screen."
      ]
    },
    unknown: {
      focus: "The payment method is not clear yet, so choose the safest general path.",
      steps: [
        "Do not pay, refund, transfer, or buy anything until the method and recipient are verified independently.",
        "Add whether the request involves gift cards, crypto, wire, bank transfer, payment app, card, check, QR code, or cash.",
        "Ask a trusted person to review the request before taking action."
      ]
    }
  };

  function normalize(value) {
    return String(value || "").trim();
  }

  function normalizeExposureActions(actions) {
    const values = Array.isArray(actions) ? actions : [actions];
    const valid = Object.keys(exposureActionLabels);
    const normalized = values
      .map((value) => normalize(value))
      .filter((value) => value && valid.includes(value));
    const meaningful = normalized.filter((value) => value !== "not_sure" && value !== "not_acted");

    if (meaningful.length) {
      return Array.from(new Set(meaningful));
    }

    if (normalized.includes("not_acted")) {
      return ["not_acted"];
    }

    return ["not_sure"];
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

    if (/(https?:\/\/|www\.|bit\.ly|tinyurl|link|website)/i.test(content) && !/\b(no links?|no link is included|no link included|without a link)\b/i.test(content)) {
      return "link";
    }

    if (/\b(zelle|venmo|cash app|cashapp|paypal|wire|wired|gift card|crypto|bitcoin|payment request|new bank account|safe account)\b/i.test(content)) {
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

    if (
      /\b(ask(?:ed|ing|s)?|request(?:ed|ing|s)?|want(?:ed|s)?|told me to|need me to|pressur(?:ed|ing|es) me to)\b.{0,50}\b(donat(?:e|ion|ions)|give money|contribute|offering|pledge)\b/i.test(content) &&
      !/\b(doesn't|does not|don't|do not|not normally|never normally)\b.{0,35}\b(ask|request)\b.{0,35}\b(donat(?:e|ion|ions)|give money|contribute|offering|pledge)\b/i.test(content)
    ) {
      return "send_money";
    }

    if (/\b(pay|send money|send crypto|want(s)? (me to )?(send|pay|transfer)? ?(crypto|money|payment)|usdt|bitcoin|ethereum|transfer|wire|wired|zelle|venmo|cash app|cashapp|refund|deposit this check|buy equipment|fee|payment|rent|new bank account|safe account|changed payment details|wire instructions)\b/i.test(content)) {
      if (!/\b(no payment|not asking for money|not asking me to pay|no money|no account information|no card information|menu only)\b/i.test(content)) {
        return "send_money";
      }
    }

    if (/\b(is this really|new number|cannot video call|pretending|says they are|claiming to be|claims to be|trust them|do not know anyone named|don't know anyone named)\b/i.test(content)) {
      return "trust_person";
    }

    return normalize(provided) || "not_sure";
  }

  function inferPaymentRoutes(content, action, signals) {
    const routes = [];
    const addRoute = (route) => {
      if (!routes.includes(route)) {
        routes.push(route);
      }
    };
    const hasSignal = (id) => signals.some((signal) => signal.id === id);

    if (/\b(gift cards?|apple card|google play|steam card|prepaid card|voucher|card codes?)\b/i.test(content) || action === "buy_gift_cards") {
      addRoute("gift_card");
    }

    if (/\b(crypto|bitcoin|ethereum|usdt|wallet address|blockchain|coinbase|binance|seed phrase|private key)\b/i.test(content)) {
      addRoute("crypto");
    }

    if (/\b(zelle|venmo|cash app|cashapp|paypal|friends and family|payment app)\b/i.test(content)) {
      addRoute("payment_app");
    }

    if (/\b(wire transfer|wired|wire the money|wire funds|western union|moneygram|bank wire)\b/i.test(content)) {
      addRoute("wire_transfer");
    }

    if (/\b(bank transfer|ach|routing number|account number|bank debit|direct debit)\b/i.test(content)) {
      addRoute("bank_transfer");
    }

    if (/\b(credit card|debit card|card number|update billing|confirm your card|card details)\b/i.test(content)) {
      addRoute("card");
    }

    if (/\b(check|cheque|cashier'?s check|certified check|mobile deposit|deposit this check)\b/i.test(content) || hasSignal("fake_job_check")) {
      addRoute("check");
    }

    if (/\b(qr code|scan this qr|scan the qr|payment qr|qr payment|parking ticket qr)\b/i.test(content) || hasSignal("qr_payment")) {
      addRoute("qr_payment");
    }

    if (!routes.length && (action === "send_money" || hasSignal("unusual_payment") || hasSignal("action_send_money"))) {
      addRoute("unknown");
    }

    return routes;
  }

  function inferExposureActions(content, provided) {
    const providedActions = normalizeExposureActions(provided);
    const explicitPaused = providedActions.length === 1 && providedActions[0] === "not_acted";

    const inferred = [];
    const add = (action) => {
      if (!inferred.includes(action)) {
        inferred.push(action);
      }
    };

    if (/\b(i|we)\s+(clicked|tapped|opened)\s+(the\s+|their\s+|a\s+)?(link|url)\b|\bscanned\s+(the\s+|their\s+|a\s+)?qr\b/i.test(content)) {
      add("clicked_link");
    }

    if (/\b(i|we)\s+(opened|downloaded)\s+(the\s+)?(attachment|file|invoice|pdf|zip|document)\b|\benabled\s+(content|macros|editing)\b/i.test(content)) {
      add("opened_file");
    }

    if (/\b(i|we)\s+(replied|responded|called back|kept talking|messaged them)\b/i.test(content)) {
      add("replied");
    }

    if (/\b(i|we)\s+(paid|sent money|sent crypto|wired|transferred|zelle(?:d)?|venmo(?:ed)?|sent gift cards?|bought gift cards?)\b/i.test(content)) {
      add("paid_money");
    }

    if (/\b((i|we)\s+)?(shared|gave|sent|read)\s+(them\s+)?(the\s+|a\s+)?(code|verification code|login code|one[- ]?time code|2fa|mfa)\b/i.test(content)) {
      add("shared_code");
    }

    if (/\b(i|we)\s+(shared|gave|entered|typed|sent)\s+(my\s+)?(ssn|social security|card details|bank details|account info|personal information|date of birth|address)\b/i.test(content)) {
      add("shared_info");
    }

    if (/\b(i|we)\s+(installed|downloaded)\s+(an\s+)?(app|anydesk|teamviewer)\b|\ballowed\s+(remote\s+)?access\b/i.test(content)) {
      add("installed_app");
    }

    if (/\b(i|we)\s+(did not|didn't|haven't|have not)\s+(click|pay|send|share|open|install|reply|respond)\b|\bpaused before\b/i.test(content)) {
      add("not_acted");
    }

    if (explicitPaused) {
      return providedActions;
    }

    return normalizeExposureActions([...providedActions, ...inferred]);
  }

  function buildPaymentPlaybooks(routes) {
    return routes.map((route) => ({
      route,
      label: paymentRouteLabels[route] || paymentRouteLabels.unknown,
      focus: paymentRoutePlaybooks[route]?.focus || paymentRoutePlaybooks.unknown.focus,
      steps: paymentRoutePlaybooks[route]?.steps || paymentRoutePlaybooks.unknown.steps
    }));
  }

  function prepareAssessmentInput(item) {
    const content = normalize(item.content);
    const sourceType = inferSourceType(content, item.sourceType);
    const requestedAction = inferRequestedAction(content, item.requestedAction);
    const exposureActions = inferExposureActions(content, item.exposureActions);

    return {
      ...item,
      content,
      sourceType,
      requestedAction,
      exposureActions,
      providedSourceType: normalize(item.sourceType),
      providedRequestedAction: normalize(item.requestedAction),
      providedExposureActions: normalizeExposureActions(item.exposureActions)
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

  function removeBenignContextSignals(signals, content) {
    const saysNoLink =
      /\b(no links?|no link is included|no link included|without a link)\b/i.test(content) &&
      !/(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly|qr code|scan this qr|scan the qr)/i.test(content);
    const menuOnlyQr =
      /\b(qr code|scan this qr|scan the qr)\b/i.test(content) &&
      /\b(menu only|for the menu only|menu)\b/i.test(content) &&
      /\b(not asking me to pay|no payment|not asking for money|not asking me to sign in|no sign[- ]?in|no login)\b/i.test(content);
    const officialOptionalFundraiser =
      /\b(school newsletter|official school website|official website|front office)\b/i.test(content) &&
      /\b(fundraiser|donat(?:e|ion|ions)|charity|gala)\b/i.test(content) &&
      /\b(optional|not asking for money|no payment is requested|front office)\b/i.test(content);

    return signals.filter((signal) => {
      if (saysNoLink && signal.id === "suspicious_link") {
        return false;
      }

      if (menuOnlyQr && (signal.id === "suspicious_link" || signal.id === "qr_payment")) {
        return false;
      }

      if (officialOptionalFundraiser && (signal.id === "suspicious_link" || signal.id === "unexpected_donation")) {
        return false;
      }

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

  function buildFollowUpQuestions(item, level, signals) {
    const questions = [];
    const content = normalize(item.content);
    const providedSource = normalize(item.providedSourceType || item.sourceType);
    const providedAction = normalize(item.providedRequestedAction || item.requestedAction);
    const hasSignal = (id) => signals.some((signal) => signal.id === id);
    const addQuestion = (id, prompt, hint) => {
      if (!questions.some((question) => question.id === id)) {
        questions.push({ id, prompt, hint });
      }
    };

    if (content.length < 80 || level === LEVELS.UNKNOWN) {
      addQuestion(
        "exact_words",
        "What exact words or instructions did they use?",
        "Paste or summarize safely. Do not include passwords, one-time codes, full card numbers, private keys, or recovery phrases."
      );
    }

    if (!providedSource || providedSource === "other") {
      addQuestion(
        "source",
        "How did this reach you?",
        "For example: text, email, phone call, social message, marketplace chat, QR code, website, or attachment."
      );
    }

    if (!providedAction || providedAction === "not_sure") {
      addQuestion(
        "requested_action",
        "What are they asking you to do next?",
        "For example: pay, buy gift cards, share a code, click a link, open a file, install an app, call a number, or trust a person. Do not include passwords or one-time codes."
      );
    }

    if (hasSignal("suspicious_link") || hasSignal("qr_payment") || hasSignal("package_fee")) {
      addQuestion(
        "link_destination",
        "What does the link or QR code claim to be for?",
        "Do not open it from the message. If needed, verify through the official app or a website you type yourself."
      );
    }

    if (
      hasSignal("unusual_payment") ||
      hasSignal("action_send_money") ||
      hasSignal("action_buy_gift_cards") ||
      hasSignal("fake_job_check") ||
      hasSignal("marketplace_overpayment")
    ) {
      addQuestion(
        "payment_method",
        "What payment method is involved, and who independently verified it?",
        "Say the type, such as gift card, crypto, payment app, wire, check, or card. Do not include full account or card numbers."
      );
    }

    if (
      hasSignal("code_request") ||
      hasSignal("identity_verification") ||
      hasSignal("action_share_code") ||
      hasSignal("remote_access") ||
      hasSignal("action_install_app")
    ) {
      addQuestion(
        "access_request",
        "Did they ask for a code, login, identity document, app install, screen share, or device access?",
        "Describe the request only. Do not enter the actual code, password, private key, recovery phrase, or full ID details."
      );
    }

    if (hasSignal("relationship_pressure") || hasSignal("impersonation")) {
      addQuestion(
        "identity_check",
        "Can you verify who they are using a contact method you already trusted before this request?",
        "Mention whether you can call, video chat, use an official app, or contact a mutual trusted person."
      );
    }

    if (level === LEVELS.HIGH || level === LEVELS.CAUTION) {
      addQuestion(
        "already_acted",
        "Have you already clicked, paid, shared information, opened a file, or installed anything?",
        "A yes/no summary is enough. Do not include secrets or complete financial details."
      );
    }

    if (!questions.length) {
      addQuestion(
        "verify_plan",
        "How will you verify this before acting?",
        "Use an official app, a typed website, a known phone number, or someone you already trust."
      );
    }

    return questions.slice(0, 5);
  }

  function summarizeFollowUpQuestions(questions) {
    return questions.map((question) => question.prompt);
  }

  function buildInputSummary(item, paymentRoutes = []) {
    const content = normalize(item.content).replace(/\s+/g, " ");
    const shortContent = content.length > 180 ? `${content.slice(0, 177)}...` : content;
    const exposureActions = normalizeExposureActions(item.exposureActions);

    return {
      naturalDescription: shortContent,
      inferredSourceType: item.sourceType,
      inferredRequestedAction: item.requestedAction,
      inferredPaymentRoutes: paymentRoutes,
      inferredExposureActions: exposureActions,
      userProvidedSourceType: item.providedSourceType || "",
      userProvidedRequestedAction: item.providedRequestedAction || "",
      userProvidedExposureActions: item.providedExposureActions || ["not_sure"]
    };
  }

  function getMeaningfulExposureActions(actions) {
    return normalizeExposureActions(actions).filter((action) => action !== "not_sure" && action !== "not_acted");
  }

  function getExposureLabels(actions) {
    return normalizeExposureActions(actions).map((action) => exposureActionLabels[action] || exposureActionLabels.not_sure);
  }

  function buildExposureSummary(actions) {
    const normalized = normalizeExposureActions(actions);
    const labels = getExposureLabels(normalized).join("; ");

    if (normalized.includes("not_acted")) {
      return "The user says they paused before acting. Focus on verification before any next step.";
    }

    if (getMeaningfulExposureActions(normalized).length) {
      return `The user may have already acted: ${labels}. Focus on stopping more harm and using official recovery paths.`;
    }

    return "It is not clear whether the user already acted. Ask for a safe yes/no summary before tailoring recovery steps.";
  }

  function buildDoNotDo(level, signals, exposureActions = ["not_sure"]) {
    const items = [];
    const acted = getMeaningfulExposureActions(exposureActions);

    if (acted.length) {
      items.push("Do not send more money, codes, files, account access, or personal information while you sort this out.");
      items.push("Do not delete messages, receipts, call logs, or account notices until you have saved safe evidence.");
    }

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

  function buildVerificationSteps(level, signals, exposureActions = ["not_sure"]) {
    const steps = [
      "Contact the person or company using a phone number, app, or website you already trust.",
      "Slow down and ask someone you trust to review the request before you act."
    ];
    const acted = getMeaningfulExposureActions(exposureActions);

    if (acted.includes("paid_money")) {
      steps.unshift("Open your bank or payment app yourself and ask what reporting, dispute, cancellation, or account-protection options are available.");
    }

    if (acted.includes("shared_code") || acted.includes("shared_info")) {
      steps.unshift("Go to official account settings yourself, change related passwords, review sessions, and turn on multi-factor authentication where available.");
    }

    if (acted.includes("clicked_link")) {
      steps.push("If you clicked a link or scanned a QR code, do not enter more information there. Use the official app or typed website instead.");
    }

    if (acted.includes("opened_file")) {
      steps.push("If you opened a file, do not reopen it or enable macros/content. Use trusted device-security guidance for your device.");
    }

    if (acted.includes("installed_app")) {
      steps.push("If you installed an app or allowed remote access, disconnect from the caller, close the app, and use official device-security settings or trusted support.");
    }

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

    if (signals.some((signal) => signal.id === "unexpected_donation")) {
      steps.push("Verify donation requests through the church, charity, or organization using a phone number, website, or person you already trust.");
    }

    if (signals.some((signal) => signal.id === "attachment_pressure")) {
      steps.push("Confirm the file through a known contact path before opening it, and do not enable macros or content.");
    }

    if (level === LEVELS.UNKNOWN) {
      steps.unshift("Add more details about who contacted you, what they asked for, and how they want you to pay or respond.");
    }

    return steps;
  }

  function buildRecommendedActions(level, signals, exposureActions = ["not_sure"]) {
    const acted = getMeaningfulExposureActions(exposureActions);

    if (level === LEVELS.HIGH) {
      const actions = [
        "Pause the conversation and do not respond from the suspicious message.",
        "Save the evidence if it does not include passwords, codes, full card numbers, private keys, or recovery phrases.",
        "Use Recovery to organize bank, account, and password safety steps if you already acted.",
        "Ask a trusted helper to review a short summary before responding."
      ];

      if (acted.length) {
        actions.unshift("Because you may have already acted, focus first on stopping additional harm and contacting official support yourself.");
      }

      return actions;
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

    const signals = dedupeSignals(removeBenignContextSignals(actionSignal ? [actionSignal, ...matchedSignals] : matchedSignals, content));
    const score = signals.reduce((total, signal) => total + signal.weight, 0);
    const level = scoreToLevel(score, signals, assessmentInput);
    const requestedAction = normalize(assessmentInput.requestedAction) || "not_sure";
    const exposureActions = normalizeExposureActions(assessmentInput.exposureActions);
    const paymentRoutes = inferPaymentRoutes(content, requestedAction, signals);
    const paymentPlaybooks = buildPaymentPlaybooks(paymentRoutes);
    const missingInformation = buildMissingInformation(assessmentInput, level, signals);
    const followUpQuestions = buildFollowUpQuestions(assessmentInput, level, signals);
    const hasSensitiveContent = sensitivePatterns.some((pattern) => pattern.test(content));
    const confidence =
      level === LEVELS.UNKNOWN ? "Low" : signals.length >= 3 || content.length > 80 ? "Moderate" : "Limited";
    const primaryGuidance = buildPrimaryGuidance(level);
    const reasoningSummary = buildReasoningSummary(level, signals);
    const exposureSummary = buildExposureSummary(exposureActions);
    const hasAlreadyActed = getMeaningfulExposureActions(exposureActions).length > 0;
    const doNotDo = buildDoNotDo(level, signals, exposureActions);
    const safeVerificationSteps = buildVerificationSteps(level, signals, exposureActions);
    const recommendedNextActions = buildRecommendedActions(level, signals, exposureActions);
    const sourceType = normalize(assessmentInput.sourceType) || "other";

    // Keep this shape close to what a future AI assessment service could return.
    return {
      id: `check-${Date.now()}`,
      checkedAt: new Date().toISOString(),
      assessmentVersion: "local-rules-v1",
      assessmentMode: "local_rules",
      inputSummary: buildInputSummary(assessmentInput, paymentRoutes),
      riskLevel: level,
      riskLabel: levelLabels[level],
      score,
      confidence,
      sourceType,
      sourceLabel: sourceLabels[sourceType] || sourceLabels.other,
      requestedAction,
      requestedActionLabel: actionLabels[requestedAction] || actionLabels.not_sure,
      exposureActions,
      exposureActionLabels: getExposureLabels(exposureActions),
      exposureSummary,
      hasAlreadyActed,
      paymentRoutes,
      paymentRouteLabels: paymentRoutes.map((route) => paymentRouteLabels[route] || paymentRouteLabels.unknown),
      paymentPlaybooks,
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
      followUpQuestions,
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
        missingInformation,
        followUpQuestions: summarizeFollowUpQuestions(followUpQuestions),
        exposureSummary,
        exposureActions: getExposureLabels(exposureActions),
        paymentPlaybooks
      },
      shouldSaveEvidence: level !== LEVELS.SAFE || signals.length > 0 || hasAlreadyActed,
      shouldUseRecovery: level === LEVELS.HIGH || hasAlreadyActed,
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
      exposureActions: result.exposureActions || ["not_sure"],
      exposureActionLabels: result.exposureActionLabels || [exposureActionLabels.not_sure],
      exposureSummary: result.exposureSummary || "",
      paymentRoutes: result.paymentRoutes || [],
      paymentRouteLabels: result.paymentRouteLabels || [],
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
    const exposureActions = normalizeExposureActions(result?.exposureActions);
    const acted = getMeaningfulExposureActions(exposureActions);
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

    if (acted.length) {
      situationSteps.push({
        title: "Switch from prevention to recovery mode",
        detail:
          "You may have already acted. Focus on stopping additional harm, using official support paths, and saving a calm record of what happened.",
        priority: "First"
      });
    }

    if (acted.includes("replied")) {
      situationSteps.push({
        title: "End the conversation without explaining more",
        detail:
          "Stop replying from that thread. You do not need to prove anything to the other person, and more conversation can create more pressure.",
        priority: "Contact"
      });
    }

    if (acted.includes("clicked_link")) {
      situationSteps.push({
        title: "Treat the link or QR page as untrusted",
        detail:
          "Close it, do not enter more information, and use the official app or a website you type yourself to check the account or payment.",
        priority: "Link"
      });
    }

    if (acted.includes("opened_file")) {
      situationSteps.push({
        title: "Handle the file carefully",
        detail:
          "Do not reopen it or enable content. Use trusted device-security guidance for your device and preserve the original message if safe.",
        priority: "File"
      });
    }

    if (acted.includes("paid_money")) {
      situationSteps.push({
        title: "Contact the payment provider quickly",
        detail:
          "Open the bank, card, payment app, wire service, marketplace, or gift card issuer yourself and ask what reporting, dispute, freeze, or fraud options are available.",
        priority: "Money"
      });
    }

    if (acted.includes("shared_info") || acted.includes("shared_code")) {
      situationSteps.push({
        title: "Protect affected accounts",
        detail:
          "Use official account settings to change related passwords, review recent activity, sign out unfamiliar sessions, and turn on multi-factor authentication where available.",
        priority: "Account"
      });
    }

    if (acted.includes("installed_app")) {
      situationSteps.push({
        title: "Cut off remote access",
        detail:
          "Disconnect from the caller, close or uninstall the pressured app if you can do so safely, and use trusted device-security support for your device.",
        priority: "Device"
      });
    }

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

    if (hasSignal(result, "unexpected_donation")) {
      situationSteps.push({
        title: "Verify the donation request through the organization",
        detail:
          "Call the church, charity, or nonprofit using a number or website you already trust, or ask someone you personally know there before donating.",
        priority: "Donation"
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
    const alreadyActedTitles = new Set([
      "Switch from prevention to recovery mode",
      "End the conversation without explaining more",
      "Treat the link or QR page as untrusted",
      "Handle the file carefully",
      "Contact the payment provider quickly",
      "Protect affected accounts",
      "Cut off remote access"
    ]);

    return {
      headline: result
        ? `Recovery steps for ${result.riskLabel.toLowerCase()}`
        : "General recovery steps",
      context: result
        ? `${result.requestedActionLabel} from ${result.sourceLabel}. Confidence: ${result.confidence}. ${result.primaryGuidance} ${result.exposureSummary || ""}`
        : "Use these steps if something may have gone wrong.",
      exposureSummary: result?.exposureSummary || "Run a scam check to tailor this workspace to what happened.",
      exposureActions,
      exposureActionLabels: getExposureLabels(exposureActions),
      paymentPlaybooks: result?.paymentPlaybooks || [],
      groups: [
        {
          title: "First moves",
          description: "Do these before replying, paying, deleting, or clicking anything else.",
          steps: baseSteps
        },
        {
          title: acted.length ? "Because you already acted" : "If you already acted",
          description: acted.length
            ? "These steps match the action status Verivae noticed from your latest check."
            : "Use these if you later realize you clicked, paid, shared information, opened a file, or installed something.",
          steps: acted.length
            ? situationSteps.filter((step) => alreadyActedTitles.has(step.title))
            : [
                {
                  title: "Come back and add what happened",
                  detail:
                    "A safe yes/no summary is enough. Do not enter passwords, codes, full card numbers, bank login details, private keys, or recovery phrases.",
                  priority: "If needed"
                },
                {
                  title: "Use official support if money or access was involved",
                  detail:
                    "Open the bank, payment app, account provider, or device settings yourself. Do not use links or phone numbers from the suspicious request.",
                  priority: "If needed"
                }
              ]
        },
        {
          title: "Situation-specific steps",
          description: "These are based on the warning signs Verivae found in the latest check.",
          steps: situationSteps.filter((step) => !alreadyActedTitles.has(step.title))
        },
        {
          title: "Follow-through",
          description: "Use these to stay organized after the immediate risk is slowed down.",
          steps: finalSteps
        }
      ],
      steps: [...baseSteps, ...situationSteps, ...finalSteps]
    };
  }

  function buildReportPrep(checkItem, result) {
    const content = normalize(checkItem?.content);
    const notes = normalize(checkItem?.notes);
    const excerpt = content.length > 360 ? `${content.slice(0, 357)}...` : content;
    const warningSigns =
      result.detectedSignals.map((signal) => signal.label).join("; ") ||
      "No strong warning signs from the information entered.";
    const paymentRoutes =
      result.paymentRouteLabels && result.paymentRouteLabels.length
        ? result.paymentRouteLabels.join("; ")
        : "Payment method not clear yet.";
    const exposureActions =
      result.exposureActionLabels && result.exposureActionLabels.length
        ? result.exposureActionLabels.join("; ")
        : exposureActionLabels.not_sure;
    const suggestedChannels = [
      {
        title: "Bank or card issuer",
        detail: "Use the official app, typed website, number on your card, or statement if money, cards, account access, or a bank alert may be involved."
      },
      {
        title: "Payment app, marketplace, carrier, or account provider",
        detail: "Use the official in-app support flow or verified website for the service involved. Do not use contact details from the suspicious message."
      },
      {
        title: "Official fraud or non-emergency reporting",
        detail: "Use government, local, or platform reporting paths only after verifying the destination yourself. Verivae does not submit reports in this MVP."
      }
    ];

    const evidenceChecklist = [
      "Plain summary of what happened and when",
      "Screenshots or copied text of suspicious messages",
      "Sender names, usernames, email addresses, phone numbers, websites, links, or QR context",
      "Payment method, amount, date, transaction ID, receipt, or confirmation number if relevant",
      "Account, marketplace, carrier, bank, payment app, or device involved",
      "What you already did, such as clicked, paid, replied, shared information, opened a file, or installed an app"
    ];

    const beforeSubmitting = [
      "Remove passwords, one-time codes, full card numbers, bank login details, private keys, recovery phrases, and unnecessary private account details.",
      "Use official contact channels you found yourself, not phone numbers or links from the suspicious request.",
      "Do not pay anyone who promises guaranteed recovery, crypto tracing, legal help, or refunds for an upfront fee.",
      "Keep copies of what you submit and who you contacted."
    ];

    const draft = [
      "Possible scam report preparation",
      excerpt ? `What happened: ${excerpt}` : "",
      notes ? `My notes: ${notes}` : "",
      `Verivae result: ${result.riskLabel}`,
      `Confidence: ${result.confidence}`,
      `Source: ${result.sourceLabel}`,
      `Requested action: ${result.requestedActionLabel}`,
      `Already acted: ${exposureActions}`,
      `Payment route: ${paymentRoutes}`,
      `Main warning signs: ${warningSigns}`,
      `Safest next steps: ${result.safeVerificationSteps.slice(0, 4).join("; ")}`,
      `What is still unclear: ${
        result.missingInformation.join("; ") ||
        "No specific gaps were flagged, but this is still based only on the details entered."
      }`,
      "I understand Verivae does not submit this report or guarantee refunds, recovery, legal outcomes, account recovery, or device cleanup."
    ]
      .filter(Boolean)
      .join("\n");

    return {
      title: `Report prep for ${result.riskLabel.toLowerCase()}`,
      summary: result.primaryGuidance,
      suggestedChannels,
      evidenceChecklist,
      beforeSubmitting,
      draft
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
    const paymentRoutes =
      result.paymentRouteLabels && result.paymentRouteLabels.length
        ? result.paymentRouteLabels.join("; ")
        : "No specific payment method identified yet.";
    const exposureActions =
      result.exposureActionLabels && result.exposureActionLabels.length
        ? result.exposureActionLabels.join("; ")
        : exposureActionLabels.not_sure;
    const unclear =
      result.missingInformation.join("; ") ||
      "Nothing specific from this check, but the result is still not a guarantee.";

    return [
      "I need help reviewing a possible scam risk.",
      excerpt ? `What happened: "${excerpt}"` : "",
      `Source: ${result.sourceLabel || sourceLabels[checkItem.sourceType] || sourceLabels.other}.`,
      `Requested action: ${result.requestedActionLabel || actionLabels[checkItem.requestedAction] || actionLabels.not_sure}.`,
      `Already acted: ${exposureActions}.`,
      `Verivae result: ${result.riskLabel}.`,
      `Confidence: ${result.confidence}.`,
      `Main guidance: ${result.primaryGuidance}`,
      `Why: ${result.reasoningSummary}`,
      `Payment route: ${paymentRoutes}`,
      `Current situation: ${result.exposureSummary || buildExposureSummary(result.exposureActions)}`,
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
    buildReportPrep,
    summarizeForEvidence,
    sourceLabels,
    actionLabels,
    exposureActionLabels
  };

  root.VerivaeDetection = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
