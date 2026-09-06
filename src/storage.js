(function (root) {
  const evidenceKey = "verivae:evidence:v1";
  const casePacketsKey = "verivae:case-packets:v1";
  const settingsKey = "verivae:settings:v1";
  const memoryStore = {};

  const defaultSettings = {
    saveEvidenceLocally: true,
    helperReviewReminder: true,
    safetyNudges: true,
    themeMode: "light"
  };
  const themeModes = new Set(["light", "dark", "system"]);

  function readJson(key, fallback) {
    if (memoryStore[key]) {
      return JSON.parse(memoryStore[key]);
    }

    try {
      const saved = root.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    memoryStore[key] = JSON.stringify(value);

    try {
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getEvidence() {
    return readJson(evidenceKey, []);
  }

  function saveEvidence(item) {
    const current = getEvidence();
    const next = [{ ...item, savedAt: new Date().toISOString() }, ...current].slice(0, 25);
    writeJson(evidenceKey, next);
    return next;
  }

  function deleteEvidence(id) {
    const next = getEvidence().filter((item) => item.id !== id);
    writeJson(evidenceKey, next);
    return next;
  }

  function clearEvidence() {
    writeJson(evidenceKey, []);
    return [];
  }

  function getCasePackets() {
    return readJson(casePacketsKey, []);
  }

  function getCasePacket(id) {
    return getCasePackets().find((item) => item.id === id) || null;
  }

  function saveCasePacket(packet) {
    const current = getCasePackets();
    const savedAt = packet.savedAt || new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const nextPacket = { ...packet, savedAt, updatedAt };
    const next = [nextPacket, ...current.filter((item) => item.id !== nextPacket.id)].slice(0, 25);
    writeJson(casePacketsKey, next);
    return next;
  }

  function deleteCasePacket(id) {
    const next = getCasePackets().filter((item) => item.id !== id);
    writeJson(casePacketsKey, next);
    return next;
  }

  function clearCasePackets() {
    writeJson(casePacketsKey, []);
    return [];
  }

  function getSettings() {
    return normalizeSettings(readJson(settingsKey, defaultSettings));
  }

  function saveSettings(settings) {
    const next = normalizeSettings(settings);
    writeJson(settingsKey, next);
    return next;
  }

  function normalizeSettings(settings) {
    const next = { ...defaultSettings, ...(settings || {}) };
    if (!themeModes.has(next.themeMode)) {
      next.themeMode = defaultSettings.themeMode;
    }
    return next;
  }

  const api = {
    getEvidence,
    saveEvidence,
    deleteEvidence,
    clearEvidence,
    getCasePackets,
    getCasePacket,
    saveCasePacket,
    deleteCasePacket,
    clearCasePackets,
    getSettings,
    saveSettings
  };

  root.VerivaeStorage = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
