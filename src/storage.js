(function (root) {
  const evidenceKey = "verivae:evidence:v1";
  const settingsKey = "verivae:settings:v1";
  const memoryStore = {};

  const defaultSettings = {
    saveEvidenceLocally: true,
    helperReviewReminder: true,
    safetyNudges: true
  };

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

  function getSettings() {
    return { ...defaultSettings, ...readJson(settingsKey, defaultSettings) };
  }

  function saveSettings(settings) {
    const next = { ...defaultSettings, ...settings };
    writeJson(settingsKey, next);
    return next;
  }

  const api = {
    getEvidence,
    saveEvidence,
    deleteEvidence,
    clearEvidence,
    getSettings,
    saveSettings
  };

  root.VerivaeStorage = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
