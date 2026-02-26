# Context Log - Fintoc Restructure

## Goal
Design a new team structure with very small, functional pods (<=10), only support areas as Security/Legal/HR, and all other teams fully autonomous.

## Current state
- Spreadsheet in use: `1sbYGWOPsZj2uhu06f2JGfR1GYNCTjPE0ekNl-NCPhIc`
- Tabs created and maintained: `Model`, `People`, `Teams`, `Scenarios`, `Source_Code`, `Import_Log`
- Notion Team Directory imported: 96 people from database `f2ef45c3-20bf-4684-bb4b-f81b9d8b96d8`
- Team model updated to:
  - Customer-facing pods
  - Internal core/regulatory/treasury pods
  - Support-only pods (Security/Legal/HR)

## User correction
- Previous split was rejected.
- New instruction: infer initial split from real GitHub activity (who is working on what project).

## In progress now
- Building evidence map from GitHub org `fintoc-com`:
  - contributor -> repos touched (last 90 days)
  - repo -> top contributors
  - repo -> domain class for pod assignment


## 2026-02-25 Update: GitHub evidence added
- Source window: last 90 days.
- Repos analyzed: 16 key repos from `fintoc-com` (core, customer-facing, infra/platform).
- Contributors detected: 52.
- Added spreadsheet tab: `GitHub_Activity` with columns:
  - contributor
  - total commits (90d)
  - repos touched
  - top repos
  - category commit split (customer/internal/platform)
  - suggested pod family and team hint
- Added log entry in `Import_Log`.

## 2026-02-25 Update: Initial GitHub-based reassignment applied
- Applied high-signal assignment pass from `GitHub_to_People` into `People` (threshold: >=5 commits in top-mapped repo family).
- Rows updated in spreadsheet: 12 people.
- Reassigned examples:
  - Gonzalo -> `CF_PAY_OS_MX` (heavy activity in `wizard-web`, `fintoc-rails`, `payment-links-app`)
  - Felipe Campbell -> `INT_REGULATED_CONN` (heavy activity in `pacioli`)
  - Ahinri -> `INT_REGULATED_CONN` (heavy activity in `hermes`)
  - Benito Palacios -> `INT_REGULATED_CONN` (heavy activity in `cowry`)
  - Julián -> `INT_REGULATED_CONN` (heavy activity in `fibra`)
  - Mateo -> `INT_LEDGER_CORE` (heavy activity in `mayday`)
  - Francisca -> `CF_PAY_OS_CL_ENT` (heavy activity in `dashboard`)
- Logged this step in `Import_Log`.

## Next iteration
- Rebalance all customer-facing pods to hard cap `<=10` people.
- Split overloaded internal pods (`INT_LEDGER_CORE`, `INT_REGULATED_CONN`) into smaller country/product cells while preserving GitHub evidence.
- Keep support teams constrained to `Security`, `Legal`, `HR`.

## 2026-02-25 Update: Team iteration v1 applied (pods <=10)
- Implemented a first full rebalance pass directly in spreadsheet:
  - Rewrote `People` assignments (`Proposed_Team` + `Final_Team_Assignment (Team_ID)`).
  - Rebuilt `Teams` tab from resulting pods.
- Assignment logic used:
  - High-signal GitHub hint first (>=5 commits in mapped family),
  - Then role/area fallback rules by country and product type,
  - Then automatic pod split to enforce max 10.
- Result:
  - Pods generated: 16
  - Max team size after rebalance: 10
  - Large overloaded groups were split into pods:
    - `CF_PAY_LT_CL` -> `CF_PAY_LT_CL_P1..P4`
    - `INT_LEDGER_CORE_CL` -> `INT_LEDGER_CORE_CL_P1..P4`
  - Internal/regulatory high-signal cluster preserved:
    - `INT_REGULATED_CONN_CL` with 8 people.
- `Import_Log` updated with `Team iteration v1`.

## 2026-02-25 Update: People category added
- Added `Category` column in `People` (column `R`).
- Introduced explicit category `COORDINADORES`.
- Initial auto-tagging applied from role keywords (`head`, `manager`, `lead`, `founder`), resulting in 26 tagged people.

