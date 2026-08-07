export interface AksesaraBridgeOptions {
  publicProjectKey: string;
  externalFormId: string;
  formSelector?: string;
  buttonSelector?: string;
  apiBaseUrl?: string;
}

export interface AksesaraOpenDetail {
  version: string;
  publicProjectKey: string;
  externalFormId: string;
  formSelector?: string;
}

export class AksesaraBridge {
  private options: AksesaraBridgeOptions;
  private unbindClick?: () => void;

  constructor(options: AksesaraBridgeOptions) {
    this.options = options;
  }

  public mount(): void {
    const selector = this.options.buttonSelector || '[data-aksesara-open]';
    const button = document.querySelector<HTMLElement>(selector);

    if (button) {
      const handler = (e: Event) => {
        e.preventDefault();
        this.triggerOpen();
      };
      button.addEventListener('click', handler);
      this.unbindClick = () => button.removeEventListener('click', handler);
      button.setAttribute('data-aksesara-ready', 'true');
    }
  }

  public unmount(): void {
    if (this.unbindClick) {
      this.unbindClick();
    }
  }

  public triggerOpen(): void {
    const detail: AksesaraOpenDetail = {
      version: '1.0.0',
      publicProjectKey: this.options.publicProjectKey,
      externalFormId: this.options.externalFormId,
      formSelector: this.options.formSelector || 'form',
    };

    window.dispatchEvent(
      new CustomEvent('aksesara:open', {
        detail,
        bubbles: true,
        cancelable: true,
      })
    );

    console.log('[Aksesara Bridge] Custom event "aksesara:open" dispatched:', detail);
  }
}

export function createAksesaraBridge(options: AksesaraBridgeOptions): AksesaraBridge {
  const bridge = new AksesaraBridge(options);
  if (typeof window !== 'undefined') {
    bridge.mount();
  }
  return bridge;
}

// Auto-initialize if script tags with data attributes are detected
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.querySelector<HTMLScriptElement>('script[data-aksesara-project]');
    if (script) {
      const publicProjectKey = script.getAttribute('data-aksesara-project');
      const externalFormId = script.getAttribute('data-aksesara-form');
      const formSelector = script.getAttribute('data-aksesara-form-selector') || undefined;

      if (publicProjectKey && externalFormId) {
        createAksesaraBridge({
          publicProjectKey,
          externalFormId,
          formSelector,
        });
      }
    }
  });
}
