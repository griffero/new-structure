import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.COMPOSIO_API_KEY || "ak_pFBmN_X0ojNiwpDpyCdb";
const CONNECTED_ACCOUNT_ID =
  process.env.COMPOSIO_CONNECTED_ACCOUNT_ID || "ca_-3_RVghOWqCd";
const ENTITY_ID = process.env.COMPOSIO_ENTITY_ID || "default";
const SPREADSHEET_ID =
  process.env.SPREADSHEET_ID || "1sbYGWOPsZj2uhu06f2JGfR1GYNCTjPE0ekNl-NCPhIc";
const BASE = "https://backend.composio.dev/api/v3/tools/execute";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist");

async function run(slug, args) {
  const res = await fetch(`${BASE}/${slug}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      connected_account_id: CONNECTED_ACCOUNT_ID,
      entity_id: ENTITY_ID,
      arguments: args,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.successful) {
    throw new Error(json.error || `${slug} failed`);
  }
  return json.data;
}

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/state", async (_req, res) => {
  try {
    const data = await run("GOOGLESHEETS_BATCH_GET", {
      spreadsheet_id: SPREADSHEET_ID,
      ranges: ["People!A1:R400", "Team_States!A1:B200"],
    });
    const peopleRows = data.valueRanges?.[0]?.values || [];
    const stateRows = data.valueRanges?.[1]?.values || [];

    const states = stateRows
      .slice(1)
      .map((r, i) => ({ row: i + 2, name: r[0] || "", target: r[1] || "" }))
      .filter((s) => s.name);
    const valid = new Set(states.map((s) => normalize(s.name)));

    const h = peopleRows[0] || [];
    const idx = Object.fromEntries(h.map((col, i) => [col, i]));
    const personCol = idx.Person;
    const roleCol = idx.Current_Role;
    const countryCol = idx.Country;
    const teamCol =
      idx.Proposed_Team !== undefined ? idx.Proposed_Team : idx.Proposed_Team_Code;

    const people = peopleRows
      .slice(1)
      .map((r, i) => {
        const row = i + 2;
        const name = r[personCol] || "";
        if (!name) return null;
        const role = r[roleCol] || "";
        const country = r[countryCol] || "";
        const rawTeam = r[teamCol] || "";
        const team = valid.has(normalize(rawTeam)) ? rawTeam : "Sin asignar";
        return { row, name, role, country, team };
      })
      .filter(Boolean);

    res.json({ states, people });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/move", async (req, res) => {
  const { row, team } = req.body || {};
  if (!row || !team) return res.status(400).json({ error: "row and team are required" });
  try {
    await run("GOOGLESHEETS_BATCH_UPDATE", {
      spreadsheet_id: SPREADSHEET_ID,
      sheet_name: "People",
      first_cell_location: `G${Number(row)}`,
      valueInputOption: "USER_ENTERED",
      values: [[team]],
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/target", async (req, res) => {
  const { row, target } = req.body || {};
  if (!row) return res.status(400).json({ error: "row is required" });
  try {
    await run("GOOGLESHEETS_BATCH_UPDATE", {
      spreadsheet_id: SPREADSHEET_ID,
      sheet_name: "Team_States",
      first_cell_location: `B${Number(row)}`,
      valueInputOption: "USER_ENTERED",
      values: [[String(target ?? "")]],
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rename-team", async (req, res) => {
  const { row, oldName, newName } = req.body || {};
  const teamRow = Number(row);
  const sourceName = String(oldName || "").trim();
  const nextName = String(newName || "").trim();

  if (!teamRow || !sourceName || !nextName) {
    return res.status(400).json({ error: "row, oldName and newName are required" });
  }
  if (normalize(nextName) === normalize("Sin asignar")) {
    return res.status(400).json({ error: "invalid team name" });
  }

  try {
    const check = await run("GOOGLESHEETS_BATCH_GET", {
      spreadsheet_id: SPREADSHEET_ID,
      ranges: ["Team_States!A1:A250"],
    });
    const rows = check.valueRanges?.[0]?.values || [];
    const normalizedNext = normalize(nextName);
    const duplicate = rows
      .slice(1)
      .some((r, i) => i + 2 !== teamRow && normalize(r[0] || "") === normalizedNext);
    if (duplicate) return res.status(409).json({ error: "team name already exists" });

    await run("GOOGLESHEETS_BATCH_UPDATE", {
      spreadsheet_id: SPREADSHEET_ID,
      sheet_name: "Team_States",
      first_cell_location: `A${teamRow}`,
      valueInputOption: "USER_ENTERED",
      values: [[nextName]],
    });

    const peopleCol = await run("GOOGLESHEETS_BATCH_GET", {
      spreadsheet_id: SPREADSHEET_ID,
      ranges: ["People!G2:G400"],
    });
    const values = peopleCol.valueRanges?.[0]?.values || [];
    const oldNormalized = normalize(sourceName);

    for (let i = 0; i < values.length; i += 1) {
      const current = values[i]?.[0] || "";
      if (normalize(current) !== oldNormalized) continue;
      const sheetRow = i + 2;
      await run("GOOGLESHEETS_BATCH_UPDATE", {
        spreadsheet_id: SPREADSHEET_ID,
        sheet_name: "People",
        first_cell_location: `G${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        values: [[nextName]],
      });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(DIST_DIR));
app.use((_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`sync server on http://127.0.0.1:${PORT}`);
});
