import { closeTabsToLeft } from './lib.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'closeTabsToLeft',
    title: 'Close tabs to the left',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'closeTabsToLeft') {
    closeTabsToLeft();
  }
});
