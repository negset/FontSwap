async function insertStyle() {
  const options = await chrome.storage.sync.get("rules");
  if (!options.rules) return;

  let styles = "";
  for (const rule of options.rules) {
    if (rule["enable"]) {
      styles += `@font-face{font-family:'${rule["source"]}';src:local('${rule["target"]}')}`;
    }
  }
  document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
};

const observer = new MutationObserver(() => {
  if (document.head) {
    insertStyle();
    observer.disconnect();
  }
});

observer.observe(document, { childList: true, subtree: true });