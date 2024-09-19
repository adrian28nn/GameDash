// Open a new tab and get the title and favicon of the game
async function openTabAndGetTitleAndFavicon(url) {
  browser.tabs.create({ url, active: true }, (tab) => {
      // Wait for the tab to load
      browser.tabs.onUpdated.addListener(async function onUpdate(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
              // Add a delay before sending the message to fetch the title
              setTimeout(async () => {
                  const response = await browser.tabs.sendMessage(tabId, { action: 'getTitleAndFavicon' });
                  if (response && response.title) {
                      const faviconUrl = response.faviconUrl;
                      // Store the game info, including the favicon
                      browser.storage.local.get('recentGames', (data) => {
                          let recentGames = data.recentGames || [];
                          recentGames = recentGames.filter(g => g.url !== url);
                          recentGames.unshift({ url, title: response.title, favicon: faviconUrl });
                          recentGames = recentGames.slice(0, 15);
                          browser.storage.local.set({ recentGames });
                      });
                  }
              }, 0); // delay
          }
      });
  });
}

// Listen for messages from popup.js
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'openRandomGame') {
      const randomGameUrl = message.url;
      openTabAndGetTitleAndFavicon(randomGameUrl);
  }
});
