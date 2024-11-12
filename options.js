import defaultOptions from "./default_options.js";

function loadOptions() {
  chrome.storage.sync.get(defaultOptions, items => {
    createTableFromRules(items.rules);
  });
}

function saveOptions() {
  const rules = getRulesFromTable();
  chrome.storage.sync.set({ rules }, () => {
    alert(chrome.i18n.getMessage("options_saved"));
  });

  // do not submit
  return false;
}

function restoreOptions() {
  if (window.confirm(chrome.i18n.getMessage("options_confirm_restore"))) {
    createTableFromRules(defaultOptions.rules);
    alert(chrome.i18n.getMessage("options_restored"));
  }
}

function createTableFromRules(rules) {
  const tbody = document.getElementById("swap-tbody");
  tbody.replaceChildren();

  for (const rule of rules) {
    addTableRow(rule["source"], rule["target"], rule["enable"]);
  }
}

function getRulesFromTable() {
  const rules = [];
  const tbody = document.getElementById("swap-tbody");
  for (const tr of tbody.children) {
    const source = escapeInput(tr.children[0].children[0].value);
    const target = escapeInput(tr.children[2].children[0].value);
    const enable = tr.children[3].children[0].checked;
    rules.push({ source, target, enable });
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
  const tbody = document.getElementById("swap-tbody");
  const tr = document.createElement("tr");
  let td, inp, btn, spn;

  // source
  td = document.createElement("td");
  inp = document.createElement("input");
  inp.type = "text";
  inp.required = true;
  inp.value = source;
  inp.placeholder = chrome.i18n.getMessage("options_font_name");
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
  inp.placeholder = chrome.i18n.getMessage("options_font_name");
  td.appendChild(inp);
  tr.appendChild(td);

  // enable
  td = document.createElement("td");
  inp = document.createElement("input");
  inp.type = "checkbox";
  inp.checked = enable;
  td.appendChild(inp);
  tr.appendChild(td);

  // delete
  td = document.createElement("td");
  btn = document.createElement("button");
  spn = document.createElement("span");
  spn.textContent = "delete";
  spn.classList.add("material-symbols-outlined");
  btn.title = chrome.i18n.getMessage("options_delete");
  btn.onclick = () => tbody.removeChild(tr);
  btn.appendChild(spn);
  td.appendChild(btn);
  tr.appendChild(td);

  tbody.appendChild(tr);
}

window.addEventListener("load", () => {
  loadOptions();
  document.getElementById("swap-form").onsubmit = saveOptions;
  document.getElementById("restore").onclick = restoreOptions;
  // use lambda to prevent arguments being given
  document.getElementById("add").onclick = () => addTableRow();

  // localize
  document.querySelectorAll("[data-locale]").forEach(e => {
    e.textContent = chrome.i18n.getMessage(e.dataset.locale);
  });
  document.querySelectorAll("[data-locale-title]").forEach(e => {
    e.title = chrome.i18n.getMessage(e.dataset.localeTitle);
  });
});