# Contributing to SnipGuard

Thanks for helping keep prompts safe!

## How to build
- Load the `snipguard/` dir as an unpacked extension in Chromium-based browsers.
- Content scripts live in `src/`. No external network calls allowed.

## Adding a detector
- Edit `src/detectors.js` and add a simple regex + (optionally) a verifier.
- Prefer deterministic signatures; use entropy only as a fallback.
- Add safe, synthetic examples to tests (no real secrets).

## UX
- Keep warnings short and actionable.
- Always offer: **Mask & paste**, **Paste anyway**, **Cancel**.
- Avoid blocking user workflows without a clear reason.

## Reporting security issues
Please follow `SECURITY.md` (no public issues for vulnerabilities; email first).
