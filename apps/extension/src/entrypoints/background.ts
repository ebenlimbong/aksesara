import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('[Aksesara Background] Service Worker initialized.');

  // Open side panel when extension action icon is clicked
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error('[Aksesara Background] Error setting panel behavior:', error));
  }

  // Handle messages between content script, popup, and side panel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ status: 'PONG' });
    }
  });
});
