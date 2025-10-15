// SnipGuard service worker: manages default policy and upgrades.
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    allowlist: [],
    blockOn: { api: true, pii: true, code: true },
    orgMarkers: [],
    modeByHost: {} // e.g., {"chat.openai.com": "block"|"warn"|"ignore"}
  };
  const current = await chrome.storage.sync.get(null);
  if (!current || Object.keys(current).length === 0) {
    await chrome.storage.sync.set(defaults);
  }
});
