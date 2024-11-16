async function insertStyle() {
  const options = await chrome.storage.sync.get("rules");
  if (!options.rules) return;

  let styles = "";
  for (const rule of options.rules) {
    if (rule["enable"]) {
      for (const local of rule["locals"]) {
        styles += `@font-face{font-family:'${rule["source"]}';src:local('${local.fullName}');`
          + `font-weight:${local.weight};font-style:${local.style};}`;
      }
    }
  }
  document.head.insertAdjacentHTML("beforeend", `<style id="fontswap">${styles}</style>`);
};

const observer = new MutationObserver(() => {
  if (document.head) {
    insertStyle();
    observer.disconnect();
  }
});

observer.observe(document, { childList: true, subtree: true });