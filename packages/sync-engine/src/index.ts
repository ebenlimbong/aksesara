import { FormNode } from '@aksesara/form-schema';

export function setNativeInputValue(el: HTMLElement, value: string | boolean): boolean {
  if (!el) return false;

  try {
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'input') {
      const inputEl = el as HTMLInputElement;
      const type = inputEl.type.toLowerCase();

      if (type === 'checkbox' || type === 'radio') {
        const boolVal = Boolean(value);
        if (inputEl.checked !== boolVal) {
          inputEl.checked = boolVal;
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
      }

      // Handle React / Vue controlled inputs
      const prototype = window.HTMLInputElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (valueSetter) {
        valueSetter.call(inputEl, String(value));
      } else {
        inputEl.value = String(value);
      }
    } else if (tagName === 'textarea') {
      const textareaEl = el as HTMLTextAreaElement;
      const prototype = window.HTMLTextAreaElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (valueSetter) {
        valueSetter.call(textareaEl, String(value));
      } else {
        textareaEl.value = String(value);
      }
    } else if (tagName === 'select') {
      const selectEl = el as HTMLSelectElement;
      const prototype = window.HTMLSelectElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (valueSetter) {
        valueSetter.call(selectEl, String(value));
      } else {
        selectEl.value = String(value);
      }
    }

    // Dispatch native UI events
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  } catch (err) {
    console.error('[Aksesara SyncEngine] Sync error:', err);
    return false;
  }
}

export function highlightTargetElement(doc: Document, selector: string): boolean {
  clearHighlights(doc);

  try {
    const target = doc.querySelector<HTMLElement>(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.setAttribute('data-aksesara-active', 'true');
      target.style.outline = '3px solid #2563eb';
      target.style.outlineOffset = '2px';
      target.style.transition = 'outline 0.2s ease-in-out';
      target.focus();
      return true;
    }
  } catch (err) {
    console.error('[Aksesara SyncEngine] Highlight error:', err);
  }
  return false;
}

export function clearHighlights(doc: Document): void {
  const activeEls = doc.querySelectorAll<HTMLElement>('[data-aksesara-active="true"]');
  activeEls.forEach((el) => {
    el.removeAttribute('data-aksesara-active');
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
}
