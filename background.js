// Open a new tab and get the title and favicon of the game
async function openTabAndGetTitleAndFavicon(url) {
    browser.tabs.create({ url, active: true }, (tab) => {
        // Wait for the tab to load
        browser.tabs.onUpdated.addListener(function onUpdate(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                // Remove the listener after the tab has fully loaded
                browser.tabs.onUpdated.removeListener(onUpdate);
  
                // Send a message to the content script to fetch the title and favicon
                setTimeout(async () => {
                    const response = await browser.tabs.sendMessage(tabId, { action: 'getTitleAndFavicon' });
                    if (response && response.title) {
                        const faviconUrl = response.faviconUrl;
  
                        // Store the game info, including the favicon
                        browser.storage.local.get('recentGames', (data) => {
                            let recentGames = data.recentGames || [];
                            // Avoid duplicates by filtering out existing entry with the same URL
                            recentGames = recentGames.filter(g => g.url !== url);
                            recentGames.unshift({ url, title: response.title, favicon: faviconUrl });
                            // Keep only the last 15 entries
                            recentGames = recentGames.slice(0, 15);
                            // Save the updated recent games list to storage
                            browser.storage.local.set({ recentGames });
                        });
                    }
                }, 500); // Small delay to ensure the page is fully loaded
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
  