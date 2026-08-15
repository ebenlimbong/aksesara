import { defineContentScript } from 'wxt/sandbox';
import { discoverForms, buildFormGraph } from '@aksesara/form-parser';
import { setNativeInputValue, highlightTargetElement, clearHighlights } from '@aksesara/sync-engine';
import { FormGraph, FormNode } from '@aksesara/form-schema';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('[Aksesara ContentScript] Loaded on tab:', window.location.href);

    let currentFormGraph: FormGraph | null = null;

    // Helper to remove any and all previous highlight outlines from DOM
    function removeAllHighlights() {
      try {
        clearHighlights(document);
      } catch (e) {}

      const highlightedEls = document.querySelectorAll<HTMLElement>('[data-aksesara-highlighted="true"]');
      highlightedEls.forEach((el) => {
        el.style.outline = el.getAttribute('data-orig-outline') || '';
        el.style.boxShadow = el.getAttribute('data-orig-shadow') || '';
        el.style.transition = el.getAttribute('data-orig-transition') || '';
        el.removeAttribute('data-aksesara-highlighted');
        el.removeAttribute('data-orig-outline');
        el.removeAttribute('data-orig-shadow');
        el.removeAttribute('data-orig-transition');
      });
    }

    // 💡 Parser Google Forms dengan Penandaan Container Presisi & Anti-Duplikasi
    function parseGoogleForm(): FormGraph {
      const nodes: FormNode[] = [];
      let questionBlocks = Array.from(document.querySelectorAll('div[role="listitem"]'));
      if (questionBlocks.length === 0) {
        questionBlocks = Array.from(document.querySelectorAll('div[jsmodel], div.Qr7Oae, div.geS58'));
      }

      const processedLabels = new Set<string>();

      questionBlocks.forEach((block, index) => {
        const titleEl = block.querySelector('div[role="heading"], span[dir="auto"], div.M7eMe');
        let labelText = titleEl ? titleEl.textContent?.trim() || '' : '';
        
        if (!labelText) return;

        // Bersihkan tanda bintang (*) dari label
        labelText = labelText.replace(/\s*\*$/, '').trim();

        // Anti-duplikasi berdasarkan label
        if (processedLabels.has(labelText)) return;

        const isRequired = !!(
          block.querySelector('span[aria-label*="wajib"]') ||
          block.querySelector('span[aria-label*="required"]') ||
          block.querySelector('span.FreebirdFormviewerComponentsQuestionBaseRequiredAsterisk') ||
          block.querySelector('span.v3p25') ||
          block.innerHTML.includes('*')
        );

        // Atribut Unik Khusus pada Container Blok Pertanyaan Ini
        const blockId = `aksesara-qblock-${index}`;
        block.setAttribute('data-aksesara-block', blockId);

        // 1. Deteksi Dropdown / Listbox (Custom Select Google Forms)
        const dropdownEl = block.querySelector('div[role="listbox"], div[role="combobox"]');
        if (dropdownEl) {
          const options: { label: string; value: string }[] = [];
          const optionEls = block.querySelectorAll('div[role="option"]');

          optionEls.forEach((opt) => {
            const txt = opt.textContent?.trim();
            if (txt && !txt.toLowerCase().includes('pilih') && !txt.toLowerCase().includes('choose')) {
              options.push({ label: txt, value: txt });
            }
          });

          nodes.push({
            nodeId: `gf-node-${nodes.length}`,
            officialLabel: labelText,
            simpleLabel: labelText,
            fieldType: 'select',
            required: isRequired,
            options: options,
            source: { selector: `div[data-aksesara-block="${blockId}"]` },
            sensitivity: 'normal',
            confidence: 1,
            supported: true,
          });

          processedLabels.add(labelText);
          return;
        }

        // 2. Deteksi Text Input atau Textarea
        const textInput = block.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], input:not([type]), textarea');
        if (textInput) {
          nodes.push({
            nodeId: `gf-node-${nodes.length}`,
            officialLabel: labelText,
            simpleLabel: labelText,
            fieldType: textInput.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text',
            required: isRequired,
            source: { selector: `div[data-aksesara-block="${blockId}"]` },
            sensitivity: 'normal',
            confidence: 1,
            supported: true,
          });

          processedLabels.add(labelText);
          return;
        }

        // 3. Deteksi Radio / Checkbox
        const radioOrCheck = block.querySelector('div[role="radio"], div[role="checkbox"], input[type="radio"], input[type="checkbox"]');
        if (radioOrCheck) {
          nodes.push({
            nodeId: `gf-node-${nodes.length}`,
            officialLabel: labelText,
            simpleLabel: labelText,
            fieldType: 'select',
            required: isRequired,
            source: { selector: `div[data-aksesara-block="${blockId}"]` },
            sensitivity: 'normal',
            confidence: 1,
            supported: true,
          });

          processedLabels.add(labelText);
        }
      });

      return {
        id: 'google-form-target',
        formId: 'google-form-target',
        origin: window.location.origin,
        title: document.title.replace(' - Google Forms', ''),
        nodes,
        sections: [],
        mode: 'universal',
      };
    }

    function scanPageForms(): FormGraph | null {
      const isGoogleForm = window.location.hostname.includes('docs.google.com') && window.location.pathname.includes('/forms');
      if (isGoogleForm) {
        currentFormGraph = parseGoogleForm();
        if (currentFormGraph && currentFormGraph.nodes.length > 0) {
          return currentFormGraph;
        }
      }

      // Fallback parser via discoverForms & buildFormGraph for standard web pages like SIAKAD
      try {
        const discovered = discoverForms(document);
        if (discovered && discovered.length > 0) {
          const target = discovered.reduce((prev, current) => (current.fields.length > prev.fields.length ? current : prev));
          currentFormGraph = buildFormGraph(target, window.location.origin, document.title);

          const bridgeScript = document.querySelector('script[data-aksesara-project]');
          if (bridgeScript) {
            currentFormGraph.mode = 'verified';
          }

          return currentFormGraph;
        }
      } catch (e) {}

      return null;
    }

    // Listen for custom event from @aksesara/bridge
    window.addEventListener('aksesara:open', (event: any) => {
      const detail = event.detail;
      console.log('[Aksesara ContentScript] Bridge trigger received:', detail);
      const graph = scanPageForms();

      chrome.runtime.sendMessage({
        type: 'FORM_SCANNED',
        payload: graph,
        bridgeDetail: detail,
      });
    });

    // Listen for runtime messages from Popup and Side Panel
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PARSE_FORM' || message.type === 'SCAN_FORM' || message.type === 'PARSE_FORM_GRAPH') {
        try {
          const graph = scanPageForms();
          sendResponse({ 
            success: true, 
            status: graph ? 'OK' : 'NO_FORM_FOUND',
            graph,
            forms: graph ? [graph] : [] 
          });
        } catch (err) {
          console.error('[Aksesara ContentScript] Parse error:', err);
          sendResponse({ success: false, status: 'ERROR', error: String(err) });
        }
        return true;
      }

      if (message.type === 'SYNC_FIELD_VALUE') {
        const { selector, cssSelector, id, name, value } = message.payload || {};
        const queryCandidates = [
          selector,
          cssSelector,
          id ? `#${CSS.escape(id)}` : null,
          name ? `[name="${CSS.escape(name)}"]` : null,
        ].filter(Boolean) as string[];

        let container: HTMLElement | null = null;
        for (const query of queryCandidates) {
          try {
            container = document.querySelector<HTMLElement>(query);
            if (container) break;
          } catch (e) {}
        }

        if (container) {
          // A. Direct input/textarea/select element
          if (['input', 'textarea', 'select'].includes(container.tagName.toLowerCase())) {
            const inputEl = container as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            if (inputEl.type === 'checkbox') {
              (inputEl as HTMLInputElement).checked = value === 'true' || value === '1' || Boolean(value);
            } else if (inputEl.type === 'radio') {
              const radioGroup = document.querySelectorAll(`input[type="radio"][name="${(inputEl as HTMLInputElement).name}"]`);
              radioGroup.forEach((r) => {
                const radioInput = r as HTMLInputElement;
                radioInput.checked = radioInput.value === value;
              });
            } else {
              inputEl.value = value;
            }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            sendResponse({ success: true });
            return true;
          }

          // B. Input Teks / Textarea inside container block
          const inputEl = container.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
          if (inputEl) {
            const success = setNativeInputValue(inputEl, value);
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            sendResponse({ success });
            return true;
          }

          // C. Dropdown / Combobox in container (Google Forms)
          const dropdownEl = container.querySelector<HTMLElement>('div[role="listbox"], div[role="combobox"]');
          if (dropdownEl) {
            dropdownEl.click();
            setTimeout(() => {
              const options = Array.from(document.querySelectorAll<HTMLElement>('div[role="option"]'));
              const targetOption = options.find((opt) => opt.textContent?.trim() === value);
              if (targetOption) {
                targetOption.click();
              }
            }, 200);
            sendResponse({ success: true });
            return true;
          }
        }
        sendResponse({ success: false, error: 'Target input inside block not found' });
        return true;
      }

      if (message.type === 'HIGHLIGHT_FIELD') {
        // ALWAYS CLEAR PREVIOUS HIGHLIGHTS FIRST so highlights never accumulate!
        removeAllHighlights();

        const { selector, cssSelector, id, name, label } = message.payload || {};
        const queryCandidates = [
          selector,
          cssSelector,
          id ? `#${CSS.escape(id)}` : null,
          name ? `[name="${CSS.escape(name)}"]` : null,
        ].filter(Boolean) as string[];

        let target: HTMLElement | null = null;
        for (const query of queryCandidates) {
          try {
            target = document.querySelector<HTMLElement>(query);
            if (target) break;
          } catch (e) {}
        }

        // Fallback search by label/placeholder/name attribute matching on standard form pages like SIAKAD
        if (!target && label) {
          const inputs = Array.from(document.querySelectorAll<HTMLElement>('input, textarea, select'));
          target = inputs.find((el) => {
            const ph = el.getAttribute('placeholder')?.toLowerCase() || '';
            const nm = el.getAttribute('name')?.toLowerCase() || '';
            const idVal = el.id?.toLowerCase() || '';
            const lblLower = String(label).toLowerCase();
            return ph.includes(lblLower) || nm.includes(lblLower) || idVal.includes(lblLower);
          }) || null;
        }

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Save original styles for clean restoration
          target.setAttribute('data-aksesara-highlighted', 'true');
          target.setAttribute('data-orig-outline', target.style.outline || '');
          target.setAttribute('data-orig-shadow', target.style.boxShadow || '');
          target.setAttribute('data-orig-transition', target.style.transition || '');

          target.style.transition = 'all 0.3s ease-in-out';
          target.style.outline = '4px solid #2563eb';
          target.style.boxShadow = '0 0 0 6px rgba(37, 99, 235, 0.4), 0 0 20px rgba(37, 99, 235, 0.6)';
          try {
            target.focus();
          } catch (e) {}

          const currentTarget = target;
          setTimeout(() => {
            if (currentTarget && currentTarget.hasAttribute('data-aksesara-highlighted')) {
              currentTarget.style.outline = currentTarget.getAttribute('data-orig-outline') || '';
              currentTarget.style.boxShadow = currentTarget.getAttribute('data-orig-shadow') || '';
              currentTarget.style.transition = currentTarget.getAttribute('data-orig-transition') || '';
              currentTarget.removeAttribute('data-aksesara-highlighted');
              currentTarget.removeAttribute('data-orig-outline');
              currentTarget.removeAttribute('data-orig-shadow');
              currentTarget.removeAttribute('data-orig-transition');
            }
          }, 3000);
        }

        sendResponse({ success: true, status: target ? 'OK' : 'NOT_FOUND' });
        return true;
      }

      if (message.type === 'CLEAR_HIGHLIGHTS') {
        removeAllHighlights();
        sendResponse({ success: true });
        return true;
      }

      if (message.type === 'SUBMIT_TARGET_FORM') {
        const isGoogleForm = window.location.hostname.includes('docs.google.com');
        if (isGoogleForm) {
          const buttons = Array.from(document.querySelectorAll<HTMLElement>('div[role="button"], span'));
          const nextOrSubmitBtn = buttons.find((el) => {
            const txt = el.textContent?.trim().toLowerCase();
            return txt === 'berikutnya' || txt === 'next' || txt === 'kirim' || txt === 'submit';
          });

          if (nextOrSubmitBtn) {
            const oldFirstLabel = document.querySelector('div[role="listitem"] div[role="heading"]')?.textContent?.trim();

            nextOrSubmitBtn.click();

            let attempts = 0;
            const checkInterval = setInterval(() => {
              attempts++;
              const newGraph = scanPageForms();
              const newFirstLabel = document.querySelector('div[role="listitem"] div[role="heading"]')?.textContent?.trim();

              if ((newFirstLabel && newFirstLabel !== oldFirstLabel) || attempts > 12) {
                clearInterval(checkInterval);

                chrome.runtime.sendMessage({
                  type: 'FORM_SCANNED',
                  payload: newGraph,
                });
              }
            }, 300);

            sendResponse({ success: true, navigated: true });
            return true;
          }
        }

        const { formId } = message.payload || {};
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
