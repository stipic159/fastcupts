# Critical requirements review

Checked against the official FACEIT Data API, WXT, Fastify and SheetJS documentation on 2026-08-23.

## Blocking decisions before a 1.0 commitment

1. **Starting five cannot be inferred reliably from a registration roster.** FASTCUP may expose every registered player, while the actual playing roster can change. The specification correctly requires a manual override, but it does not define the source of truth or UX when that information is unavailable. Team metrics must visibly show `FULL_ROSTER`, `PARTIAL_ROSTER` or `STARTING_ROSTER_UNKNOWN`; no predicted winner should silently assume five players.
2. **Tournament parsing has no stable, documented FASTCUP contract.** The permitted source is DOM / page-loaded data, and selectors can change at any time. Real HTML fixtures from each target page are required before a parser can be implemented or a 32-team criterion can be promised. The adapter and selector registry are therefore isolated in the scaffold.
3. **FACEIT has a single-player lookup, not the batch endpoint assumed by the extension flow.** `POST /v1/faceit/players/batch` must remain an API of this backend; it will deduplicate IDs, cache results and send bounded individual requests to FACEIT. API quota and commercial terms for the intended FACEIT key must be confirmed before setting 200-player performance targets.
4. **The random-draw model is underspecified.** Seeding, regional constraints, byes, walkovers, BO format and double-elimination rules must be known for each FASTCUP tournament. A purely random bracket is a useful scenario tool, but cannot be labelled as an accurate tournament forecast without those rules.

## Important implementation constraints

- The FACEIT endpoint described in the specification is valid: `GET /players?game=cs2&game_player_id={SteamID64}`. The API key must remain backend-only.
- A Chrome extension needs its concrete deployed backend host permission. The placeholder `YOUR_API_DOMAIN` must be replaced for each release. CORS should allow only the deployed extension origin(s), not a public wildcard.
- SheetJS supports MV3 downloads through `XLSX.write(..., { type: 'base64' })` plus `chrome.downloads.download`; the `downloads` permission is sufficient.
- WXT has no dedicated Preact module. This project uses the officially supported Vite-plugin route with `@preact/preset-vite`.
- The public npm `xlsx` package is retained because the specification requires SheetJS CE; keep it under explicit dependency/security review before store release.

## Sources

- https://docs.faceit.com/api/data/
- https://wxt.dev/guide/essentials/frontend-frameworks.html
- https://fastify.dev/docs/v5.0.x/Guides/Migration-Guide-V5/
- https://docs.sheetjs.com/docs/demos/extensions/chromium/
