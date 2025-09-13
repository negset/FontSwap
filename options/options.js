const defaultOptions = {
  rules: [
    {
      source: "Segoe UI",
      target: "Arial",
      enable: false
    },
    {
      source: "Consolas",
      target: "Cascadia Code",
      enable: false
    }
  ]
};

let localFonts = [];

function loadOptions() {
  chrome.storage.sync.get(defaultOptions, items => {
    createTableFromRules(items.rules);
  });
}

function saveOptions() {
  try {
    const rules = getRulesFromTable();
    chrome.storage.sync.set({ rules }, () => {
      alert(chrome.i18n.getMessage("options_saved"));
    });
  } catch (err) {
    alert(chrome.i18n.getMessage("options_save_error") + ": " + err.message);
  }
}

function restoreOptions() {
  if (confirm(chrome.i18n.getMessage("options_confirm_restore"))) {
    createTableFromRules(defaultOptions.rules);
    alert(chrome.i18n.getMessage("options_restored"));
  }
}

function exportOptions() {
  chrome.storage.sync.get(defaultOptions, items => {
    for (const rule of items.rules) {
      // do not export locals
      delete rule.locals;
    }
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fontswap_options.json";
    a.click();
    // relase object url
    URL.revokeObjectURL(url);
  });
}

function importOptions() {
  const fileInput = document.querySelector("#import-input");
  fileInput.click();

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (!validateOptions(obj)) {
          throw new Error(chrome.i18n.getMessage("options_invalid_file_structure"));
        }
        createTableFromRules(obj.rules);
        alert(chrome.i18n.getMessage("options_imported"));
      } catch (err) {
        alert(chrome.i18n.getMessage("options_import_error") + ": " + err.message);
      }
    };
    reader.readAsText(file, "utf-8");
    // reset value to allow repeated file selection
    fileInput.value = "";
  };
}

function validateOptions(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  if (!Array.isArray(obj.rules)) return false;
  for (const rule of obj.rules) {
    if (typeof rule.enable !== "boolean") return false;
    if (typeof rule.source !== "string") return false;
    if (typeof rule.target !== "string") return false;
  }
  return true;
}

function createTableFromRules(rules) {
  const tbody = document.querySelector("#rule-tbody");
  tbody.replaceChildren();

  for (const rule of rules) {
    addTableRow(rule["source"], rule["target"], rule["enable"]);
  }
}

function getRulesFromTable() {
  const rules = [];
  const tbody = document.querySelector("#rule-tbody");
  const weightMap = {
    "thin": 100,
    "extralight": 200,
    "ultralight": 200,
    "light": 300,
    "normal": 400,
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "demibold": 600,
    "bold": 700,
    "extrabold": 800,
    "ultrabold": 800,
    "black": 900,
    "heavy": 900,
  };

  for (const tr of tbody.children) {
    const source = escapeInput(tr.children[0].children[0].value);
    const target = escapeInput(tr.children[2].children[0].value);
    const enable = tr.children[3].children[0].checked;
    const locals = [];

    const targets = localFonts.filter(font => font.family == target);
    if (targets.length == 0) {
      throw new Error(chrome.i18n.getMessage("options_target_not_found", target));
    }
    for (const t of targets) {
      let weight = 400;
      let style = "normal";
      let s = t.style.toLowerCase();

      for (const w in weightMap) {
        if (s.startsWith(w)) {
          weight = weightMap[w];
          // consume
          s = s.replace(w, "");
          break;
        }
      }
      if (s.endsWith("italic")) {
        style = "italic";
        // consume
        s = s.replace("italic", "");
      }
      // skip unknown style
      if (s.trim() != "") continue;

      locals.push({ fullName: t.fullName, weight, style });
    }

    rules.push({ source, target, enable, locals });
  }
  return rules;
}

