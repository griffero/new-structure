<script setup lang="ts">
import { computed, reactive, ref } from "vue";

type Person = {
  row: number;
  name: string;
  role: string;
  country: string;
  team: string;
};

type TeamState = {
  row: number;
  name: string;
  target: string;
};

const sidebarOpen = ref(true);
const query = ref("");
const draggingRow = ref<number | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");

const store = reactive<{
  people: Person[];
  states: TeamState[];
}>({
  people: [],
  states: [],
});

const teamEmoji = (name: string) => {
  const t = name.toLowerCase();
  if (t.includes(" cl")) return "🇨🇱";
  if (t.includes(" mx")) return "🇲🇽";
  return "🌍";
};

async function fetchState() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await fetch("/api/state");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    store.people = data.people || [];
    store.states = data.states || [];
  } catch (err) {
    errorMsg.value = `Sync error: ${(err as Error).message}`;
  } finally {
    loading.value = false;
  }
}

fetchState();

const peopleByTeam = computed<Record<string, Person[]>>(() => {
  const grouped: Record<string, Person[]> = { "Sin asignar": [] };
  for (const state of store.states) grouped[state.name] = [];

  for (const person of store.people) {
    const team = grouped[person.team] ? person.team : "Sin asignar";
    const bucket = grouped[team];
    if (bucket) bucket.push(person);
  }

  for (const key of Object.keys(grouped)) {
    const bucket = grouped[key];
    if (bucket) bucket.sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
});

const totalHeadcount = computed(() => store.people.length);
const finalHeadcount = computed(
  () => store.people.filter((p) => p.team !== "Sin asignar").length,
);
const visibleStates = computed(() =>
  store.states.filter((s) => s.name !== "Sin asignar"),
);

function numericTarget(value: string): number | null {
  const n = Number(String(value ?? "").trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

function roleEmoji(role: string) {
  const r = (role || "").toLowerCase();
  if (r.includes("engineer") || r.includes("developer") || r.includes("sre")) return "⚙️";
  if (
    r.includes("sales") ||
    r.includes("account executive") ||
    r.includes("business development") ||
    r.includes("consultant") ||
    r.includes("kam")
  ) return "💸";
  if (r.includes("design")) return "🎨";
  if (r.includes("product manager") || r.includes("product")) return "🧩";
  if (r.includes("success") || r.includes("support")) return "🤝";
  if (r.includes("legal") || r.includes("compliance")) return "⚖️";
  if (r.includes("finance") || r.includes("treasury")) return "📊";
  if (r.includes("people") || r.includes("hr") || r.includes("talent")) return "🌱";
  if (r.includes("security")) return "🛡️";
  if (r.includes("ops")) return "📦";
  if (r.includes("founder") || r.includes("manager") || r.includes("head")) return "🧭";
  return "👤";
}

const filteredPeople = computed(() => {
  const source = peopleByTeam.value["Sin asignar"] || [];
  const q = query.value.trim().toLowerCase();
  if (!q) return source;
  return source.filter((p) =>
    [p.name, p.role, p.team, p.country].join(" ").toLowerCase().includes(q),
  );
});

function onDragStart(row: number) {
  draggingRow.value = row;
}

function onDragEnd() {
  draggingRow.value = null;
}

async function onDrop(team: string) {
  if (!draggingRow.value || saving.value) return;
  const row = draggingRow.value;
  draggingRow.value = null;
  saving.value = true;
  errorMsg.value = "";

  const person = store.people.find((p) => p.row === row);
  const previous = person?.team || "Sin asignar";
  if (person) person.team = team;

  try {
    const res = await fetch("/api/move", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ row, team }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    if (person) person.team = previous;
    errorMsg.value = `Move failed: ${(err as Error).message}`;
  } finally {
    saving.value = false;
  }
}

async function changeTarget(state: TeamState, delta: number) {
  if (saving.value) return;
  const current = numericTarget(state.target);
  const next = current === null ? (delta > 0 ? 1 : 0) : Math.max(0, current + delta);
  const prev = state.target;
  state.target = String(next);
  saving.value = true;
  errorMsg.value = "";
  try {
    const res = await fetch("/api/target", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ row: state.row, target: next }),
    });
    if (!res.ok) throw new Error(await res.text());
  } catch (err) {
    state.target = prev;
    errorMsg.value = `Target update failed: ${(err as Error).message}`;
  } finally {
    saving.value = false;
  }
}

