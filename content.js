// content.js

// Function to extract the game title from the page
function getGameTitle() {
    const titleElement = document.querySelector('.header .game_title');
    if (titleElement) {
      return titleElement.textContent.trim();
    }
    return '-title not found-'; // Fallback if the title is not found
  }
  
  // Listen for messages from the popup script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getTitle') {
      const title = getGameTitle();
      sendResponse({ title });
    }
  });
  