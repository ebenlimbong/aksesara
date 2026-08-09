import { defineContentScript } from 'wxt/sandbox';
import { parseFormElement } from '@aksesara/form-parser';
import { setNativeInputValue, highlightTargetElement, clearHighlights } from '@aksesara/sync-engine';
import { FormGraph, FormNode } from '@aksesara/form-schema';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('[Aksesara ContentScript] Loaded on tab:', window.location.href);

    let currentFormGraph: FormGraph | null = null;

    // 💡 Parser Google Forms dengan Penandaan Container Presisi & Anti-Duplikasi
    function parseGoogleForm(): FormGraph {
      const nodes: FormNode[] = [];
      const questionBlocks = document.querySelectorAll('div[role="listitem"]');
      const processedLabels = new Set<string>();

      questionBlocks.forEach((block, index) => {
        const titleEl = block.querySelector('div[role="heading"], span[dir="auto"]');
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
          });

          processedLabels.add(labelText);
          return;
        }

        // 2. Deteksi Text Input atau Textarea
        const textInput = block.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea');
        if (textInput) {
          nodes.push({
            nodeId: `gf-node-${nodes.length}`,
            officialLabel: labelText,
            simpleLabel: labelText,
            fieldType: textInput.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text',
            required: isRequired,
            source: { selector: `div[data-aksesara-block="${blockId}"]` },
          });

          processedLabels.add(labelText);
          return;
        }

        // 3. Deteksi Radio / Checkbox
        const radioOrCheck = block.querySelector('div[role="radio"], div[role="checkbox"]');
        if (radioOrCheck) {
          nodes.push({
            nodeId: `gf-node-${nodes.length}`,
            officialLabel: labelText,
            simpleLabel: labelText,
            fieldType: 'select',
            required: isRequired,
            source: { selector: `div[data-aksesara-block="${blockId}"]` },
          });

          processedLabels.add(labelText);
        }
      });

      return {
        formId: 'google-form-target',
        title: document.title.replace(' - Google Forms', ''),
        nodes,
        mode: 'universal',
      };
    }

    function scanPageForms(): FormGraph | null {
      const isGoogleForm = window.location.hostname.includes('docs.google.com') && window.location.pathname.includes('/forms');
      if (isGoogleForm) {
        currentFormGraph = parseGoogleForm();
        return currentFormGraph;
      }

      const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
      if (forms.length === 0) return null;

      const targetForm = forms.find((f) => f.hasAttribute('data-aksesara-form') || f.id.includes('aksesara')) || forms[0];
      currentFormGraph = parseFormElement(targetForm, 0, window.location.origin);

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

      chrome.runtime.sendMessage({
        type: 'FORM_SCANNED',
        payload: graph,
        bridgeDetail: detail,
      });
    });

    // Listen for runtime messages from Popup and Side Panel
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PARSE_FORM' || message.type === 'SCAN_FORM') {
        try {
          const graph = scanPageForms();
          sendResponse({ 
            success: true, 
            graph,
            forms: graph ? [graph] : [] 
          });
        } catch (err) {
          console.error('[Aksesara ContentScript] Parse error:', err);
          sendResponse({ success: false, error: String(err) });
        }
        return true;
      }

      if (message.type === 'SYNC_FIELD_VALUE') {
        const { selector, value } = message.payload;
        const container = document.querySelector<HTMLElement>(selector);

        if (container) {
          // A. Jika di dalam container terdapat Input Teks / Textarea
          const inputEl = container.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea');
          if (inputEl) {
            const success = setNativeInputValue(inputEl, value);
            sendResponse({ success });
            return true;
          }

          // B. Jika di dalam container terdapat Dropdown / Combobox
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

          sendResponse({ success: false, error: 'Target input inside block not found' });
        } else {
          sendResponse({ success: false, error: 'Block Container not found' });
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
        const isGoogleForm = window.location.hostname.includes('docs.google.com');
        if (isGoogleForm) {
          // 💡 1. Cari tombol "Berikutnya", "Next", "Kirim", atau "Submit"
          const buttons = Array.from(document.querySelectorAll<HTMLElement>('div[role="button"], span'));
          const nextOrSubmitBtn = buttons.find((el) => {
            const txt = el.textContent?.trim().toLowerCase();
            return txt === 'berikutnya' || txt === 'next' || txt === 'kirim' || txt === 'submit';
          });

          if (nextOrSubmitBtn) {
            // Simpan data halaman sebelum diklik
            const oldFirstLabel = document.querySelector('div[role="listitem"] div[role="heading"]')?.textContent?.trim();

            nextOrSubmitBtn.click();

            // 💡 2. Polling sampai pertanyaan halaman baru muncul di DOM
            let attempts = 0;
            const checkInterval = setInterval(() => {
              attempts++;
              const newGraph = scanPageForms();
              const newFirstLabel = document.querySelector('div[role="listitem"] div[role="heading"]')?.textContent?.trim();

              // Jika judul/pertanyaan halaman sudah berubah ATAU sudah mencoba 12 kali (3.6 detik)
              if ((newFirstLabel && newFirstLabel !== oldFirstLabel) || attempts > 12) {
                clearInterval(checkInterval);

                // Broadcast form baru ke SidePanel
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

        // Fallback Form Biasa / SIAKAD
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