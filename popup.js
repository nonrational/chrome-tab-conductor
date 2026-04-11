import { consolidateTabs, closeTabsToLeft, closeOldTabs, copyUrlsToClipboard, openTabsFromClipboard } from './lib.js';

document.addEventListener('DOMContentLoaded', function() {
  const gatherButton = document.getElementById('gatherButton');
  const closeLeftButton = document.getElementById('closeLeftButton');
  const closeOldButton = document.getElementById('closeOldButton');
  const copyUrlsButton = document.getElementById('copyUrlsButton');
  const openFromClipboardButton = document.getElementById('openFromClipboardButton');
  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;

    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  }

  gatherButton.addEventListener('click', async function() {
    const result = await consolidateTabs();
    if (!result.success) {
      showStatus('All tabs already in one window');
      return;
    }
    window.close();
  });

  closeLeftButton.addEventListener('click', async function() {
    const result = await closeTabsToLeft();
    if (!result.success) {
      const messages = {
        no_active_tab: 'No active tab found',
        no_tabs_to_left: 'No tabs to close to the left'
      };
      showStatus(messages[result.reason], true);
      return;
    }
    window.close();
  });

  closeOldButton.addEventListener('click', async function() {
    const result = await closeOldTabs();
    if (!result.success) {
      showStatus('No old tabs to close', true);
      return;
    }
    showStatus(`Closed ${result.count} old tab${result.count === 1 ? '' : 's'}`);
  });

  copyUrlsButton.addEventListener('click', async function() {
    const result = await copyUrlsToClipboard();
    if (!result.success) {
      showStatus('No URLs to copy', true);
      return;
    }
    showStatus(`Copied ${result.count} URL${result.count === 1 ? '' : 's'} to clipboard`);
  });

  openFromClipboardButton.addEventListener('click', async function() {
    const result = await openTabsFromClipboard();
    if (!result.success) {
      const messages = {
        clipboard_error: 'Could not read clipboard',
        empty_clipboard: 'Clipboard is empty',
        no_valid_urls: 'No valid URLs in clipboard'
      };
      showStatus(messages[result.reason], true);
      return;
    }
    showStatus(`Opened ${result.count} tab${result.count === 1 ? '' : 's'}`);
  });

  chrome.windows.getAll({ populate: true }).then(windows => {
    const totalTabs = windows.reduce((count, window) => count + window.tabs.length, 0);
    if (totalTabs > 0) {
      statusDiv.textContent = `${totalTabs} tabs across ${windows.length} windows`;
      statusDiv.className = 'status';
    }
  });
});
