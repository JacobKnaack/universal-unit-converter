import { walkAndConvert } from "./dom/walker.js";

walkAndConvert(document.body);

const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    m.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        walkAndConvert(node);
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
