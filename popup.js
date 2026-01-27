import { gatherAllTabs, closeTabsToLeft } from './lib.js';

document.addEventListener('DOMContentLoaded', function() {
  const gatherButton = document.getElementById('gatherButton');
  const closeLeftButton = document.getElementById('closeLeftButton');
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
    const result = await gatherAllTabs();
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

  chrome.windows.getAll({ populate: true }).then(windows => {
    const totalTabs = windows.reduce((count, window) => count + window.tabs.length, 0);
    if (totalTabs > 0) {
      statusDiv.textContent = `${totalTabs} tabs across ${windows.length} windows`;
      statusDiv.className = 'status';
    }
  });
});
