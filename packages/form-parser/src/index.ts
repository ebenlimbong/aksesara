import {
  FormGraph,
  FormNode,
  FormSection,
  SupportedFieldType,
  FieldSensitivity,
  DetectionEvidence,
  FieldOption,
} from '@aksesara/form-schema';

export function getUniqueCssSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const name = el.getAttribute('name');
  if (name) return `[name="${CSS.escape(name)}"]`;

  const path: string[] = [];
  let current: Element | null = el;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    } else {
      let sibling = current;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  return path.join(' > ');
}

export function classifySensitivity(nameOrId: string, labelText: string): FieldSensitivity {
  const combined = (nameOrId + ' ' + labelText).toLowerCase();
  if (/password|sandi|pin|token|otp/i.test(combined)) return 'credential';
  if (/gaji|income|penghasilan|rekening|bank|uang|upah|gaji_ortu/i.test(combined)) return 'financial';
  if (/nik|ktp|kk|passport|paspor|identity|nim/i.test(combined)) return 'identity';
  if (/darah|disabilitas|penyakit|medis|kesehatan|health/i.test(combined)) return 'health';
  if (/hukum|pidana|pengadilan|perjanjian|persetujuan|syarat/i.test(combined)) return 'legal';
  return 'normal';
}

export function determineFieldType(input: HTMLElement): SupportedFieldType {
  const tag = input.tagName.toLowerCase();
  if (tag === 'textarea') return 'textarea';
  if (tag === 'select') return 'select';
  if (tag === 'input') {
    const type = (input.getAttribute('type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return 'unsupported';
    if (type === 'file') return 'unsupported'; // Handled via unsupported fallback
    if (['text', 'email', 'tel', 'number', 'date', 'password', 'radio', 'checkbox'].includes(type)) {
      return type as SupportedFieldType;
    }
  }
  return 'unsupported';
}

export function resolveLabel(
  input: HTMLElement,
  doc: Document
): { officialLabel: string; evidence: DetectionEvidence[]; confidence: number } {
  const evidence: DetectionEvidence[] = [];

  // 1. Explicit <label for="id">
  if (input.id) {
    const labelEl = doc.querySelector(`label[for="${CSS.escape(input.id)}"]`);
    if (labelEl && labelEl.textContent?.trim()) {
      const text = labelEl.textContent.trim();
      evidence.push({ source: 'label-for', score: 0.95, text });
      return { officialLabel: text, evidence, confidence: 0.95 };
    }
  }

  // 2. Wrapping label <label><input .../> Label Text</label>
  const parentLabel = input.closest('label');
  if (parentLabel && parentLabel.textContent?.trim()) {
    const text = parentLabel.textContent.replace(input.textContent || '', '').trim();
    if (text) {
      evidence.push({ source: 'wrapping-label', score: 0.9, text });
      return { officialLabel: text, evidence, confidence: 0.9 };
    }
  }

  // 3. aria-labelledby
  const ariaLabelledBy = input.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const targetEl = doc.getElementById(ariaLabelledBy);
    if (targetEl && targetEl.textContent?.trim()) {
      const text = targetEl.textContent.trim();
      evidence.push({ source: 'aria-labelledby', score: 0.88, text });
      return { officialLabel: text, evidence, confidence: 0.88 };
    }
  }

  // 4. aria-label
  const ariaLabel = input.getAttribute('aria-label');
  if (ariaLabel?.trim()) {
    evidence.push({ source: 'aria-label', score: 0.85, text: ariaLabel.trim() });
    return { officialLabel: ariaLabel.trim(), evidence, confidence: 0.85 };
  }

  // 5. fieldset legend
  const fieldset = input.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend && legend.textContent?.trim()) {
      const text = legend.textContent.trim();
      evidence.push({ source: 'legend', score: 0.75, text });
    }
  }

  // 6. placeholder
  const placeholder = input.getAttribute('placeholder');
  if (placeholder?.trim()) {
    evidence.push({ source: 'placeholder', score: 0.6, text: placeholder.trim() });
    if (evidence.length === 0) {
      return { officialLabel: placeholder.trim(), evidence, confidence: 0.6 };
    }
  }

  // 7. technical name / id fallback
  const techName = input.getAttribute('name') || input.id || 'Field Tanpa Label';
  const readableTechName = techName.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  evidence.push({ source: 'technical-name', score: 0.3, text: readableTechName });

  const bestEvidence = evidence[0] || { source: 'technical-name', score: 0.3, text: readableTechName };
  return {
    officialLabel: bestEvidence.text || readableTechName,
    evidence,
    confidence: bestEvidence.score,
  };
}

export function parseFormElement(form: HTMLFormElement, index: number, origin: string): FormGraph {
  const formId = form.id ? `form-${form.id}` : `form-auto-${index + 1}`;
  const title = form.getAttribute('title') || form.querySelector('h1, h2, h3')?.textContent?.trim() || `Formulir Web #${index + 1}`;

  const inputs = Array.from(
    form.querySelectorAll<HTMLElement>('input, select, textarea')
  ).filter((el) => {
    const type = el.getAttribute('type');
    return type !== 'hidden' && type !== 'submit' && type !== 'button' && type !== 'reset';
  });

  const nodes: FormNode[] = [];
  const nodeIds: string[] = [];

  inputs.forEach((input, i) => {
    const fieldType = determineFieldType(input);
    const selector = getUniqueCssSelector(input);
    const { officialLabel, evidence, confidence } = resolveLabel(input, form.ownerDocument || document);
    const nameOrId = input.getAttribute('name') || input.id || '';
    const sensitivity = classifySensitivity(nameOrId, officialLabel);
    const required = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';

    const nodeId = `node-${i + 1}`;
    nodeIds.push(nodeId);

    let options: FieldOption[] | undefined = undefined;
    if (fieldType === 'select') {
      const selectEl = input as HTMLSelectElement;
      options = Array.from(selectEl.options).map((opt) => ({
        label: opt.text.trim(),
        value: opt.value,
        selected: opt.selected,
      }));
    }

    const isSupported = fieldType !== 'unsupported';

    nodes.push({
      nodeId,
      externalFieldId: nameOrId || nodeId,
      source: { selector, id: input.id, name: input.getAttribute('name') || undefined },
      fieldType,
      officialLabel,
      required,
      options,
      constraints: {
        min: input.getAttribute('min') || undefined,
        max: input.getAttribute('max') || undefined,
        minLength: input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength')!, 10) : undefined,
        maxLength: input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength')!, 10) : undefined,
        pattern: input.getAttribute('pattern') || undefined,
      },
      sensitivity,
      confidence,
      evidence,
      supported: isSupported,
      unsupportedReason: isSupported ? undefined : 'Tipe input tidak didukung secara otomatis.',
      currentValue: (input as HTMLInputElement).value || '',
    });
  });

  const section: FormSection = {
    id: 'sec-main',
    title: 'Bagian Utama Formulir',
    nodeIds,
  };

  const submitBtn = form.querySelector<HTMLElement>('button[type="submit"], input[type="submit"]');

  return {
    formId,
    origin,
    title,
    mode: 'universal',
    sections: [section],
    nodes,
    submitControl: submitBtn ? { selector: getUniqueCssSelector(submitBtn) } : undefined,
    detectedAt: new Date().toISOString(),
  };
}
