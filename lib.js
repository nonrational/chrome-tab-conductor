export async function consolidateTabs() {
  const windows = await chrome.windows.getAll({ populate: true });

  if (windows.length <= 1) {
    return { success: false, reason: 'already_single_window' };
  }

  const allTabs = windows.flatMap(w => w.tabs.map(tab => ({
    url: tab.url,
    pinned: tab.pinned
  })));
  const windowIds = windows.map(w => w.id);

  const newWindow = await chrome.windows.create({
    url: allTabs[0].url,
    focused: true
  });

  for (let i = 1; i < allTabs.length; i++) {
    chrome.tabs.create({
      windowId: newWindow.id,
      url: allTabs[i].url,
      pinned: allTabs[i].pinned,
      active: false
    });
  }

  for (const windowId of windowIds) {
    chrome.windows.remove(windowId);
  }

  return { success: true };
}

export async function closeTabsToLeft() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) {
    return { success: false, reason: 'no_active_tab' };
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab.id);

  if (activeTabIndex <= 0) {
    return { success: false, reason: 'no_tabs_to_left' };
  }

  const tabIdsToClose = tabs.slice(0, activeTabIndex).map(tab => tab.id);
  await chrome.tabs.remove(tabIdsToClose);

  return { success: true, count: tabIdsToClose.length };
}

export async function closeOldTabs(maxAgeMs = 60 * 60 * 1000) {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();

  const oldTabs = tabs.filter(tab => {
    if (tab.active) return false;
    if (!tab.lastAccessed) return false;
    return (now - tab.lastAccessed) > maxAgeMs;
  });

  if (oldTabs.length === 0) {
    return { success: false, reason: 'no_old_tabs' };
  }

  await chrome.tabs.remove(oldTabs.map(tab => tab.id));
  return { success: true, count: oldTabs.length };
}
