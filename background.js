chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Gatherer extension installed');
  
  // Create context menu item
  chrome.contextMenus.create({
    id: 'closeTabsToLeft',
    title: 'Close tabs to the left',
    contexts: ['page']
  });
});

async function gatherAllTabs() {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    const allTabs = [];
    const windowsToClose = [];

    for (const window of windows) {
      for (const tab of window.tabs) {
        allTabs.push({
          url: tab.url,
          title: tab.title,
          pinned: tab.pinned,
          active: tab.active
        });
      }
      windowsToClose.push(window.id);
    }

    if (allTabs.length === 0) {
      console.log('No tabs to gather');
      return;
    }

    const newWindow = await chrome.windows.create({
      url: allTabs[0].url,
      focused: true
    });

    for (let i = 1; i < allTabs.length; i++) {
      const tab = allTabs[i];
      await chrome.tabs.create({
        windowId: newWindow.id,
        url: tab.url,
        pinned: tab.pinned,
        active: false
      });
    }

    for (const windowId of windowsToClose) {
      if (windowId !== newWindow.id) {
        try {
          await chrome.windows.remove(windowId);
        } catch (error) {
          console.log(`Could not close window ${windowId}:`, error);
        }
      }
    }

    console.log(`Gathered ${allTabs.length} tabs into a single window`);
  } catch (error) {
    console.error('Error gathering tabs:', error);
  }
}

async function closeTabsToLeft() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) {
      console.log('No active tab found');
      return;
    }

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab.id);
    
    if (activeTabIndex <= 0) {
      console.log('No tabs to close to the left');
      return;
    }

    const tabsToClose = tabs.slice(0, activeTabIndex);
    const tabIdsToClose = tabsToClose.map(tab => tab.id);
    
    if (tabIdsToClose.length > 0) {
      await chrome.tabs.remove(tabIdsToClose);
      console.log(`Closed ${tabIdsToClose.length} tabs to the left`);
    }
  } catch (error) {
    console.error('Error closing tabs to the left:', error);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'closeTabsToLeft') {
    closeTabsToLeft();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'gatherTabs') {
    gatherAllTabs().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Error in gatherTabs:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});