function escapeInput(str) {
  const patterns = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };
  return str.replace(/[<>&"'`]/g, (match) => patterns[match]);
}

function addTableRow(source = "", target = "", enable = true) {
  const tbody = document.querySelector("#rule-tbody");
  const tr = document.createElement("tr");
  let td, inp, btn, spn;

  // source
  td = document.createElement("td");
  inp = document.createElement("input");
  inp.type = "text";
  inp.required = true;
  inp.value = source;
  inp.placeholder = chrome.i18n.getMessage("options_font_name");
  inp.addEventListener("keydown", e => {
    // prevent to submit
    if (e.key === "Enter") e.preventDefault();
  });
  td.appendChild(inp);
  tr.appendChild(td);

  // arrow
  td = document.createElement("td");
  spn = document.createElement("span");
  spn.textContent = "arrow_forward";
  spn.classList.add("material-symbols-outlined");
  td.appendChild(spn);
  tr.appendChild(td);

  // target
  td = document.createElement("td");
  inp = document.createElement("input");
  inp.type = "text";
  inp.required = true;
  inp.value = target;
  inp.setAttribute("list", "font-list");
  inp.placeholder = chrome.i18n.getMessage("options_font_name");
  inp.addEventListener("keydown", e => {
    // prevent to submit
    if (e.key === "Enter") e.preventDefault();
  });
  td.appendChild(inp);
  tr.appendChild(td);

  // enable
  td = document.createElement("td");
  inp = document.createElement("input");
  inp.type = "checkbox";
  inp.checked = enable;
  inp.addEventListener("keydown", e => {
    // prevent to submit
    if (e.key === "Enter") e.preventDefault();
  });
  td.appendChild(inp);
  tr.appendChild(td);

  // delete
  td = document.createElement("td");
  btn = document.createElement("button");
  spn = document.createElement("span");
  spn.textContent = "delete";
  spn.classList.add("material-symbols-outlined");
  btn.title = chrome.i18n.getMessage("options_delete");
  btn.type = "button";
  btn.onclick = () => tbody.removeChild(tr);
  btn.appendChild(spn);
  td.appendChild(btn);
  tr.appendChild(td);

  tbody.appendChild(tr);
}

async function updateLocalFonts() {
  localFonts = await queryLocalFonts();

  // remove dups
  const families = Array.from(new Set(localFonts.map(f => f.family)));
  const fontList = document.querySelector("#font-list");
  fontList.replaceChildren();
  for (const family of families) {
    const op = document.createElement("option");
    op.value = family;
    fontList.appendChild(op);
  }
}

function applyPermissionState(state) {
  const grant = document.querySelector("#grant");
  const ruleForm = document.querySelector("#rule-form fieldset");
  switch (state) {
    case "granted":
      grant.classList.remove("denied");
      grant.children[0].textContent = "check_circle";
      grant.children[1].textContent = chrome.i18n.getMessage("options_permission_granted");
      grant.disabled = true;
      ruleForm.disabled = false;
      ruleForm.title = "";
      break;

    case "denied":
      grant.classList.add("denied");
      grant.children[0].textContent = "error";
      grant.children[1].textContent = chrome.i18n.getMessage("options_permission_denied");
      grant.onclick = () => {
        const msg = chrome.i18n.getMessage("options_open_permissions_settings")
          + "\n" + chrome.i18n.getMessage("options_permission_request");
        if (confirm(msg)) {
          const url = "chrome://settings/content/siteDetails?site=chrome-extension%3A%2F%2F"
            + chrome.runtime.id;
          chrome.tabs.create({ url });
        }
      };
      break;
  }
}

function localize() {
  document.querySelectorAll("[data-locale]").forEach(e => {
    e.textContent = chrome.i18n.getMessage(e.dataset.locale);
  });
  document.querySelectorAll("[data-locale-title]").forEach(e => {
    e.title = chrome.i18n.getMessage(e.dataset.localeTitle);
  });
}

addEventListener("load", () => {
  loadOptions();
  localize();

  document.querySelector("#grant").onclick = updateLocalFonts;
  document.querySelector("#rule-form").onsubmit = e => { e.preventDefault(); saveOptions(); };
  document.querySelector("#restore").onclick = restoreOptions;
  document.querySelector("#export").onclick = exportOptions;
  document.querySelector("#import").onclick = importOptions;
  // use lambda to prevent arguments being given
  document.querySelector("#add").onclick = () => addTableRow();

  navigator.permissions
    .query({ name: "local-fonts" })
    .then((status) => {
      if (status.state == "granted") updateLocalFonts();
      applyPermissionState(status.state)
      status.onchange = () => applyPermissionState(status.state);
    });
});