## 2026-02-25 Update: fibra -> Regulated Connections
- Applied direct rule requested in chat: people with `fibra` activity moved to `Regulated Connections`.
- Source used: `GitHub_to_People` (`Top_Repos` contains `fibra` and has a matched person).
- Updated in `People` both assignment columns (`Proposed_Team`, `Final_Team_Assignment`):
  - Chris -> `Regulated Connections CL`
  - Julián -> `Regulated Connections CL`

## 2026-02-26 Update: founder / country manager / admin rules
- Decision captured and applied:
  - Founders act as global unblockers.
  - Country Managers act as local unblockers.
  - Admin lives with `HR`.
- Applied in `People`:
  - Tagged founders with global-unblocker note: `Cristóbal`, `Lukas`.
  - Tagged country manager with local-unblocker note: `Ignacio` (Country Manager Chile).
  - Moved admin profiles to `HR`: `Isi Faúndez`, `Pili`, `Tomás Ozzano`.

## 2026-02-26 Update: Landing narrative asset created
- Built a new Vue 3 landing at `team-landing/` to explain the reorg decision with short-form messaging and brutalist visual style.
- Core narrative encoded:
  - `ROI` as the single north metric.
  - Independence by default.
  - Teams may reuse things from other teams, but are not required to depend on them.
  - AI enables generalists to execute end-to-end faster.
- Build check executed successfully (`npm run build`) with a Node version warning from Vite engine requirements.

## 2026-02-26 Update: Production-ready board sync prototype
- Reworked `team-landing` into an operational assignment board (not only static landing):
  - Collapsible sidebar with all people.
  - Expandable teams with member list.
  - Drag/drop from sidebar or team cards.
  - Live headcount counters.
  - Country emojis: `🇨🇱` for CL, `🇲🇽` for MX, `🌍` for global.
  - Added `Enablers Globales`, `Enablers Locales CL`, `Enablers Locales MX`.
- Added local backend API (`team-landing/server/index.mjs`) with Composio integration:
  - `GET /api/state` reads People sheet.
  - `POST /api/move` updates `People!G{row}` assignment.
  - Includes retries and typo-tolerant team normalization.
- Updated scripts:
  - `npm run dev` now runs web + server concurrently.
  - `npm run build` remains green (with Node engine warning from Vite).

## 2026-02-26 Update: Team states + column G persistence
- Created spreadsheet sheet `Team_States` listing all valid assignment states (+ target size):
  - `Sin asignar`
  - `Movements CL`
  - `Payments OS Enterprise CL`
  - `Payments Long-tail Global`
  - `Payment OS MX`
  - `HR`, `Legal`, `Finance Global`, `Treasury + Ledger`, `Infra Regulada + Conexiones Bajo Nivel`, `Security`
  - `Enablers Globales`, `Enablers Locales CL`, `Enablers Locales MX`
- Set initial state in `People!G` to `Sin asignar` for all 96 people.
- Implemented backend sync service (`team-landing/server/index.mjs`):
  - `GET /api/state`: reads `People` + `Team_States`.
  - `POST /api/move`: persists drag/drop assignment to `People!G{row}`.
- Frontend now consumes `/api/state` and writes moves via `/api/move`.
- Verified with live calls:
  - state load: `states=14`, `people=96`, `sin_asignar=96`
  - move write test to `People!G` and rollback succeeded (`200 OK`).

## 2026-02-26 Update: UX controls + capacity management
- Added drag/drop between teams and drop-to-empty-area to move back to `Sin asignar`.
- Added role emojis in both sidebar and team chips for quick composition scan.
- Added click-on-empty-space behavior to close the sidebar when not dragging.
- Added `Final headcount` metric (counts only assigned people; excludes `Sin asignar`).
- Added per-team target controls (`+` / `-`) that persist to `Team_States!B`.
- Added over-capacity visual state (team card turns red when `headcount > target`).
- Removed `Sin asignar` from team card grid (kept as internal state/bucket only).
