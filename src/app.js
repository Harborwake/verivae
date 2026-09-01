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
    pendingSampleIndex: null
  };

  const routes = {
    home: renderHome,
    check: renderCheck,
    result: renderResult,
    vault: renderVault,
    recovery: renderRecovery,
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
    if (state.currentCheck && state.currentResult) {
      return {
        checkItem: state.currentCheck,
        result: state.currentResult,
        evidenceSummary: detection.summarizeForEvidence(state.currentCheck, state.currentResult)
      };
    }

    return storage.getEvidence()[0] || null;
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
    const latest = evidence[0];
    return pageShell(
      "Pause before you act",
      "Money and scam protection",
      `
        <section class="hero-panel">
          <h2>Check before sending money, codes, or access</h2>
          <p>
            Paste a suspicious message, payment request, link, QR situation, call summary, or attachment concern. Verivae will look for common warning signs and suggest a safer next step.
          </p>
          <div class="hero-actions">
            ${button("Start a scam check", "check", "primary")}
            ${button("I already acted", "recovery")}
          </div>
          <p class="boundary-note">
            Verivae can help assess risk and organize safer next steps. It cannot guarantee scam detection, refunds, recovery, or device cleanup.
          </p>
        </section>

        <section class="status-grid" aria-label="Prototype status">
          <article>
            <span class="status-number">${evidence.length}</span>
            <span>Evidence items saved locally</span>
          </article>
          <article>
            <span class="status-label">Manual only</span>
            <span>No Gmail, SMS, bank, payment, or device access in this MVP</span>
          </article>
        </section>

        ${
          latest
            ? `<section class="list-block">
                <h2>Latest saved check</h2>
                <article class="evidence-card">
                  <div>
                    <strong>${escapeHtml(latest.result.riskLabel)}</strong>
                    <p>${escapeHtml(latest.checkItem.content.slice(0, 120))}${latest.checkItem.content.length > 120 ? "..." : ""}</p>
                  </div>
                  <span>${formatDate(latest.savedAt)}</span>
                </article>
              </section>`
            : `<section class="empty-state">
                <h2>No evidence saved yet</h2>
                <p>Run a check, then save the result only if you need a record and it does not contain sensitive secrets.</p>
              </section>`
        }

        <section class="quick-links" aria-label="Secondary areas">
          ${button("Evidence vault", "vault")}
          ${button("Trusted helper", "helper")}
          ${button("Scam education", "education")}
          ${button("Privacy settings", "settings")}
        </section>

        <section class="list-block">
          <h2>Practice with examples</h2>
          <div class="sample-list compact">
            ${sampleScenarios
              .slice(0, 4)
              .map(
                (sample, index) =>
                  `<button class="sample-button" type="button" data-start-sample="${index}">
                    <strong>${escapeHtml(sample.title)}</strong>
                    <span>Open this example in the manual checker</span>
                  </button>`
              )
              .join("")}
          </div>
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

  function renderResultDecisions(result) {
    const saveTitle = result.shouldSaveEvidence ? "Evidence vault: recommended" : "Evidence vault: optional";
    const saveBody = result.shouldSaveEvidence
      ? "Save a local record if it does not include passwords, codes, full card numbers, bank login details, private keys, or recovery phrases."
      : "Saving is optional. Use it only if you want a local record of the check.";
    const recoveryTitle = result.shouldUseRecovery ? "Recovery workspace: recommended" : "Recovery workspace: not usually needed yet";
    const recoveryBody = result.shouldUseRecovery
      ? "Open recovery steps if you already clicked, paid, shared a code, opened a file, installed an app, or feel unsure what happened."
      : "Use recovery if you already acted or want a calm checklist, but this result does not automatically mean recovery is required.";

    return `
      <section class="plain-panel">
        <h2>What Verivae recommends now</h2>
        <div class="decision-grid">
          <article class="decision-card">
            <strong>${escapeHtml(saveTitle)}</strong>
            <p>${escapeHtml(saveBody)}</p>
          </article>
          <article class="decision-card">
            <strong>${escapeHtml(recoveryTitle)}</strong>
            <p>${escapeHtml(recoveryBody)}</p>
          </article>
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
          </dl>
        </section>

        ${result.sensitiveContentWarning ? `<div class="notice danger">${escapeHtml(result.sensitiveContentWarning)}</div>` : ""}

        <section class="plain-panel">
          <h2>Why Verivae gave this result</h2>
          <p>${escapeHtml(result.reasoningSummary)}</p>
          <p class="fine-print">${escapeHtml(result.explanation)}</p>
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

        ${renderResultDecisions(result)}

        ${renderMissingInformation(result)}
      `,
      `
        <button class="btn primary" type="button" data-action="save-evidence">Save local evidence</button>
        <button class="btn secondary" type="button" data-route="recovery">Open recovery steps</button>
        <button class="btn secondary" type="button" data-route="helper">Prepare helper summary</button>
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

    return pageShell(
      "Evidence vault",
      "Prototype local storage",
      `
        <section class="notice">
          Saved evidence stays in this browser for the prototype. ${sensitiveInfoReminder}
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
              </section>`
        }
      `
    );
  }

  function renderRecovery() {
    const context = getLatestContext();
    const plan = detection.buildRecoveryPlan(context?.result);

    return pageShell(
      "Recovery workspace",
      "After something may have gone wrong",
      `
        <section class="notice">
          Verivae can help organize recovery steps, but it cannot guarantee refunds, account recovery, law-enforcement action, or device cleanup.
        </section>
        <section class="plain-panel">
          <h2>Start here</h2>
          <p>${escapeHtml(plan.context)}</p>
          <p class="fine-print">If money, account access, or private information may already be involved, focus on stopping more harm first. Use official contact paths, not links or phone numbers from the suspicious message.</p>
        </section>
        ${
          context
            ? `<section class="plain-panel">
                <h2>Latest check context</h2>
                <p>${escapeHtml(context.evidenceSummary?.headline || context.result.riskLabel)}</p>
                <dl class="evidence-meta">
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
                </dl>
                <p class="fine-print">${escapeHtml(contextInferenceNote(context.result))}</p>
                <p class="fine-print"><strong>Warning signs:</strong> ${escapeHtml(context.evidenceSummary?.signals || signalSummary(context.result))}</p>
                <p class="fine-print"><strong>Guidance:</strong> ${escapeHtml(context.result.primaryGuidance)}</p>
              </section>`
            : ""
        }
        <section class="checklist">
          ${plan.steps
            .map(
              (task, index) => `
                <label class="task-row">
                  <input type="checkbox" data-recovery-task="${index}">
                  <span>
                    <strong>${escapeHtml(task.title)}</strong>
                    <small>${escapeHtml(task.priority)} - ${escapeHtml(task.detail)}</small>
                  </span>
                </label>
              `
            )
            .join("")}
        </section>
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
            ? `<section class="plain-panel">
                <h2>You do not have to handle this alone</h2>
                <p>Scams are designed to create pressure, confusion, and embarrassment. Asking someone calm to sit with you is a strong safety step.</p>
              </section>

              <section class="plain-panel">
                <h2>Latest check</h2>
                <p>${escapeHtml(context.evidenceSummary?.headline || context.result.riskLabel)}</p>
                <dl class="evidence-meta">
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
                </dl>
                <p class="fine-print">${escapeHtml(contextInferenceNote(context.result))}</p>
              </section>

              <section class="form-card helper-card">
                <label>
                  Summary to show a trusted person
                  <textarea id="helper-summary" rows="11">${escapeHtml(summary)}</textarea>
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
      `
    );
  }

  function renderEducation() {
    return pageShell(
      "Scam education",
      "Short lessons",
      `
        <section class="plain-panel">
          <h2>Learn the warning signs Verivae uses</h2>
          <p>These short lessons match the same patterns the local scam check looks for. Use them as practice, not as a promise that every scam will be caught.</p>
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
          <p>When a request involves money, access, secrecy, or urgency, pause and verify through a channel you choose yourself.</p>
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
        <form id="settings-form" class="form-card">
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

        <section class="notice">
          ${sensitiveInfoReminder} Verivae does not need those secrets to help you think through scam risk.
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

  function handleCheckSubmit(form) {
    const formData = new FormData(form);
    const checkItem = {
          sourceType: formData.get("sourceType"),
          requestedAction: formData.get("requestedAction"),
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

    const copyButton = document.querySelector("[data-action='copy-helper']");
    if (copyButton) {
      copyButton.addEventListener("click", copyHelperSummary);
    }

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
