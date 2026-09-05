(function () {
  const app = document.querySelector("#app");
  const navItems = Array.from(document.querySelectorAll("[data-nav]"));
  const detection = window.VerivaeDetection;
  const storage = window.VerivaeStorage;

  const state = {
    currentCheck: null,
    currentResult: null,
    helperSummary: "",
    toast: "",
    vaultFilter: "all",
    caseFilter: "all",
    selectedCasePacketId: null,
    pendingSampleIndex: null
  };

  const routes = {
    home: renderHome,
    check: renderCheck,
    result: renderResult,
    vault: renderVault,
    case: renderCasePacket,
    recovery: renderRecovery,
    report: renderReportPrep,
    helper: renderHelper,
    education: renderEducation,
    settings: renderSettings
  };

  const sampleScenarios = [
    {
      title: "Gift card scam",
      sourceType: "message",
      requestedAction: "buy_gift_cards",
      content:
        "This is your manager. I need Apple gift cards urgently for a client. Do not tell anyone. Buy them now and send the card numbers and codes."
    },
    {
      title: "Fake bank fraud alert",
      sourceType: "call",
      requestedAction: "share_code",
      content:
        "Fraud department calling. There is an unauthorized charge on your account. Your debit card will be locked unless you read us the one-time verification code we just sent."
    },
    {
      title: "Package delivery scam",
      sourceType: "link",
      requestedAction: "click_link",
      content:
        "USPS: your package is held for a small unpaid fee. Pay today at https://bit.ly/fee-update or delivery fails."
    },
    {
      title: "Fake job or check scam",
      sourceType: "email",
      requestedAction: "send_money",
      content:
        "Welcome to your remote job. Mobile deposit this cashier's check, buy work equipment from our approved vendor, and send back anything left over today."
    },
    {
      title: "Marketplace buyer scam",
      sourceType: "message",
      requestedAction: "send_money",
      content:
        "I want to buy your couch on Facebook Marketplace. I overpaid by Zelle business, so refund the extra money to my shipping agent before pickup."
    },
    {
      title: "Romance emergency money request",
      sourceType: "message",
      requestedAction: "send_money",
      content:
        "I love you and I am stranded overseas after a hospital emergency. I cannot video call, but please send crypto right now and keep this between us."
    },
    {
      title: "Tech support remote access scam",
      sourceType: "email",
      requestedAction: "install_app",
      content:
        "Your computer has viruses. Install AnyDesk and allow our support team remote access so we can remove the threat."
    },
    {
      title: "Crypto investment scam",
      sourceType: "message",
      requestedAction: "send_money",
      content:
        "My mentor has a secret trading platform with guaranteed profit and daily returns. Send USDT crypto today to double your money before the window closes."
    },
    {
      title: "QR code payment scam",
      sourceType: "qr",
      requestedAction: "send_money",
      content:
        "A note on the parking meter says the old meter is broken. Scan this QR code to pay the parking ticket fee immediately."
    },
    {
      title: "Suspicious attachment",
      sourceType: "attachment",
      requestedAction: "open_attachment",
      content:
        "Please open the attached invoice zip file today and enable content so the document displays correctly."
    },
    {
      title: "Account verification code request",
      sourceType: "email",
      requestedAction: "share_code",
      content:
        "Security check: verify your account by replying with the login code we sent. If you do not respond today, your account will be suspended."
    },
    {
      title: "Ordinary low-risk message",
      sourceType: "message",
      requestedAction: "not_sure",
      content:
        "Hi, the neighborhood book club moved from Tuesday to Thursday at the library. No payment or account information is needed."
    },
    {
      title: "Unclear short message",
      sourceType: "other",
      requestedAction: "not_sure",
      content: "Can you help me with this?"
    }
  ];

  const educationCards = [
    {
      title: "Gift cards",
      body:
        "A real boss, agency, or support team should not need gift card numbers to solve an urgent problem.",
      example: "Example: Buy Apple or Google Play cards today and send the codes.",
      action: "Pause and verify with the person using a contact method you already trust."
    },
    {
      title: "Bank fraud alerts",
      body:
        "Fake bank alerts often use fear to get codes, transfers, or calls to a fake number.",
      example: "Example: Your card will be locked unless you read us the verification code.",
      action: "Use the number on your card, statement, or official app."
    },
    {
      title: "Delivery fees",
      body:
        "Small package fees can be used to collect card details or push you to a fake page.",
      example: "Example: USPS package held for a fee, pay through this short link.",
      action: "Open the carrier app or type the official website yourself."
    },
    {
      title: "Fake jobs and checks",
      body:
        "A check can appear in an account before it fully clears. Sending money back can create real loss.",
      example: "Example: Deposit this check, buy equipment, and refund the leftover money.",
      action: "Wait, verify the employer, and ask your bank before moving funds."
    },
    {
      title: "Marketplace deals",
      body:
        "Overpayments, business-account upgrade fees, and outside shipping agents are common warning signs.",
      example: "Example: I overpaid by Zelle business. Refund my shipping agent.",
      action: "Keep payments and messages inside the marketplace when possible."
    },
    {
      title: "Romance or emergencies",
      body:
        "Emotional pressure can make it hard to slow down, especially when someone says they cannot call or video chat.",
      example: "Example: I am stranded overseas. Send crypto now and keep it private.",
      action: "Verify the person through a known number, video call, or trusted mutual contact."
    },
    {
      title: "Tech support",
      body:
        "Unexpected support messages that ask for remote access can expose accounts, files, and payment apps.",
      example: "Example: Install AnyDesk so we can remove viruses from your device.",
      action: "Do not install remote-access apps from an unexpected request."
    },
    {
      title: "Crypto and investments",
      body:
        "Guaranteed returns, secret platforms, and withdrawal fees are high-attention signs.",
      example: "Example: Send USDT today to unlock daily guaranteed profit.",
      action: "Do not add funds or pay fees until you verify through independent sources."
    },
    {
      title: "QR codes",
      body:
        "QR codes can hide where a link or payment goes, especially on stickers, signs, or urgent notices.",
      example: "Example: Meter broken. Scan this QR code to pay the parking fee.",
      action: "Use the official app or typed website instead of the posted code."
    },
    {
      title: "Attachments",
      body:
        "Unexpected files can be risky, especially when the sender asks you to enable content or act fast.",
      example: "Example: Open this invoice zip and enable content today.",
      action: "Confirm through a known contact path before opening the file."
    }
  ];

  const privacyReminder =
    "Do not enter passwords, one-time codes, full card numbers, bank login details, private keys, or recovery phrases.";

  const sensitiveInfoReminder =
    "Remove passwords, one-time codes, full card numbers, bank login details, private keys, recovery phrases, and private account details.";

  const caseStatusOptions = {
    reviewing: "Reviewing",
    waiting_bank: "Waiting on bank",
    waiting_helper: "Waiting on helper",
    resolved: "Resolved",
    not_scam: "Not a scam"
  };

  const caseFilterOptions = {
    all: "All",
    high: "High risk",
    info: "Needs more info",
    progress: "In progress",
    resolved: "Resolved"
  };

  function routeName() {
    return (window.location.hash || "#home").replace("#", "") || "home";
  }

  function navigate(route) {
    window.location.hash = route;
  }

  function setToast(message) {
    state.toast = message;
    window.setTimeout(() => {
      state.toast = "";
      render();
    }, 2600);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) {
      return "Not saved yet";
    }
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function contextInferenceNote(result) {
    const summary = result?.inputSummary || {};
    const inferred = [];

    if (!summary.userProvidedSourceType && result?.sourceType && result.sourceType !== "other") {
      inferred.push("source");
    }

    if (
      !summary.userProvidedRequestedAction &&
      result?.requestedAction &&
      result.requestedAction !== "not_sure"
    ) {
      inferred.push("requested action");
    }

    return inferred.length
      ? `Verivae inferred ${inferred.join(" and ")} from the description.`
      : "Context is based on the saved check details.";
  }

  function signalSummary(result) {
    return (
      result.detectedSignals.map((signal) => signal.label).join(", ") ||
      "No strong warning signs from the information entered"
    );
  }

  function getLatestContext() {
    if (state.selectedCasePacketId) {
      const selectedPacket = storage.getCasePacket(state.selectedCasePacketId);
      if (selectedPacket) {
        return {
          checkItem: selectedPacket.checkItem,
          result: selectedPacket.result,
          evidenceSummary: selectedPacket.evidenceSummary,
          casePacket: selectedPacket
        };
      }
    }

    if (state.currentCheck && state.currentResult) {
      return {
        checkItem: state.currentCheck,
        result: state.currentResult,
        evidenceSummary: detection.summarizeForEvidence(state.currentCheck, state.currentResult),
        casePacket: null
      };
    }

    const latestEvidence = storage.getEvidence()[0];
    if (latestEvidence) {
      return latestEvidence;
    }

    const latestPacket = storage.getCasePackets()[0];
    if (latestPacket) {
      return {
        checkItem: latestPacket.checkItem,
        result: latestPacket.result,
        evidenceSummary: latestPacket.evidenceSummary,
        casePacket: latestPacket
      };
    }

    return null;
  }

  function buildCasePacket(context) {
    const result = context.result;
    const checkItem = context.checkItem;
    const evidenceSummary =
      context.evidenceSummary || detection.summarizeForEvidence(checkItem, result);
    const recoveryPlan = detection.buildRecoveryPlan(result);
    const existing = storage.getCasePacket(`case-${result.id}`);
    const taskProgress = existing?.taskProgress || {};
    const progressTotal = recoveryPlan.steps.length;
    const progressCompleted = recoveryPlan.steps.filter((_, index) => taskProgress[String(index)]).length;

    return {
      id: `case-${result.id}`,
      caseTitle: existing?.caseTitle || suggestCaseTitle(checkItem, result, evidenceSummary),
      status: existing?.status || "reviewing",
      statusLabel: caseStatusOptions[existing?.status] || caseStatusOptions.reviewing,
      caseNotes: existing?.caseNotes || "",
      createdAt: existing?.createdAt || result.checkedAt || new Date().toISOString(),
      savedAt: existing?.savedAt,
      checkItem,
      result,
      evidenceSummary,
      recoveryPlan,
      taskProgress,
      helperSummary: detection.buildHelperSummary(checkItem, result),
      timeline: [
        {
          title: "Scam check completed",
          at: result.checkedAt,
          detail: `${result.riskLabel} with ${result.confidence.toLowerCase()} confidence.`
        },
        {
          title: "Case workspace prepared",
          at: existing?.updatedAt || new Date().toISOString(),
          detail: "Local-only case with judgment, evidence notes, recovery steps, and helper summary."
        }
      ]
    };
  }

  function getCaseProgress(packet) {
    const steps = packet?.recoveryPlan?.steps || [];
    const progress = packet?.taskProgress || {};
    const completed = steps.filter((_, index) => progress[String(index)]).length;

    return {
      completed,
      total: steps.length,
      label: steps.length ? `${completed} of ${steps.length} recovery steps checked` : "No recovery steps available"
    };
  }

  function suggestCaseTitle(checkItem, result, evidenceSummary) {
    if (evidenceSummary?.headline) {
      return evidenceSummary.headline;
    }

    const source = result.sourceLabel || "Scam check";
    const action = result.requestedActionLabel || "review";
    return `${source}: ${action}`;
  }

  function caseNextAction(packet) {
    const progress = getCaseProgress(packet);
    const status = packet?.status || "reviewing";

    if (status === "resolved") {
      return "Review the saved notes and keep the case only as long as it is useful.";
    }

    if (status === "not_scam") {
      return "Keep the record if it helps you remember what you verified, or delete it when you no longer need it.";
    }

    if (status === "waiting_bank") {
      return "Wait for the bank or payment app response, and avoid follow-up links or numbers from the suspicious request.";
    }

    if (status === "waiting_helper") {
      return "Share only the safe helper summary with someone you personally trust.";
    }

    if (packet.result.riskLevel === "not_enough_information") {
      return "Add safer details about source, request, timing, and whether you already acted.";
    }

    if (progress.completed > 0) {
      return "Continue the recovery checklist and save brief notes about official contacts or verification.";
    }

    if (packet.result.shouldUseRecovery) {
      return "Start with the first recovery steps: stop contact, avoid more money or codes, and preserve evidence.";
    }

    return "Verify through a channel you choose yourself before responding or deleting the case.";
  }

  function caseMatchesFilter(packet, filter) {
    const progress = getCaseProgress(packet);
    const status = packet?.status || "reviewing";

    if (filter === "high") {
      return packet.result.riskLevel === "high_risk";
    }

    if (filter === "info") {
      return packet.result.riskLevel === "not_enough_information";
    }

    if (filter === "progress") {
      return !["resolved", "not_scam"].includes(status) && (["reviewing", "waiting_bank", "waiting_helper"].includes(status) || progress.completed > 0);
    }

    if (filter === "resolved") {
      return ["resolved", "not_scam"].includes(status);
    }

    return true;
  }

  function filterCases(cases) {
    return cases.filter((packet) => caseMatchesFilter(packet, state.caseFilter));
  }

  function caseFilterCount(cases, filter) {
    return cases.filter((packet) => caseMatchesFilter(packet, filter)).length;
  }

  function completedCaseTasks(packet) {
    const steps = packet?.recoveryPlan?.steps || [];
    const progress = packet?.taskProgress || {};
    return steps.filter((_, index) => progress[String(index)]);
  }

  function deriveCaseStatus(packet) {
    const progress = getCaseProgress(packet);

    if (packet.result.riskLevel === "not_enough_information") {
      return "Needs more information";
    }

    if (progress.total > 0 && progress.completed === progress.total) {
      return "Checklist reviewed";
    }

    if (progress.completed > 0) {
      return "Recovery in progress";
    }

    return packet.result.shouldUseRecovery ? "Recovery review" : "Reviewing";
  }

  function caseStatusLabel(packet) {
    return caseStatusOptions[packet?.status] || packet?.statusLabel || caseStatusOptions.reviewing;
  }

  function isCaseClosed(packet) {
    return ["resolved", "not_scam"].includes(packet?.status);
  }

  function casesNeedingRecovery(cases) {
    return cases.filter(
      (packet) =>
        !isCaseClosed(packet) &&
        (packet.result.shouldUseRecovery ||
          packet.result.riskLevel === "high_risk" ||
          packet.result.riskLevel === "caution")
    );
  }

  function latestOpenCase(cases) {
    return cases.find((packet) => !isCaseClosed(packet)) || null;
  }

  function renderSavedCaseCard(saved, activeId) {
    const progress = getCaseProgress(saved);
    const updatedAt = saved.updatedAt || saved.savedAt || saved.createdAt;
    const summary = saved.checkItem.content.slice(0, 112);
    const title = saved.caseTitle || suggestCaseTitle(saved.checkItem, saved.result, saved.evidenceSummary);
    const notesPreview = saved.caseNotes
      ? `<small class="case-notes-preview">Notes: ${escapeHtml(saved.caseNotes.slice(0, 112))}${saved.caseNotes.length > 112 ? "..." : ""}</small>`
      : `<small class="case-notes-preview muted-preview">No private notes added yet</small>`;

    return `
      <article class="case-list-item ${saved.id === activeId ? "selected" : ""}">
        <button class="case-picker" type="button" data-open-case="${escapeHtml(saved.id)}">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(summary)}${saved.checkItem.content.length > 112 ? "..." : ""}</span>
          <dl class="case-card-meta">
            <div>
              <dt>Status</dt>
              <dd>${escapeHtml(caseStatusLabel(saved))}</dd>
            </div>
            <div>
              <dt>Risk</dt>
              <dd>${escapeHtml(saved.result.riskLabel)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>${formatDate(updatedAt)}</dd>
            </div>
            <div>
              <dt>Checklist</dt>
              <dd>${progress.total ? `${progress.completed}/${progress.total}` : "Not started"}</dd>
            </div>
          </dl>
          <small class="case-next-action">Next: ${escapeHtml(caseNextAction(saved))}</small>
          ${notesPreview}
        </button>
        <button class="text-button danger-action" type="button" data-delete-case="${escapeHtml(saved.id)}">Delete</button>
      </article>
    `;
  }

  function getLatestCasePacket() {
    if (state.selectedCasePacketId) {
      const selectedPacket = storage.getCasePacket(state.selectedCasePacketId);
      if (selectedPacket) {
        return selectedPacket;
      }
      state.selectedCasePacketId = null;
    }

    const context = getLatestContext();
    if (context) {
      return buildCasePacket(context);
    }

    return storage.getCasePackets()[0] || null;
  }

  function pageShell(title, eyebrow, body, actions = "") {
    return `
      <section class="screen">
        <div class="screen-heading">
          <span class="eyebrow">${escapeHtml(eyebrow)}</span>
          <h1>${escapeHtml(title)}</h1>
        </div>
        ${body}
        ${actions ? `<div class="sticky-actions">${actions}</div>` : ""}
      </section>
      ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
    `;
  }

  function button(label, route, variant = "secondary") {
    return `<button class="btn ${variant}" type="button" data-route="${route}">${escapeHtml(label)}</button>`;
  }

  function renderHome() {
    const evidence = storage.getEvidence();
    const casePackets = storage.getCasePackets();
    const openCases = casePackets.filter((packet) => !isCaseClosed(packet));
    const recoveryCases = casesNeedingRecovery(casePackets);
    const infoNeededCases = openCases.filter(
      (packet) => packet.result.riskLevel === "not_enough_information"
    );
    const priorityCase = latestOpenCase(casePackets);
    const latest = evidence[0];
    const priorityTitle = priorityCase
      ? priorityCase.caseTitle ||
        suggestCaseTitle(priorityCase.checkItem, priorityCase.result, priorityCase.evidenceSummary)
      : "";

    return pageShell(
      "Your safety check-in",
      "Money and scam protection",
      `
        <section class="home-snapshot">
          <div class="snapshot-copy">
            <span class="result-kicker">Manual protection MVP</span>
            <h2>Check the situation before you send money, share codes, click links, or give access.</h2>
            <p>
              Verivae reviews what you type, looks for common scam warning signs, and helps you choose safer next steps. It does not connect to Gmail, SMS, banks, payment apps, or your device in this prototype.
            </p>
          </div>
          <div class="hero-actions">
            ${button("Check something suspicious", "check", "primary")}
            ${button("I already acted", "recovery")}
          </div>
          <p class="boundary-note">
            Verivae can help assess risk and organize next steps. It cannot guarantee scam detection, refunds, account recovery, legal outcomes, or device cleanup.
          </p>
        </section>

        <section class="home-metrics" aria-label="Local safety status">
          <article>
            <span class="metric-value">${openCases.length}</span>
            <span>Open cases</span>
          </article>
          <article>
            <span class="metric-value">${recoveryCases.length}</span>
            <span>Need follow-up</span>
          </article>
          <article>
            <span class="metric-value">${evidence.length}</span>
            <span>Evidence saved</span>
          </article>
        </section>

        <section class="priority-panel">
          ${
            priorityCase
              ? `<div class="priority-header">
                  <span class="result-kicker">Continue safely</span>
                  <span>${formatDate(priorityCase.updatedAt || priorityCase.savedAt || priorityCase.createdAt)}</span>
                </div>
                <h2>${escapeHtml(priorityTitle)}</h2>
                <p>${escapeHtml(caseNextAction(priorityCase))}</p>
                <dl class="compact-meta">
                  <div>
                    <dt>Status</dt>
                    <dd>${escapeHtml(caseStatusLabel(priorityCase))}</dd>
                  </div>
                  <div>
                    <dt>Risk</dt>
                    <dd>${escapeHtml(priorityCase.result.riskLabel)}</dd>
                  </div>
                  <div>
                    <dt>Progress</dt>
                    <dd>${escapeHtml(getCaseProgress(priorityCase).label)}</dd>
                  </div>
                </dl>
                <div class="panel-actions">
                  <button class="btn primary" type="button" data-open-case-route="${escapeHtml(priorityCase.id)}">Continue saved case</button>
                  ${button("Open recovery steps", "recovery")}
                </div>`
              : latest
                ? `<div class="priority-header">
                    <span class="result-kicker">Latest saved check</span>
                    <span>${formatDate(latest.savedAt)}</span>
                  </div>
                  <h2>${escapeHtml(latest.result.riskLabel)}</h2>
                  <p>${escapeHtml(latest.result.primaryGuidance)}</p>
                  <p class="evidence-situation">${escapeHtml(latest.checkItem.content.slice(0, 180))}${latest.checkItem.content.length > 180 ? "..." : ""}</p>
                  <div class="panel-actions">
                    ${button("Review evidence vault", "vault", "primary")}
                    ${button("Prepare helper summary", "helper")}
                  </div>`
                : `<span class="result-kicker">Ready when you are</span>
                  <h2>No saved cases yet</h2>
                  <p>Start with one suspicious message, call, payment request, link, QR code, or file concern. You can save evidence afterward if it is useful and does not contain secrets.</p>
                  ${button("Start first check", "check", "primary")}`
          }
        </section>

        <section class="home-followups" aria-label="What needs attention">
          <article class="${recoveryCases.length ? "attention" : ""}">
            <strong>${recoveryCases.length ? "Recovery steps may need attention" : "No urgent recovery tasks saved"}</strong>
            <span>${recoveryCases.length ? "Open Recovery to work through the safest next steps from your saved cases." : "If you already sent money, shared a code, or installed remote access, start Recovery right away."}</span>
            ${button("Open recovery", "recovery")}
          </article>
          <article class="${infoNeededCases.length ? "attention" : ""}">
            <strong>${infoNeededCases.length ? "Some cases need more details" : "Checks stay cautious when details are limited"}</strong>
            <span>${infoNeededCases.length ? "Add safe details like source, request, timing, and whether you already acted." : "Verivae will avoid calling something definitely safe when it does not know enough."}</span>
            ${button("Review cases", "case")}
          </article>
        </section>

        <section class="list-block">
          <div class="section-title-row">
            <h2>Common situations Verivae can review</h2>
            <button class="text-button" type="button" data-route="education">Learn more</button>
          </div>
          <div class="scenario-list compact-scenarios">
            <article class="scenario-card">
              <strong>Unexpected money requests</strong>
              <span>Gift cards, crypto, wire transfers, payment apps, refund requests, donations, or changed instructions.</span>
            </article>
            <article class="scenario-card">
              <strong>Account or bank warnings</strong>
              <span>Urgent verification, login codes, passwords, card details, or calls to numbers from the message.</span>
            </article>
            <article class="scenario-card">
              <strong>Suspicious link, QR code, or file</strong>
              <span>Delivery fees, fake billing pages, payment QR codes, unexpected attachments, or enable-content prompts.</span>
            </article>
            <article class="scenario-card">
              <strong>Impersonation or pressure</strong>
              <span>New-number emergencies, romance requests, fake support calls, marketplace pressure, or unfamiliar charity contacts.</span>
            </article>
          </div>
        </section>

        <section class="home-secondary" aria-label="Other Verivae tools">
          <article>
            <strong>Evidence vault</strong>
            <span>Review local saved evidence and delete anything you no longer need.</span>
            ${button("Open vault", "vault")}
          </article>
          <article>
            <strong>Trusted helper</strong>
            <span>Prepare a copyable summary that leaves out sensitive secrets.</span>
            ${button("Prepare summary", "helper")}
          </article>
          <article>
            <strong>Privacy settings</strong>
            <span>See what this prototype saves locally and what it does not access.</span>
            ${button("Open settings", "settings")}
          </article>
        </section>
      `
    );
  }

  function renderCheck() {
    const sources = Object.entries(detection.sourceLabels)
      .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
      .join("");
    const actions = Object.entries(detection.actionLabels)
      .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
      .join("");
    const exposureOptions = Object.entries(detection.exposureActionLabels)
      .map(
        ([value, label]) => `
          <label class="choice-row">
            <input type="checkbox" name="exposureActions" value="${value}">
            <span>${escapeHtml(label)}</span>
          </label>
        `
      )
      .join("");

    return pageShell(
      "Tell Verivae what happened",
      "Local judgment check",
      `
        <form id="check-form" class="form-card judgment-form">
          <label class="primary-input">
            Tell Verivae what happened
            <textarea
              name="content"
              rows="9"
              minlength="8"
              placeholder="Paste a message, or describe a call, email, link, QR code, file, payment request, or person asking you to act..."
              required
            ></textarea>
            <small>Write naturally. Include who contacted you, what they want, whether there is a deadline, and what feels off.</small>
          </label>

          <div class="notice">
            ${privacyReminder}
          </div>

          <details class="optional-details">
            <summary>Add optional context</summary>
            <div class="optional-grid">
              <label>
                Where did this come from?
                <select name="sourceType">
                  <option value="" selected>Let Verivae infer if possible</option>
                  ${sources}
                </select>
              </label>

              <label>
                What are you being asked to do?
                <select name="requestedAction">
                  <option value="" selected>Let Verivae infer if possible</option>
                  ${actions}
                </select>
              </label>

              <label>
                Optional notes
                <input name="notes" type="text" placeholder="Example: They said not to tell anyone.">
              </label>
            </div>

            <fieldset class="choice-panel">
              <legend>Have you already acted?</legend>
              <p>Optional. Check any that apply, or let Verivae infer from what you wrote.</p>
              <div class="choice-list">
                ${exposureOptions}
              </div>
            </fieldset>
          </details>

          <button class="btn primary" type="submit">Judge scam risk</button>
        </form>

        <section class="list-block">
          <h2>Try a realistic sample</h2>
          <div class="sample-list">
            ${sampleScenarios
              .map(
                (sample, index) =>
                  `<button class="sample-button" type="button" data-sample="${index}">
                    <strong>${escapeHtml(sample.title)}</strong>
                    <span>${escapeHtml(sample.content.slice(0, 84))}...</span>
                  </button>`
              )
              .join("")}
          </div>
        </section>
      `
    );
  }

  function levelClass(level) {
    return {
      likely_safe: "safe",
      caution: "caution",
      high_risk: "high",
      not_enough_information: "unknown"
    }[level];
  }

  function renderList(items) {
    if (!items || !items.length) {
      return `<p class="muted">None found from the information entered.</p>`;
    }

    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderMissingInformation(result) {
    const items = result.missingInformation.length
      ? result.missingInformation
      : ["No specific gaps were flagged, but this result is still based only on the details you entered."];

    return `
      <section class="plain-panel">
        <h2>What information is missing</h2>
        ${renderList(items)}
      </section>
    `;
  }

  function renderGuidedReview(result) {
    const questions = result.followUpQuestions || [];
    const intro =
      result.riskLevel === "not_enough_information"
        ? "Answering a few safer questions can help Verivae judge the situation with less guesswork."
        : "If anything important is missing, add it here and Verivae will re-check the situation.";

    return `
      <section class="guided-review">
        <div>
          <h2>Add safer details</h2>
          <p>${escapeHtml(intro)}</p>
        </div>
        <div class="follow-up-list">
          ${questions
            .map(
              (question) => `
                <article class="follow-up-card">
                  <strong>${escapeHtml(question.prompt)}</strong>
                  <small>${escapeHtml(question.hint)}</small>
                </article>
              `
            )
            .join("")}
        </div>
        <form id="guided-review-form" class="guided-review-form">
          <label>
            Add what you know
            <textarea
              name="followUp"
              rows="5"
              placeholder="Example: It came by text, they want me to call a number in the message, and I have not clicked or paid."
              required
            ></textarea>
            <small>${privacyReminder}</small>
          </label>
          <button class="btn primary" type="submit">Check again with these details</button>
        </form>
      </section>
    `;
  }

  function renderSignalList(signals) {
    if (!signals.length) {
      return `<p class="muted">No strong warning signs found. Keep basic caution and verify unusual requests.</p>`;
    }

    return signals
      .map(
        (signal) => `
          <article class="signal-card">
            <strong>${escapeHtml(signal.label)}</strong>
            <p>${escapeHtml(signal.explanation)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderPaymentPlaybooks(playbooks = []) {
    if (!playbooks.length) {
      return "";
    }

    return `
      <section class="plain-panel">
        <h2>Payment-specific recovery notes</h2>
        <p>These notes depend on the payment route Verivae noticed. They help you prepare for official support, but they do not guarantee a refund or reversal.</p>
        <div class="playbook-list">
          ${playbooks
            .map(
              (playbook) => `
                <article class="playbook-card">
                  <span class="playbook-tag">${escapeHtml(playbook.label)}</span>
                  <strong>${escapeHtml(playbook.focus)}</strong>
                  ${renderList(playbook.steps)}
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderRecoveryGroups(groups = [], casePacket = null) {
    let flatTaskIndex = 0;

    return `
      <section class="recovery-groups">
        ${groups
          .filter((group) => group.steps.length)
          .map(
            (group, groupIndex) => `
              <article class="recovery-group">
                <div>
                  <h2>${escapeHtml(group.title)}</h2>
                  <p>${escapeHtml(group.description)}</p>
                </div>
                <div class="checklist">
                  ${group.steps
                    .map(
                      (task, taskIndex) => {
                        const caseTaskIndex = flatTaskIndex;
                        const checked = casePacket?.taskProgress?.[String(caseTaskIndex)];
                        flatTaskIndex += 1;

                        return `
                          <label class="task-row">
                            <input type="checkbox" ${
                              casePacket
                                ? `data-case-task="${caseTaskIndex}" data-case-id="${escapeHtml(casePacket.id)}" ${checked ? "checked" : ""}`
                                : `data-recovery-task="${groupIndex}-${taskIndex}"`
                            }>
                            <span>
                              <strong>${escapeHtml(task.title)}</strong>
                              <small>${escapeHtml(task.priority)} - ${escapeHtml(task.detail)}</small>
                            </span>
                          </label>
                        `;
                      }
                    )
                    .join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderReportPrep() {
    const context = getLatestContext();
    const prep = context ? detection.buildReportPrep(context.checkItem, context.result) : null;

    if (!prep) {
      return pageShell(
        "Report prep",
        "Local-only draft",
        `
          <section class="empty-state">
            <h2>No report draft yet</h2>
            <p>Run a scam check first. Verivae can then prepare a local draft and checklist you can review before contacting official support or reporting channels yourself.</p>
            <p class="fine-print">Verivae does not submit reports, contact providers, or send your evidence in this MVP.</p>
            ${button("Start a scam check", "check", "primary")}
          </section>
        `
      );
    }

    return pageShell(
      "Report prep",
      "Local-only draft",
      `
        <section class="notice">
          Verivae does not submit reports or contact anyone for you. Use official channels you verify yourself, and ${sensitiveInfoReminder.toLowerCase()}
        </section>

        <section class="plain-panel">
          <h2>${escapeHtml(prep.title)}</h2>
          <p>${escapeHtml(prep.summary)}</p>
          <dl class="evidence-meta">
            <div>
              <dt>Risk</dt>
              <dd>${escapeHtml(context.result.riskLabel)}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>${escapeHtml(context.result.confidence)}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>${escapeHtml(context.result.paymentRouteLabels?.join(", ") || "Unclear")}</dd>
            </div>
            <div>
              <dt>Already acted?</dt>
              <dd>${escapeHtml(context.result.exposureActionLabels?.join(", ") || "Not sure yet")}</dd>
            </div>
          </dl>
        </section>

        <section class="report-grid">
          <article class="plain-panel">
            <h2>Where to start</h2>
            <div class="report-card-list">
              ${prep.suggestedChannels
                .map(
                  (channel) => `
                    <article class="report-card">
                      <strong>${escapeHtml(channel.title)}</strong>
                      <p>${escapeHtml(channel.detail)}</p>
                    </article>
                  `
                )
                .join("")}
            </div>
          </article>

          <article class="plain-panel">
            <h2>Evidence to gather</h2>
            ${renderList(prep.evidenceChecklist)}
          </article>
        </section>

        <section class="plain-panel">
          <h2>Before you submit anywhere</h2>
          ${renderList(prep.beforeSubmitting)}
        </section>

        <section class="form-card helper-card">
          <label>
            Draft to review and copy
            <textarea id="report-summary" rows="12">${escapeHtml(prep.draft)}</textarea>
          </label>
          <div class="notice">
            Copying only puts this draft on your clipboard. Verivae does not send it anywhere.
          </div>
          <button class="btn primary" type="button" data-action="copy-report">Copy report draft</button>
        </section>
      `,
      `
        <button class="btn primary" type="button" data-action="copy-report">Copy report draft</button>
        <button class="btn secondary" type="button" data-route="case">Open cases</button>
        <button class="btn secondary" type="button" data-route="recovery">Open recovery steps</button>
        <button class="btn secondary" type="button" data-route="helper">Prepare helper summary</button>
      `
    );
  }

  function renderResultDecisions(result) {
    const decisions = [
      {
        title: result.shouldUseRecovery ? "Open recovery steps" : "Recovery is optional",
        body: result.shouldUseRecovery
          ? "Use a calm checklist if you clicked, paid, shared a code, opened a file, installed an app, or feel unsure what happened."
          : "This result does not automatically mean recovery is required, but the checklist is available if you already acted.",
        action: "Open recovery",
        route: "recovery",
        priority: result.shouldUseRecovery
      },
      {
        title: "Save a local case",
        body:
          "Create one local workspace with what happened, the risk judgment, recovery tasks, evidence notes, and helper summary.",
        action: "Save case",
        dataAction: "save-case",
        priority: !result.shouldUseRecovery
      },
      {
        title: result.shouldSaveEvidence ? "Save evidence" : "Evidence is optional",
        body: result.shouldSaveEvidence
          ? "Save a local record only after removing passwords, codes, full card numbers, bank login details, private keys, and recovery phrases."
          : "Saving is optional. Use it only if you want a local record of the check.",
        action: "Save evidence",
        dataAction: "save-evidence",
        priority: false
      },
      {
        title: "Ask a trusted helper",
        body:
          "Prepare a copyable summary you can review first. Verivae does not send it automatically.",
        action: "Prepare summary",
        route: "helper",
        priority: false
      }
    ];

    return `
      <section class="plain-panel action-recommendations">
        <div class="section-title-row">
          <h2>What to do next</h2>
          <button class="text-button" type="button" data-route="check">Run another check</button>
        </div>
        <div class="decision-grid">
          ${decisions
            .map(
              (decision) => `
                <article class="decision-card ${decision.priority ? "priority" : ""}">
                  <div>
                    <strong>${escapeHtml(decision.title)}</strong>
                    <p>${escapeHtml(decision.body)}</p>
                  </div>
                  ${
                    decision.dataAction
                      ? `<button class="btn ${decision.priority ? "primary" : "secondary"}" type="button" data-action="${decision.dataAction}">${escapeHtml(decision.action)}</button>`
                      : `<button class="btn ${decision.priority ? "primary" : "secondary"}" type="button" data-route="${decision.route}">${escapeHtml(decision.action)}</button>`
                  }
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function confidenceDescription(confidence) {
    if (confidence === "Low") {
      return "Low confidence means Verivae needs more details before it can give useful guidance.";
    }

    if (confidence === "Limited") {
      return "Limited confidence means Verivae found a small amount of signal. Verify before acting.";
    }

    return "Moderate confidence means Verivae found enough signal to explain a direction, but it is still not a guarantee.";
  }

  function renderResult() {
    const result = state.currentResult;
    const checkItem = state.currentCheck;

    if (!result || !checkItem) {
      return pageShell(
        "No result yet",
        "Scam result",
        `
          <section class="empty-state">
            <h2>Run a manual check first</h2>
            <p>The result screen will explain risk, warning signs, missing information, and safer next steps.</p>
            ${button("Start a scam check", "check", "primary")}
          </section>
        `
      );
    }

    return pageShell(
      "Verivae judgment",
      "Local rules assessment",
      `
        <section class="result-summary ${levelClass(result.riskLevel)}">
          <span class="result-kicker">Risk level</span>
          <h2>${escapeHtml(result.riskLabel)}</h2>
          <p class="primary-guidance">${escapeHtml(result.primaryGuidance)}</p>
          <p class="fine-print">${escapeHtml(confidenceDescription(result.confidence))}</p>
          <dl>
            <div>
              <dt>Confidence</dt>
              <dd>${escapeHtml(result.confidence)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>${escapeHtml(result.sourceLabel)}</dd>
            </div>
            <div>
              <dt>Action</dt>
              <dd>${escapeHtml(result.requestedActionLabel)}</dd>
            </div>
            <div>
              <dt>Already acted?</dt>
              <dd>${escapeHtml(result.exposureActionLabels?.join(", ") || "Not sure yet")}</dd>
            </div>
          </dl>
        </section>

        ${result.sensitiveContentWarning ? `<div class="notice danger">${escapeHtml(result.sensitiveContentWarning)}</div>` : ""}

        <section class="plain-panel">
          <h2>Why Verivae gave this result</h2>
          <p>${escapeHtml(result.reasoningSummary)}</p>
          <p class="fine-print">${escapeHtml(result.explanation)}</p>
          <p class="fine-print">${escapeHtml(result.exposureSummary || "")}</p>
          <p class="fine-print">${escapeHtml(contextInferenceNote(result))}</p>
        </section>

        <section class="list-block">
          <h2>Main warning signs</h2>
          <div class="signal-list">${renderSignalList(result.detectedSignals)}</div>
        </section>

        <section class="two-column">
          <article class="plain-panel">
            <h2>Do not do this yet</h2>
            ${renderList(result.doNotDo)}
          </article>
          <article class="plain-panel">
            <h2>Next safest steps</h2>
            ${renderList(result.safeVerificationSteps)}
          </article>
        </section>

        <section class="plain-panel">
          <h2>Then consider</h2>
          ${renderList(result.recommendedNextActions)}
        </section>

        ${renderPaymentPlaybooks(result.paymentPlaybooks)}

        ${renderResultDecisions(result)}

        ${renderGuidedReview(result)}

        ${renderMissingInformation(result)}
      `,
      `
        <button class="btn primary" type="button" data-action="save-case">Save local case</button>
        <button class="btn secondary" type="button" data-route="recovery">Open recovery</button>
        <button class="btn secondary" type="button" data-route="check">Run another check</button>
      `
    );
  }

  function getRiskCount(evidence, riskLevel) {
    return evidence.filter((item) => item.result.riskLevel === riskLevel).length;
  }

  function getSourceCount(evidence, sourceType) {
    return evidence.filter((item) => item.result.sourceType === sourceType).length;
  }

  function filteredEvidence(evidence) {
    if (state.vaultFilter === "all") {
      return evidence;
    }

    if (state.vaultFilter.startsWith("risk:")) {
      const riskLevel = state.vaultFilter.replace("risk:", "");
      return evidence.filter((item) => item.result.riskLevel === riskLevel);
    }

    if (state.vaultFilter.startsWith("source:")) {
      const sourceType = state.vaultFilter.replace("source:", "");
      return evidence.filter((item) => item.result.sourceType === sourceType);
    }

    return evidence;
  }

  function renderVault() {
    const evidence = storage.getEvidence();
    const visibleEvidence = filteredEvidence(evidence);
    const sourceTypes = Array.from(new Set(evidence.map((item) => item.result.sourceType))).filter(Boolean);
    const highRiskEvidence = getRiskCount(evidence, "high_risk");
    const unclearEvidence = getRiskCount(evidence, "not_enough_information");

    return pageShell(
      "Evidence vault",
      "Prototype local storage",
      `
        <section class="notice">
          Saved evidence stays in this browser for the prototype. ${sensitiveInfoReminder}
        </section>

        <section class="vault-summary">
          <article>
            <span class="metric-value">${evidence.length}</span>
            <strong>Saved items</strong>
            <p>Local records in this browser only.</p>
          </article>
          <article>
            <span class="metric-value">${highRiskEvidence}</span>
            <strong>High risk</strong>
            <p>Prioritize records where money, codes, links, files, or access may be involved.</p>
          </article>
          <article>
            <span class="metric-value">${unclearEvidence}</span>
            <strong>Need details</strong>
            <p>Add safe context through a new check if the first record was too vague.</p>
          </article>
        </section>

        ${
          evidence.length
            ? `<section class="list-block">
                <div class="section-title-row">
                  <h2>Saved checks</h2>
                  <button class="text-button" type="button" data-action="clear-evidence">Clear all</button>
                </div>
                <div class="vault-tools" aria-label="Evidence filters">
                  <label>
                    Show
                    <select id="vault-filter">
                      <option value="all" ${state.vaultFilter === "all" ? "selected" : ""}>All saved evidence (${evidence.length})</option>
                      <option value="risk:high_risk" ${state.vaultFilter === "risk:high_risk" ? "selected" : ""}>High risk (${getRiskCount(evidence, "high_risk")})</option>
                      <option value="risk:caution" ${state.vaultFilter === "risk:caution" ? "selected" : ""}>Caution (${getRiskCount(evidence, "caution")})</option>
                      <option value="risk:not_enough_information" ${state.vaultFilter === "risk:not_enough_information" ? "selected" : ""}>Not enough info (${getRiskCount(evidence, "not_enough_information")})</option>
                      <option value="risk:likely_safe" ${state.vaultFilter === "risk:likely_safe" ? "selected" : ""}>Likely safe (${getRiskCount(evidence, "likely_safe")})</option>
                      ${sourceTypes
                        .map(
                          (sourceType) =>
                            `<option value="source:${escapeHtml(sourceType)}" ${state.vaultFilter === `source:${sourceType}` ? "selected" : ""}>
                              ${escapeHtml(detection.sourceLabels[sourceType] || sourceType)} (${getSourceCount(evidence, sourceType)})
                            </option>`
                        )
                        .join("")}
                    </select>
                  </label>
                </div>
                <div class="evidence-list">
                  ${
                    visibleEvidence.length
                      ? visibleEvidence
                    .map(
                      (item) => `
                        <article class="evidence-card ${levelClass(item.result.riskLevel)}">
                          <div>
                            <strong>${escapeHtml(item.evidenceSummary?.headline || item.result.riskLabel)}</strong>
                            <p>${escapeHtml(item.result.primaryGuidance || item.checkItem.content.slice(0, 150))}</p>
                            <small>${escapeHtml(contextInferenceNote(item.result))}</small>
                          </div>
                          <dl class="evidence-meta">
                            <div>
                              <dt>Saved</dt>
                              <dd>${formatDate(item.savedAt)}</dd>
                            </div>
                            <div>
                              <dt>Checked</dt>
                              <dd>${formatDate(item.result.checkedAt)}</dd>
                            </div>
                            <div>
                              <dt>Confidence</dt>
                              <dd>${escapeHtml(item.result.confidence)}</dd>
                            </div>
                            <div>
                              <dt>Source</dt>
                              <dd>${escapeHtml(item.result.sourceLabel)}</dd>
                            </div>
                            <div>
                              <dt>Action</dt>
                              <dd>${escapeHtml(item.result.requestedActionLabel)}</dd>
                            </div>
                          </dl>
                          <details>
                            <summary>Saved details</summary>
                            <p class="fine-print"><strong>Original situation:</strong></p>
                            <p class="evidence-situation">${escapeHtml(item.checkItem.content)}</p>
                            ${item.checkItem.notes ? `<p class="fine-print"><strong>Notes:</strong> ${escapeHtml(item.checkItem.notes)}</p>` : ""}
                            <p class="fine-print"><strong>Risk:</strong> ${escapeHtml(item.result.riskLabel)} with ${escapeHtml(item.result.confidence.toLowerCase())} confidence.</p>
                            <p class="fine-print"><strong>Main warning signs:</strong> ${escapeHtml(item.evidenceSummary?.signals || signalSummary(item.result))}</p>
                            <p class="fine-print"><strong>Main guidance:</strong> ${escapeHtml(item.result.primaryGuidance)}</p>
                            ${renderList(item.result.recommendedNextActions)}
                          </details>
                          <div class="card-actions">
                            <span>${escapeHtml(item.evidenceSummary?.savedReminder || "Review before sharing.")}</span>
                            <button class="text-button danger-action" type="button" data-delete="${escapeHtml(item.id)}">Delete saved item</button>
                          </div>
                        </article>
                      `
                    )
                    .join("")
                      : `<section class="empty-state">
                          <h2>No matches for this filter</h2>
                          <p>Try showing all saved evidence or saving another check result.</p>
                        </section>`
                  }
                </div>
              </section>`
            : `<section class="empty-state">
                <h2>No saved evidence</h2>
                <p>After a scam check, save a safe record here if you may need details for a bank, payment app, trusted helper, or official report.</p>
                <p class="fine-print">Good evidence includes screenshots, links, contact names, phone numbers, dates, transaction notes, and a short summary. ${sensitiveInfoReminder}</p>
                ${button("Run a check", "check", "primary")}
                ${button("Open cases", "case")}
              </section>`
        }
      `
    );
  }

  function renderCasePacket() {
    const savedCases = storage.getCasePackets();
    const filteredCases = filterCases(savedCases);
    const packet = getLatestCasePacket();

    if (!packet) {
      return pageShell(
        "Cases",
        "Local case workspace",
        `
          <section class="empty-state">
            <h2>No cases yet</h2>
            <p>Run a scam check first. Verivae can then prepare a local case with what happened, the risk judgment, recovery steps, and a trusted-helper summary.</p>
            <p class="fine-print">Cases stay in this browser for the prototype. They are not sent anywhere automatically.</p>
            ${button("Start a scam check", "check", "primary")}
          </section>
        `
      );
    }

    const result = packet.result;
    const checkItem = packet.checkItem;
    const savedPacket = storage.getCasePacket(packet.id);
    const isSaved = Boolean(savedPacket);
    const progress = getCaseProgress(packet);
    const checklistStatus = deriveCaseStatus(packet);
    const selectedStatus = caseStatusOptions[packet.status] ? packet.status : "reviewing";
    const caseTitle = packet.caseTitle || suggestCaseTitle(checkItem, result, packet.evidenceSummary);
    const nextAction = caseNextAction(packet);

    return pageShell(
      "Cases",
      "Local case workspace",
      `
        <section class="notice">
          ${isSaved ? "This saved case" : "This latest-check preview"} is only a local prototype record. Review it before sharing, and ${sensitiveInfoReminder.toLowerCase()}
        </section>

        ${
          savedCases.length
            ? `<section class="plain-panel">
                <div class="section-title-row">
                  <h2>Saved cases</h2>
                  <span class="case-count">${filteredCases.length} of ${savedCases.length} local</span>
                </div>
                <p>Saved cases stay in this browser. Open one to review its evidence, recovery tasks, helper summary, and report draft starting point.</p>
                <div class="case-filter-bar" aria-label="Case filters">
                  ${Object.entries(caseFilterOptions)
                    .map(
                      ([value, label]) => `
                        <button class="filter-chip ${state.caseFilter === value ? "active" : ""}" type="button" data-case-filter="${value}">
                          ${escapeHtml(label)}
                          <span>${caseFilterCount(savedCases, value)}</span>
                        </button>
                      `
                    )
                    .join("")}
                </div>
                <div class="case-list">
                  ${
                    filteredCases.length
                      ? filteredCases.map((saved) => renderSavedCaseCard(saved, packet.id)).join("")
                      : `<section class="empty-state compact-empty">
                          <h2>No cases in this view</h2>
                          <p>Try another filter or save a new check when you need a case record.</p>
                        </section>`
                  }
                </div>
              </section>`
            : `<section class="empty-state compact-empty">
                <h2>No saved cases yet</h2>
                <p>This view is a prepared case from the latest check. Save it if you want a local record to revisit later.</p>
              </section>`
        }

        <section class="case-overview ${levelClass(result.riskLevel)}">
          <div>
            <span class="result-kicker">${isSaved ? "Selected saved case" : "Latest check preview"}</span>
            <h2>${escapeHtml(caseTitle)}</h2>
            <p>${escapeHtml(result.primaryGuidance)}</p>
            <p class="fine-print"><strong>Status:</strong> ${escapeHtml(caseStatusLabel(packet))}. <strong>Next:</strong> ${escapeHtml(nextAction)}</p>
            <p class="fine-print">Checklist: ${escapeHtml(progress.label)}. Progress state: ${escapeHtml(checklistStatus)}.</p>
          </div>
          <dl class="evidence-meta">
            <div>
              <dt>Risk</dt>
              <dd>${escapeHtml(result.riskLabel)}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>${escapeHtml(result.confidence)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>${escapeHtml(result.sourceLabel)}</dd>
            </div>
            <div>
              <dt>Action</dt>
              <dd>${escapeHtml(result.requestedActionLabel)}</dd>
            </div>
            <div>
              <dt>Already acted?</dt>
              <dd>${escapeHtml(result.exposureActionLabels?.join(", ") || "Not sure yet")}</dd>
            </div>
          </dl>
        </section>

        <form id="case-details-form" class="form-card case-details-form">
          <div class="optional-grid">
            <label>
              Case title
              <input name="caseTitle" ${isSaved ? "" : "disabled"} value="${escapeHtml(caseTitle)}" placeholder="Give this case a short name">
              <small>Use a plain title, not passwords, codes, account numbers, or private keys.</small>
            </label>
            <label>
              Case status
              <select name="caseStatus" ${isSaved ? "" : "disabled"}>
                ${Object.entries(caseStatusOptions)
                  .map(
                    ([value, label]) =>
                      `<option value="${value}" ${selectedStatus === value ? "selected" : ""}>${escapeHtml(label)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label>
              Case notes
              <textarea name="caseNotes" rows="5" ${isSaved ? "" : "disabled"} placeholder="Add safe notes like who you contacted, what you are waiting on, or what you verified.">${escapeHtml(packet.caseNotes || "")}</textarea>
              <small>${sensitiveInfoReminder}</small>
            </label>
          </div>
          ${
            isSaved
              ? `<button class="btn primary" type="submit">Save case details</button>`
              : `<p class="fine-print">Save this case before adding notes or changing status.</p>`
          }
        </form>

        <section class="plain-panel">
          <h2>What happened</h2>
          <p class="evidence-situation">${escapeHtml(checkItem.content)}</p>
          ${checkItem.notes ? `<p class="fine-print"><strong>Notes:</strong> ${escapeHtml(checkItem.notes)}</p>` : ""}
          <p class="fine-print"><strong>Already acted:</strong> ${escapeHtml(result.exposureActionLabels?.join(", ") || "Not sure yet")}</p>
          <p class="fine-print">${escapeHtml(contextInferenceNote(result))}</p>
        </section>

        <section class="two-column">
          <article class="plain-panel">
            <h2>Main warning signs</h2>
            ${renderList(result.judgment.mainWarningSigns)}
          </article>
          <article class="plain-panel">
            <h2>Still unclear</h2>
            ${renderList(
              result.missingInformation.length
                ? result.missingInformation
                : [
                    "No specific gaps were flagged, but this case is still based only on the details entered."
                  ]
            )}
          </article>
        </section>

        <section class="two-column">
          <article class="plain-panel">
            <h2>Do not do this yet</h2>
            ${renderList(result.doNotDo)}
          </article>
          <article class="plain-panel">
            <h2>Safest next steps</h2>
            ${renderList(result.safeVerificationSteps)}
          </article>
        </section>

        <section class="checklist">
          ${
            isSaved
              ? `<p class="fine-print checklist-note">Checklist progress is saved in this local case.</p>`
              : `<p class="fine-print checklist-note">Save this case before using checklist tracking.</p>`
          }
          ${packet.recoveryPlan.steps
            .map(
              (task, index) => `
                <label class="task-row">
                  <input type="checkbox" data-case-task="${index}" data-case-id="${escapeHtml(packet.id)}" ${packet.taskProgress?.[String(index)] ? "checked" : ""} ${isSaved ? "" : "disabled"}>
                  <span>
                    <strong>${escapeHtml(task.title)}</strong>
                    <small>${escapeHtml(task.priority)} - ${escapeHtml(task.detail)}</small>
                  </span>
                </label>
              `
            )
            .join("")}
        </section>

        ${renderPaymentPlaybooks(packet.recoveryPlan.paymentPlaybooks)}

        <section class="plain-panel">
          <h2>Trusted-helper summary</h2>
          <p>Use this as a starting point, then remove secrets before showing it to someone you personally trust.</p>
          <textarea id="helper-summary" rows="8">${escapeHtml(packet.helperSummary)}</textarea>
          <button class="btn secondary" type="button" data-action="copy-helper">Copy helper summary</button>
        </section>

        <section class="plain-panel">
          <h2>Case timeline</h2>
          <div class="timeline-list">
            ${packet.timeline
              .map(
                (item) => `
                  <article class="timeline-item">
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${formatDate(item.at)}</small>
                    <p>${escapeHtml(item.detail)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
          ${
            isSaved
              ? `<p class="fine-print">Saved locally ${formatDate(savedPacket.savedAt)}. Last updated ${formatDate(savedPacket.updatedAt)}.</p>`
              : `<p class="fine-print">This case has not been saved locally yet.</p>`
          }
        </section>
      `,
      `
        <button class="btn primary" type="button" data-action="save-case">${isSaved ? "Update local case" : "Save local case"}</button>
        ${
          state.currentCheck && state.currentResult
            ? `<button class="btn secondary" type="button" data-action="save-evidence">Save evidence</button>`
            : ""
        }
        <button class="btn secondary" type="button" data-route="recovery">Open recovery steps</button>
        <button class="btn secondary" type="button" data-route="report">Prepare report draft</button>
        <button class="btn secondary" type="button" data-route="helper">Prepare helper summary</button>
      `
    );
  }

  function renderRecovery() {
    const context = getLatestContext();
    const plan = detection.buildRecoveryPlan(context?.result);
    const casePacket = context?.casePacket || null;
    const caseProgress = casePacket ? getCaseProgress(casePacket) : null;
    const doneTasks = casePacket ? completedCaseTasks(casePacket) : [];

    return pageShell(
      casePacket ? "Recovery for this case" : "Recovery workspace",
      casePacket ? "Continue saved case" : "After something may have gone wrong",
      `
        <section class="notice">
          Verivae can help organize recovery steps, but it cannot guarantee refunds, account recovery, law-enforcement action, or device cleanup.
        </section>
        <section class="recovery-hero">
          <div>
            <span class="result-kicker">First priority</span>
            <h2>Stop more harm, then organize what happened.</h2>
            <p>${escapeHtml(plan.context)}</p>
            <p class="fine-print">Use official contact paths you choose yourself, not links or phone numbers from the suspicious message.</p>
          </div>
          <div class="recovery-status-strip">
            <article>
              <strong>${casePacket ? caseStatusLabel(casePacket) : "No saved case selected"}</strong>
              <span>${casePacket ? "Current case status" : "Run or save a check to track progress here."}</span>
            </article>
            <article>
              <strong>${caseProgress ? `${caseProgress.completed}/${caseProgress.total || 0}` : "0/0"}</strong>
              <span>${caseProgress ? "Recovery steps checked" : "Checklist progress is not saved yet."}</span>
            </article>
          </div>
        </section>
        ${
          context
            ? `<section class="plain-panel">
                <h2>${casePacket ? "Case context" : "Latest check context"}</h2>
                <p>${escapeHtml(casePacket?.caseTitle || context.evidenceSummary?.headline || context.result.riskLabel)}</p>
                <dl class="evidence-meta">
                  ${
                    casePacket
                      ? `<div>
                          <dt>Status</dt>
                          <dd>${escapeHtml(caseStatusLabel(casePacket))}</dd>
                        </div>`
                      : ""
                  }
                  <div>
                    <dt>Confidence</dt>
                    <dd>${escapeHtml(context.result.confidence)}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>${escapeHtml(context.result.sourceLabel)}</dd>
                  </div>
                  <div>
                    <dt>Action</dt>
                    <dd>${escapeHtml(context.result.requestedActionLabel)}</dd>
                  </div>
                  <div>
                    <dt>Already acted?</dt>
                    <dd>${escapeHtml(context.result.exposureActionLabels?.join(", ") || "Not sure yet")}</dd>
                  </div>
                </dl>
                <p class="fine-print">${escapeHtml(contextInferenceNote(context.result))}</p>
                <p class="fine-print"><strong>Current situation:</strong> ${escapeHtml(context.result.exposureSummary || "")}</p>
                <p class="fine-print"><strong>Warning signs:</strong> ${escapeHtml(context.evidenceSummary?.signals || signalSummary(context.result))}</p>
                <p class="fine-print"><strong>Guidance:</strong> ${escapeHtml(context.result.primaryGuidance)}</p>
                ${
                  casePacket
                    ? `<p class="fine-print"><strong>Next case action:</strong> ${escapeHtml(caseNextAction(casePacket))}</p>`
                    : ""
                }
              </section>`
            : ""
        }
        ${
          casePacket
            ? `<section class="plain-panel">
                <h2>What you have already done</h2>
                <p>${escapeHtml(caseProgress.label)} for this saved case.</p>
                ${
                  doneTasks.length
                    ? renderList(doneTasks.map((task) => `${task.title}: ${task.detail}`))
                    : `<p class="fine-print">No recovery tasks have been checked yet. Start with the first step you can safely verify.</p>`
                }
                ${casePacket.caseNotes ? `<p class="fine-print"><strong>Case notes:</strong> ${escapeHtml(casePacket.caseNotes)}</p>` : ""}
              </section>`
            : ""
        }
        ${renderPaymentPlaybooks(plan.paymentPlaybooks)}
        <section class="plain-panel">
          <h2>Use this workspace calmly</h2>
          <p>Start with the steps that prevent more loss: stop contact, avoid sending more money or codes, preserve evidence, and contact official providers yourself.</p>
        </section>
        ${renderRecoveryGroups(plan.groups, casePacket)}
        <section class="plain-panel">
          <h2>Helpful records to gather</h2>
          <p>Save only what is useful: screenshots, dates, contact details, transaction IDs, payment app names, links, and a plain summary of what happened. ${sensitiveInfoReminder}</p>
        </section>
      `,
      context
        ? `
          ${
            state.currentCheck && state.currentResult
              ? `<button class="btn primary" type="button" data-action="save-evidence">Save latest check</button>`
              : ""
          }
          <button class="btn secondary" type="button" data-route="case">Open cases</button>
          <button class="btn secondary" type="button" data-route="report">Prepare report draft</button>
          <button class="btn secondary" type="button" data-route="helper">Prepare helper summary</button>
        `
        : `
          <button class="btn primary" type="button" data-route="check">Run a scam check</button>
          <button class="btn secondary" type="button" data-route="vault">Review saved evidence</button>
        `
    );
  }

  function renderHelper() {
    const context = getLatestContext();
    const summary = context
      ? detection.buildHelperSummary(context.checkItem, context.result)
      : "";

    return pageShell(
      "Trusted helper",
      "Privacy-aware review",
      `
        ${
          summary
            ? `<section class="helper-hero">
                <span class="result-kicker">Safe sharing</span>
                <h2>You do not have to handle this alone.</h2>
                <p>Scams are designed to create pressure, confusion, and embarrassment. Asking someone calm to sit with you is a strong safety step.</p>
                <p class="fine-print">Verivae only prepares the summary. It does not send messages, open contacts, or share anything automatically.</p>
              </section>

              <section class="plain-panel">
                <h2>Summary source</h2>
                <p>${escapeHtml(context.evidenceSummary?.headline || context.result.riskLabel)}</p>
                <dl class="evidence-meta">
                  <div>
                    <dt>Risk</dt>
                    <dd>${escapeHtml(context.result.riskLabel)}</dd>
                  </div>
                  <div>
                    <dt>Confidence</dt>
                    <dd>${escapeHtml(context.result.confidence)}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>${escapeHtml(context.result.sourceLabel)}</dd>
                  </div>
                  <div>
                    <dt>Action</dt>
                    <dd>${escapeHtml(context.result.requestedActionLabel)}</dd>
                  </div>
                  <div>
                    <dt>Already acted?</dt>
                    <dd>${escapeHtml(context.result.exposureActionLabels?.join(", ") || "Not sure yet")}</dd>
                  </div>
                </dl>
                <p class="fine-print">${escapeHtml(contextInferenceNote(context.result))}</p>
                <p class="fine-print"><strong>Current situation:</strong> ${escapeHtml(context.result.exposureSummary || "")}</p>
              </section>

              <section class="form-card helper-card">
                <label>
                  Summary to show a trusted person
                  <textarea id="helper-summary" rows="11">${escapeHtml(summary)}</textarea>
                  <small>Review this before copying. Remove anything private that a helper does not need.</small>
                </label>
                <div class="notice">
                  Copying only puts this summary on your clipboard. Verivae does not send it anywhere. ${sensitiveInfoReminder}
                </div>
                <button class="btn primary" type="button" data-action="copy-helper">Copy summary</button>
              </section>

              <section class="plain-panel">
                <h2>Before sharing</h2>
                <div class="checklist">
                  <label class="task-row">
                    <input type="checkbox">
                    <span>
                      <strong>Remove secrets</strong>
                      <small>${sensitiveInfoReminder}</small>
                    </span>
                  </label>
                  <label class="task-row">
                    <input type="checkbox">
                    <span>
                      <strong>Choose someone you personally trust</strong>
                      <small>Use a person you already know and can verify, not someone suggested by the suspicious message.</small>
                    </span>
                  </label>
                  <label class="task-row">
                    <input type="checkbox">
                    <span>
                      <strong>Avoid forwarding suspicious links or files</strong>
                      <small>Describe them instead unless sharing the exact item is necessary for help.</small>
                    </span>
                  </label>
                  <label class="task-row">
                    <input type="checkbox">
                    <span>
                      <strong>Use official contact channels</strong>
                      <small>For banks and payment apps, use the official app, typed website, or number on your card or statement.</small>
                    </span>
                  </label>
                </div>
              </section>`
            : `<section class="empty-state">
                <h2>No helper summary yet</h2>
                <p>Run a scam check first. Verivae will prepare a short summary you can review and copy before sharing with someone you trust.</p>
                ${button("Start a scam check", "check", "primary")}
              </section>`
        }
      `,
      summary
        ? `
          <button class="btn primary" type="button" data-action="copy-helper">Copy summary</button>
          <button class="btn secondary" type="button" data-route="report">Prepare report draft</button>
          <button class="btn secondary" type="button" data-route="case">Open cases</button>
          <button class="btn secondary" type="button" data-route="recovery">Open recovery steps</button>
        `
        : ""
    );
  }

  function renderEducation() {
    return pageShell(
      "Scam education",
      "Short lessons",
      `
        <section class="education-hero">
          <span class="result-kicker">Safer habits</span>
          <h2>Learn the patterns behind Verivae results.</h2>
          <p>These short lessons match the same warning signs the local scam check looks for. They are meant to help you pause and verify, not promise that every scam will be caught.</p>
          <button class="btn primary" type="button" data-route="check">Check something suspicious</button>
        </section>

        <section class="education-shortcuts" aria-label="Core safety habits">
          <article>
            <strong>Slow down</strong>
            <span>Urgency is one of the most common ways scammers push people into mistakes.</span>
          </article>
          <article>
            <strong>Choose the channel</strong>
            <span>Verify through an official app, typed website, known phone number, or person you already trust.</span>
          </article>
          <article>
            <strong>Protect secrets</strong>
            <span>Do not share passwords, one-time codes, full card numbers, private keys, or recovery phrases.</span>
          </article>
        </section>

        <section class="education-grid">
          ${educationCards
            .map(
              (card) => `
                <article class="education-card">
                  <h2>${escapeHtml(card.title)}</h2>
                  <p>${escapeHtml(card.body)}</p>
                  <small><strong>Example:</strong> ${escapeHtml(card.example)}</small>
                  <small><strong>Safer habit:</strong> ${escapeHtml(card.action)}</small>
                </article>
              `
            )
            .join("")}
        </section>
        <section class="plain-panel">
          <h2>What Verivae checks today</h2>
          <p>This MVP looks for common warning signs in text you provide: urgency, secrecy, unusual payments, code requests, remote access, suspicious links, impersonation, emergency pressure, job checks, marketplace overpayments, QR payments, attachments, and unrealistic money claims.</p>
        </section>
        <section class="plain-panel">
          <h2>Practice habit</h2>
          <p>When a request involves money, access, secrecy, urgency, or embarrassment, pause and verify through a channel you choose yourself.</p>
        </section>
      `
    );
  }

  function renderSettings() {
    const settings = storage.getSettings();
    return pageShell(
      "Settings and privacy",
      "Clear boundaries",
      `
        <section class="settings-summary">
          <article>
            <span class="result-kicker">Stored here</span>
            <strong>Local prototype data</strong>
            <p>Saved evidence, cases, notes, and settings stay in this browser on this device for now.</p>
          </article>
          <article>
            <span class="result-kicker">Not connected</span>
            <strong>No outside accounts</strong>
            <p>Verivae does not access Gmail, SMS, banks, payment apps, contacts, cloud sync, or device scanning in this MVP.</p>
          </article>
        </section>

        <section class="notice">
          ${sensitiveInfoReminder} Verivae does not need those secrets to help you think through scam risk.
        </section>

        <form id="settings-form" class="form-card">
          <div>
            <h2>Prototype preferences</h2>
            <p class="fine-print">These settings only affect this local browser prototype.</p>
          </div>
          <label class="toggle-row">
            <span>
              <strong>Save evidence locally</strong>
              <small>Store saved checks only in this browser on this device. No account sync or cloud storage yet.</small>
            </span>
            <input type="checkbox" name="saveEvidenceLocally" ${settings.saveEvidenceLocally ? "checked" : ""}>
          </label>

          <label class="toggle-row">
            <span>
              <strong>Helper review nudges</strong>
              <small>Suggest asking a trusted person for high-risk or not-sure checks.</small>
            </span>
            <input type="checkbox" name="helperReviewReminder" ${settings.helperReviewReminder ? "checked" : ""}>
          </label>

          <label class="toggle-row">
            <span>
              <strong>Safety language</strong>
              <small>Show reminders about secrets, payments, official channels, and uncertainty.</small>
            </span>
            <input type="checkbox" name="safetyNudges" ${settings.safetyNudges ? "checked" : ""}>
          </label>

          <button class="btn primary" type="submit">Save settings</button>
        </form>

        <section class="plain-panel">
          <h2>What local storage means</h2>
          <p>Saved evidence stays in this browser for the prototype. Clearing browser data, switching devices, or using another browser may remove or hide it.</p>
        </section>

        <section class="plain-panel">
          <h2>Not connected in MVP 1</h2>
          <p>Verivae does not connect to Gmail, SMS, Messages, banks, payment apps, antivirus tools, law enforcement, subscriptions, browser extensions, or device scanning in this first version.</p>
        </section>

        <section class="plain-panel">
          <h2>Product limits</h2>
          <p>Verivae helps assess risk from information you provide and organize safer next steps. It cannot guarantee scam detection, refunds, legal outcomes, account recovery, device cleanup, or complete virus removal.</p>
        </section>
      `
    );
  }

  function saveCurrentEvidence() {
    if (!state.currentCheck || !state.currentResult) {
      setToast("Run a check before saving evidence.");
      return;
    }

    const settings = storage.getSettings();
    if (!settings.saveEvidenceLocally) {
      setToast("Local evidence saving is turned off in Settings.");
      return;
    }

    storage.saveEvidence({
      id: state.currentResult.id,
      checkItem: state.currentCheck,
      result: state.currentResult,
      evidenceSummary: detection.summarizeForEvidence(state.currentCheck, state.currentResult)
    });
    setToast("Evidence saved locally.");
    navigate("vault");
  }

  function saveCurrentCasePacket() {
    const context = getLatestContext();
    if (!context) {
      setToast("Run a check before creating a case.");
      return;
    }

    const settings = storage.getSettings();
    if (!settings.saveEvidenceLocally) {
      setToast("Local saving is turned off in Settings.");
      return;
    }

    storage.saveCasePacket(buildCasePacket(context));
    state.selectedCasePacketId = `case-${context.result.id}`;
    setToast("Case saved locally.");
    navigate("case");
    render();
  }

  function handleCaseTaskToggle(input) {
    const packet = storage.getCasePacket(input.dataset.caseId);
    if (!packet) {
      setToast("Save the case before tracking checklist progress.");
      render();
      return;
    }

    const taskProgress = { ...(packet.taskProgress || {}) };
    if (input.checked) {
      taskProgress[input.dataset.caseTask] = true;
    } else {
      delete taskProgress[input.dataset.caseTask];
    }

    const nextPacket = {
      ...packet,
      taskProgress
    };
    storage.saveCasePacket(nextPacket);
    state.selectedCasePacketId = packet.id;
    setToast(input.checked ? "Recovery step marked complete." : "Recovery step unchecked.");
    render();
  }

  function handleCaseDetailsSubmit(form) {
    const context = getLatestCasePacket();
    if (!context) {
      setToast("Run a check before saving case details.");
      return;
    }

    const packet = storage.getCasePacket(context.id);
    if (!packet) {
      setToast("Save the case before adding case details.");
      return;
    }

    const formData = new FormData(form);
    const requestedStatus = String(formData.get("caseStatus") || "reviewing");
    const caseTitle = String(formData.get("caseTitle") || "").trim();
    const caseNotes = String(formData.get("caseNotes") || "").trim();
    const status = caseStatusOptions[requestedStatus] ? requestedStatus : "reviewing";

    storage.saveCasePacket({
      ...packet,
      caseTitle: caseTitle || suggestCaseTitle(packet.checkItem, packet.result, packet.evidenceSummary),
      status,
      statusLabel: caseStatusOptions[status],
      caseNotes
    });
    state.selectedCasePacketId = packet.id;
    setToast("Case details saved locally.");
    render();
  }

  function handleCheckSubmit(form) {
    const formData = new FormData(form);
    const checkItem = {
      sourceType: formData.get("sourceType"),
      requestedAction: formData.get("requestedAction"),
      exposureActions: formData.getAll("exposureActions"),
      content: formData.get("content"),
      notes: formData.get("notes")
    };

    if (String(checkItem.content || "").trim().length < 8) {
      setToast("Add a little more detail before checking.");
      return;
    }

    checkItem.sourceType = checkItem.sourceType || "other";
    checkItem.requestedAction = checkItem.requestedAction || "not_sure";

    state.currentCheck = checkItem;
    state.currentResult = detection.assessScamRisk(checkItem);
    state.helperSummary = detection.buildHelperSummary(checkItem, state.currentResult);
    state.selectedCasePacketId = null;
    navigate("result");
  }

  function handleGuidedReviewSubmit(form) {
    if (!state.currentCheck || !state.currentResult) {
      setToast("Run a check before adding guided details.");
      return;
    }

    const formData = new FormData(form);
    const followUp = String(formData.get("followUp") || "").trim();

    if (followUp.length < 8) {
      setToast("Add a little more detail before checking again.");
      return;
    }

    const nextCheck = {
      ...state.currentCheck,
      content: `${state.currentCheck.content}\n\nAdditional review details: ${followUp}`,
      notes: [state.currentCheck.notes, "Guided review details added"].filter(Boolean).join(" | ")
    };

    state.currentCheck = nextCheck;
    state.currentResult = detection.assessScamRisk(nextCheck);
    state.helperSummary = detection.buildHelperSummary(nextCheck, state.currentResult);
    setToast("Verivae updated the judgment with your added details.");
    navigate("result");
  }

  function applySample(index) {
    const sample = sampleScenarios[index];
    if (!sample) {
      return;
    }

    const form = document.querySelector("#check-form");
    form.sourceType.value = sample.sourceType;
    form.requestedAction.value = sample.requestedAction;
    form.querySelectorAll("input[name='exposureActions']").forEach((input) => {
      input.checked = false;
    });
    form.content.value = sample.content;
    form.notes.value = `Sample: ${sample.title}`;
    form.content.focus();
  }

  function startSample(index) {
    state.pendingSampleIndex = index;
    navigate("check");
  }

  function handleSettingsSubmit(form) {
    const formData = new FormData(form);
    storage.saveSettings({
      saveEvidenceLocally: formData.has("saveEvidenceLocally"),
      helperReviewReminder: formData.has("helperReviewReminder"),
      safetyNudges: formData.has("safetyNudges")
    });
    setToast("Settings saved.");
  }

  async function copyHelperSummary() {
    const textarea = document.querySelector("#helper-summary");
    if (!textarea) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textarea.value);
      setToast("Summary copied.");
    } catch (error) {
      textarea.select();
      setToast("Summary selected. Use your browser copy command.");
    }
  }

  async function copyReportDraft() {
    const textarea = document.querySelector("#report-summary");
    if (!textarea) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textarea.value);
      setToast("Report draft copied.");
    } catch (error) {
      textarea.select();
      setToast("Report draft selected. Use your browser copy command.");
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-route]").forEach((element) => {
      element.addEventListener("click", () => navigate(element.dataset.route));
    });

    const checkForm = document.querySelector("#check-form");
    if (checkForm) {
      checkForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleCheckSubmit(checkForm);
      });
    }

    const guidedReviewForm = document.querySelector("#guided-review-form");
    if (guidedReviewForm) {
      guidedReviewForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleGuidedReviewSubmit(guidedReviewForm);
      });
    }

    document.querySelectorAll("[data-sample]").forEach((element) => {
      element.addEventListener("click", () => applySample(Number(element.dataset.sample)));
    });

    document.querySelectorAll("[data-start-sample]").forEach((element) => {
      element.addEventListener("click", () => startSample(Number(element.dataset.startSample)));
    });

    document.querySelectorAll("[data-delete]").forEach((element) => {
      element.addEventListener("click", () => {
        const shouldDelete = window.confirm(
          "Delete this saved item from this browser? This only removes the local prototype copy."
        );
        if (shouldDelete) {
          storage.deleteEvidence(element.dataset.delete);
          render();
          setToast("Saved evidence deleted.");
        }
      });
    });

    document.querySelectorAll("[data-open-case]").forEach((element) => {
      element.addEventListener("click", () => {
        state.selectedCasePacketId = element.dataset.openCase;
        render();
      });
    });

    document.querySelectorAll("[data-open-case-route]").forEach((element) => {
      element.addEventListener("click", () => {
        state.selectedCasePacketId = element.dataset.openCaseRoute;
        navigate("case");
      });
    });

    document.querySelectorAll("[data-case-filter]").forEach((element) => {
      element.addEventListener("click", () => {
        state.caseFilter = element.dataset.caseFilter;
        render();
      });
    });

    document.querySelectorAll("[data-delete-case]").forEach((element) => {
      element.addEventListener("click", () => {
        const shouldDelete = window.confirm(
          "Delete this case from this browser? This only removes the local prototype copy."
        );
        if (shouldDelete) {
          storage.deleteCasePacket(element.dataset.deleteCase);
          if (state.selectedCasePacketId === element.dataset.deleteCase) {
            state.selectedCasePacketId = null;
          }
          render();
          setToast("Case deleted.");
        }
      });
    });

    const clearButton = document.querySelector("[data-action='clear-evidence']");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const shouldClear = window.confirm(
          "Delete all saved evidence from this browser? This cannot be undone in the prototype."
        );
        if (shouldClear) {
          storage.clearEvidence();
          state.vaultFilter = "all";
          setToast("All saved evidence cleared.");
        }
      });
    }

    const vaultFilter = document.querySelector("#vault-filter");
    if (vaultFilter) {
      vaultFilter.addEventListener("change", () => {
        state.vaultFilter = vaultFilter.value;
        render();
      });
    }

    const saveButton = document.querySelector("[data-action='save-evidence']");
    if (saveButton) {
      saveButton.addEventListener("click", saveCurrentEvidence);
    }

    const saveCaseButton = document.querySelector("[data-action='save-case']");
    if (saveCaseButton) {
      saveCaseButton.addEventListener("click", saveCurrentCasePacket);
    }

    const caseDetailsForm = document.querySelector("#case-details-form");
    if (caseDetailsForm) {
      caseDetailsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleCaseDetailsSubmit(caseDetailsForm);
      });
    }

    document.querySelectorAll("[data-case-task]").forEach((element) => {
      element.addEventListener("change", () => handleCaseTaskToggle(element));
    });

    document.querySelectorAll("[data-action='copy-helper']").forEach((element) => {
      element.addEventListener("click", copyHelperSummary);
    });

    document.querySelectorAll("[data-action='copy-report']").forEach((element) => {
      element.addEventListener("click", copyReportDraft);
    });

    const settingsForm = document.querySelector("#settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleSettingsSubmit(settingsForm);
      });
    }

    if (routeName() === "check" && Number.isInteger(state.pendingSampleIndex)) {
      const pending = state.pendingSampleIndex;
      state.pendingSampleIndex = null;
      applySample(pending);
    }
  }

  function updateNav(activeRoute) {
    navItems.forEach((item) => {
      const isActive =
        item.dataset.nav === activeRoute ||
        (activeRoute === "result" && item.dataset.nav === "check") ||
        (activeRoute === "case" && item.dataset.nav === "vault") ||
        (activeRoute === "report" && item.dataset.nav === "recovery") ||
        (activeRoute === "helper" && item.dataset.nav === "home") ||
        (activeRoute === "education" && item.dataset.nav === "home");
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function render() {
    const activeRoute = routes[routeName()] ? routeName() : "home";
    updateNav(activeRoute);
    app.innerHTML = routes[activeRoute]();
    bindEvents();
    app.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", render);
  render();
})();
