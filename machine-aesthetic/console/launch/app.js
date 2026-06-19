const $ = (sel) => document.querySelector(sel);

async function api(path, opts) {
  const res = await fetch(path, opts);
  return res.json();
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 5000);
}

function renderStatus(s) {
  $("#osc-endpoint").textContent = `${s.osc.host}:${s.osc.port}`;
  $("#seed").textContent = String(s.seed);

  const rows = [
    ["Launcher server", s.processes.server, "ok"],
    ["Pure Data", s.processes.pd, s.processes.pd ? "ok" : "off"],
    ["openFrameworks", s.processes.of, s.processes.of ? "ok" : "off"],
    ["Browser bridge", s.processes.bridge, s.processes.bridge ? "ok" : "off"],
    ["Code mural asset", s.wallpaper, s.wallpaper ? "ok" : "off"],
  ];

  const ofNote = s.ofBinary
    ? `Built app: ${s.ofBinary.split("/").slice(-3).join("/")}`
    : s.ofRoot
      ? `OF_ROOT set — will build on first native launch`
      : `Set OF_ROOT in launch.env for native walkthrough`;

  const pdNote = s.pdBinary
    ? `Pd: ${s.pdBinary.split("/").slice(-4).join("/")}`
    : s.pdInstalled
      ? `Pd: will open via Pure Data.app (not on PATH)`
      : `Install Pure Data or set PD_PATH in launch.env`;

  $("#status-list").innerHTML = rows
    .map(
      ([label, on, cls]) =>
        `<li class="${cls}">${on ? "●" : "○"} ${label}</li>`
    )
    .join("") + `<li class="small">${pdNote}</li><li class="small">${ofNote}</li>`;
}

async function refresh() {
  try {
    renderStatus(await api("/api/status"));
  } catch {
    $("#status-list").innerHTML = "<li>Could not reach launcher server.</li>";
  }
}

async function launch(mode) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((b) => { b.disabled = true; });
  try {
    const result = await api("/api/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const msg =
      result.of?.message ||
      result.bridge?.message ||
      result.pd?.message ||
      result.message ||
      "Launched";
    toast(msg);
    if (result.pd && !result.pd.ok) toast(result.pd.message);
    if (result.of && !result.of.ok) toast(result.of.message);
    await refresh();
  } catch (e) {
    toast(String(e.message || e));
  } finally {
    buttons.forEach((b) => { b.disabled = false; });
  }
}

$("#btn-native").addEventListener("click", () => launch("native"));
$("#btn-browser").addEventListener("click", () => launch("browser"));
$("#btn-stop").addEventListener("click", async () => {
  const r = await api("/api/stop", { method: "POST" });
  toast(r.message || "Stopped");
  refresh();
});

refresh();
setInterval(refresh, 3000);

// ?autostart=native|browser
const params = new URLSearchParams(location.search);
const auto = params.get("autostart");
if (auto === "native" || auto === "browser") launch(auto);
