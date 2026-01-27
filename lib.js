const GROUP_COLORS = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];

export async function consolidateTabs() {
  const windows = await chrome.windows.getAll({ populate: true });

  if (windows.length <= 1) {
    return { success: false, reason: 'already_single_window' };
  }

  const windowIds = windows.map(w => w.id);

  // Build per-window tab info with group name from active tab
  const windowGroups = windows.map(w => {
    const activeTab = w.tabs.find(t => t.active);
    const title = activeTab?.title || 'Window';
    return {
      groupName: title.length > 30 ? title.slice(0, 30) : title,
      tabs: w.tabs.map(tab => ({ url: tab.url, pinned: tab.pinned })),
    };
  });

  // Create the destination window with the first tab from the first group
  const firstTab = windowGroups[0].tabs[0];
  const newWindow = await chrome.windows.create({
    url: firstTab.url,
    focused: true
  });
  const firstTabId = newWindow.tabs[0].id;

  let colorIndex = 0;

  for (let g = 0; g < windowGroups.length; g++) {
    const group = windowGroups[g];
    const createdTabIds = [];

    // First group's first tab was already created with the window
    const startIndex = g === 0 ? 1 : 0;
    if (g === 0) createdTabIds.push(firstTabId);

    for (let i = startIndex; i < group.tabs.length; i++) {
      const tab = await chrome.tabs.create({
        windowId: newWindow.id,
        url: group.tabs[i].url,
        pinned: group.tabs[i].pinned,
        active: false
      });
      createdTabIds.push(tab.id);
    }

    // Group the tabs and label them
    const groupId = await chrome.tabs.group({
      tabIds: createdTabIds,
      createProperties: { windowId: newWindow.id }
    });
    await chrome.tabGroups.update(groupId, {
      title: group.groupName,
      color: GROUP_COLORS[colorIndex % GROUP_COLORS.length]
    });
    colorIndex++;
  }

  for (const windowId of windowIds) {
    await chrome.windows.remove(windowId);
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
