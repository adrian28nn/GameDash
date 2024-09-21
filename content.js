// Extract the favicon URL from the page's <head>
function getFaviconUrl() {
  const linkElement = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (linkElement) {
      return linkElement.href;
  }
  return null;
}

// Extract the game title from the page
function getGameTitle() {
  const titleElement = document.querySelector('.header .game_title');
  if (titleElement) {
      return titleElement.textContent.trim();
  }
  return '-title not found-'; // if the title is not found
}

// Listen for messages from the popup script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTitleAndFavicon') {
      const title = getGameTitle();
      const faviconUrl = getFaviconUrl();
      sendResponse({ title, faviconUrl });
  }
});