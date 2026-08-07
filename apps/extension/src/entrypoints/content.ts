import { defineContentScript } from 'wxt/sandbox';
import { parseFormElement } from '@aksesara/form-parser';
import { setNativeInputValue, highlightTargetElement, clearHighlights } from '@aksesara/sync-engine';
import { FormGraph } from '@aksesara/form-schema';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('[Aksesara ContentScript] Loaded on tab:', window.location.href);

    // Store latest scanned FormGraph
    let currentFormGraph: FormGraph | null = null;

    function scanPageForms(): FormGraph | null {
      const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
      if (forms.length === 0) return null;

      // Prefer form with bridge marker or first available form on webpage
      const targetForm = forms.find((f) => f.hasAttribute('data-aksesara-form') || f.id.includes('aksesara')) || forms[0];
      currentFormGraph = parseFormElement(targetForm, 0, window.location.origin);

      // Check if verified bridge marker is present
      const bridgeScript = document.querySelector('script[data-aksesara-project]');
      if (bridgeScript) {
        currentFormGraph.mode = 'verified';
      }

      return currentFormGraph;
    }

    // Listen for custom event from @aksesara/bridge
    window.addEventListener('aksesara:open', (event: any) => {
      const detail = event.detail;
      console.log('[Aksesara ContentScript] Bridge trigger received:', detail);
      const graph = scanPageForms();

      // Broadcast to extension runtime (side panel / popup)
      chrome.runtime.sendMessage({
        type: 'FORM_SCANNED',
        payload: graph,
        bridgeDetail: detail,
      });
    });

    // Listen for runtime messages from Popup and Side Panel
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCAN_FORM') {
        const graph = scanPageForms();
        sendResponse({ success: true, graph });
        return true;
      }

      if (message.type === 'SYNC_FIELD_VALUE') {
        const { selector, value } = message.payload;
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
          const success = setNativeInputValue(el, value);
          sendResponse({ success });
        } else {
          sendResponse({ success: false, error: 'Element not found' });
        }
        return true;
      }

      if (message.type === 'HIGHLIGHT_FIELD') {
        const { selector } = message.payload;
        const success = highlightTargetElement(document, selector);
        sendResponse({ success });
        return true;
      }

      if (message.type === 'CLEAR_HIGHLIGHTS') {
        clearHighlights(document);
        sendResponse({ success: true });
        return true;
      }

      if (message.type === 'SUBMIT_TARGET_FORM') {
        const { formId } = message.payload;
        const formEl = document.querySelector<HTMLFormElement>(`#${formId}`) || document.querySelector('form');
        if (formEl) {
          formEl.requestSubmit();
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false });
        }
        return true;
      }
    });
  },
});