function allowDrop(event: DragEvent) {
  event.preventDefault();
}

function onPageClick(event: MouseEvent) {
  if (draggingRow.value) return;
  if (!sidebarOpen.value) return;
  if (event.target === event.currentTarget) sidebarOpen.value = false;
}
</script>

<template>
  <div class="app-shell">
    <button class="sidebar-launch" @click="sidebarOpen = !sidebarOpen">
      {{ sidebarOpen ? "Cerrar" : "People" }}
    </button>

    <aside :class="['floating-sidebar', { open: sidebarOpen }]">
      <div class="sidebar-header">
        <h3>People</h3>
      </div>
      <div class="sidebar-body">
        <div class="sidebar-meta">
          <strong>{{ totalHeadcount }}</strong>
          <span>total</span>
        </div>
        <div class="sidebar-meta">
          <strong>{{ peopleByTeam['Sin asignar']?.length || 0 }}</strong>
          <span>sin asignar</span>
        </div>
        <input v-model="query" class="people-search" placeholder="Buscar nombre o rol..." />
        <div class="people-list">
          <article
            v-for="person in filteredPeople"
            :key="person.row"
            class="person-item"
            draggable="true"
            @dragstart="onDragStart(person.row)"
            @dragend="onDragEnd"
          >
            <div class="person-name">{{ roleEmoji(person.role) }} {{ person.name }}</div>
            <div class="person-role">{{ person.role || "N/A" }}</div>
          </article>
        </div>
      </div>
    </aside>

    <div class="page" @click="onPageClick" @dragover="allowDrop" @drop="onDrop('Sin asignar')">
      <div class="noise"></div>
      <div class="top-fade"></div>
      <header class="hero block">
        <p class="kicker">Fintoc Org Reset</p>
        <h1>ROI or it does not ship. 🚀</h1>
        <p class="sub">
          Small independent teams. Global standards. Local execution. AI-native
          generalists flying end-to-end.
        </p>
        <div class="chips">
          <span>One north metric: ROI</span>
          <span>Independence by default</span>
          <span>Reuse is optional, never required</span>
          <span>Final headcount: {{ finalHeadcount }}</span>
          <span v-if="saving">Saving...</span>
        </div>
        <p v-if="loading || errorMsg" class="sub">
          {{ loading ? "Loading spreadsheet..." : errorMsg }}
        </p>
      </header>

      <section class="path">
        <div class="path-step block">
          <h2>1. Focus</h2>
          <p>Each team owns one mission and one ROI equation.</p>
        </div>
        <div class="path-step block">
          <h2>2. Independence</h2>
          <p>Teams can use assets from others, but are not blocked by others.</p>
        </div>
        <div class="path-step block">
          <h2>3. Compounding</h2>
          <p>AI enables generalists to move faster with fewer handoffs.</p>
        </div>
      </section>

      <section class="teams">
        <article
          v-for="state in visibleStates"
          :key="state.name"
          :class="[
            'team block dropzone',
            {
              'over-capacity':
                numericTarget(state.target) !== null &&
                (peopleByTeam[state.name]?.length || 0) > (numericTarget(state.target) || 0),
            },
          ]"
          @dragover="allowDrop"
          @drop.stop="onDrop(state.name)"
        >
          <div class="team-title">
            <span>{{ teamEmoji(state.name) }} {{ state.name }}</span>
            <div class="team-capacity">
              <button class="target-btn" @click.stop="changeTarget(state, -1)">-</button>
              <strong>{{ peopleByTeam[state.name]?.length || 0 }} · {{ state.target || "-" }}</strong>
              <button class="target-btn" @click.stop="changeTarget(state, 1)">+</button>
            </div>
          </div>
          <div class="team-members">
            <span
              v-for="member in (peopleByTeam[state.name] || []).slice(0, 5)"
              :key="member.row"
              draggable="true"
              @dragstart="onDragStart(member.row)"
              @dragend="onDragEnd"
            >
              {{ roleEmoji(member.role) }} {{ member.name }}
            </span>
            <span v-if="(peopleByTeam[state.name]?.length || 0) > 5">
              +{{ (peopleByTeam[state.name]?.length || 0) - 5 }} más
            </span>
          </div>
        </article>
      </section>

      <footer class="footer block">
        <p>Build autonomous teams. Keep the bar high. Measure everything in ROI.</p>
      </footer>
    </div>
  </div>
</template>
