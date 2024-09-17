// background.js

// Function to open a new tab and get the title of the game
function openTabAndGetTitle(url) {
    browser.tabs.create({ url, active: true }, (tab) => {
      // Wait for the tab to load
      browser.tabs.onUpdated.addListener(function onUpdate(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Add a delay before sending the message to fetch the title
          setTimeout(() => {
            browser.tabs.sendMessage(tabId, { action: 'getTitle' }, (response) => {
              if (response && response.title) {
                // Handle the title here
                browser.storage.local.get('recentGames', (data) => {
                  let recentGames = data.recentGames || [];
                  recentGames = recentGames.filter(g => g.url !== url);
                  recentGames.unshift({ url, title: response.title });
                  recentGames = recentGames.slice(0, 15);
                  browser.storage.local.set({ recentGames });
                });
              }
              // Do not close the tab; keep it open for user to play the game
            });
          }, 2000); // 2 seconds delay
        }
      });
    });
  }
  
  // Listen for messages from popup.js
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'openRandomGame') {
      const randomGameUrl = message.url;
      openTabAndGetTitle(randomGameUrl);
    }
  });
  