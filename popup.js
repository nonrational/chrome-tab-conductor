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

  function setButtonState(disabled, text) {
    gatherButton.disabled = disabled;
    gatherButton.textContent = text;
  }

  gatherButton.addEventListener('click', async function() {
    try {
      setButtonState(true, 'Gathering...');
      
      const windows = await chrome.windows.getAll({ populate: true });
      const totalTabs = windows.reduce((count, window) => count + window.tabs.length, 0);
      
      if (totalTabs === 0) {
        showStatus('No tabs to gather', true);
        setButtonState(false, 'Gather All Tabs');
        return;
      }

      if (windows.length === 1) {
        showStatus('All tabs already in one window');
        setButtonState(false, 'Gather All Tabs');
        return;
      }

      const response = await chrome.runtime.sendMessage({ action: 'gatherTabs' });
      
      if (response.success) {
        showStatus(`Successfully gathered ${totalTabs} tabs!`);
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        showStatus(`Error: ${response.error}`, true);
      }
      
    } catch (error) {
      console.error('Error in popup:', error);
      showStatus('An error occurred while gathering tabs', true);
    }
    
    setButtonState(false, 'Gather All Tabs');
  });

  closeLeftButton.addEventListener('click', async function() {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab) {
        showStatus('No active tab found', true);
        return;
      }

      const tabs = await chrome.tabs.query({ currentWindow: true });
      const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab.id);
      
      if (activeTabIndex <= 0) {
        showStatus('No tabs to close to the left', true);
        return;
      }

      const tabsToClose = tabs.slice(0, activeTabIndex);
      const tabIdsToClose = tabsToClose.map(tab => tab.id);
      
      if (tabIdsToClose.length > 0) {
        await chrome.tabs.remove(tabIdsToClose);
        showStatus(`Closed ${tabIdsToClose.length} tabs to the left`);
        setTimeout(() => {
          window.close();
        }, 1500);
      }
    } catch (error) {
      console.error('Error closing tabs to the left:', error);
      showStatus('Error closing tabs to the left', true);
    }
  });

  chrome.windows.getAll({ populate: true }).then(windows => {
    const totalTabs = windows.reduce((count, window) => count + window.tabs.length, 0);
    if (totalTabs > 0) {
      statusDiv.textContent = `${totalTabs} tabs across ${windows.length} windows`;
      statusDiv.className = 'status';
    }
  });
});