document.addEventListener('DOMContentLoaded', function() {
  const gatherButton = document.getElementById('gatherButton');
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

  chrome.windows.getAll({ populate: true }).then(windows => {
    const totalTabs = windows.reduce((count, window) => count + window.tabs.length, 0);
    if (totalTabs > 0) {
      statusDiv.textContent = `${totalTabs} tabs across ${windows.length} windows`;
      statusDiv.className = 'status';
    }
  });
});