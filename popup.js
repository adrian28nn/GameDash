// Paths to local game files
const gameCategories = [
  { name: 'action', file: 'games/action.txt' },
  { name: 'adventure', file: 'games/adventure.txt' },
  { name: 'card-game', file: 'games/card-game.txt' },
  { name: 'educational', file: 'games/educational.txt' },
  { name: 'fighting', file: 'games/fighting.txt' },
  { name: 'interactive-fiction', file: 'games/interactive-fiction.txt' },
  { name: 'platformer', file: 'games/platformer.txt' },
  { name: 'puzzle', file: 'games/puzzle.txt' },
  { name: 'racing', file: 'games/racing.txt' },
  { name: 'rhythm', file: 'games/rhythm.txt' },
  { name: 'role-playing', file: 'games/role-playing.txt' },
  { name: 'shooter', file: 'games/shooter.txt' },
  { name: 'simulation', file: 'games/simulation.txt' },
  { name: 'sports', file: 'games/sports.txt' },
  { name: 'strategy', file: 'games/strategy.txt' },
  { name: 'survival', file: 'games/survival.txt' },
  { name: 'visual-novel', file: 'games/visual-novel.txt' },
  { name: 'other', file: 'games/other.txt' },
];

async function fetchGameLinks(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Error fetching game list from ${filePath}`);
  }
  const text = await response.text();
  console.log('Fetched Games:', text); // Log the fetched text
  return text.split('\n').filter(link => link.trim() !== '');
}


// Get a random game from the enabled categories, excluding recent games
async function getRandomGame(enabledCategories) {
  let allGameLinks = [];

  // Fetch links from all enabled categories
  for (const category of gameCategories) {
    if (enabledCategories.includes(category.name)) {
      try {
        const gameLinks = await fetchGameLinks(category.file);
        allGameLinks = allGameLinks.concat(gameLinks);
      } catch (error) {
        console.error(`Failed to fetch games for category: ${category.name}`, error);
      }
    }
  }

  // Load recent games from storage
  const { recentGames = [] } = await browser.storage.local.get('recentGames');

  // Filter out games already in recent games
  const recentGameUrls = recentGames.map(game => game.url);
  allGameLinks = allGameLinks.filter(link => !recentGameUrls.includes(link));

  // If no links found, return an error
  if (allGameLinks.length === 0) {
    console.error('No games available from the selected categories that are not in recent history');
    return null;
  }

  // Get a random game link
  const randomIndex = Math.floor(Math.random() * allGameLinks.length);
  return allGameLinks[randomIndex];
}


// Toggle settings dropdown and move footer
document.getElementById('settings-btn').addEventListener('click', () => {
  const dropdown = document.getElementById('settings-dropdown');
  const footer = document.querySelector('.footer');
  const footerShift = 31; // Custom number of pixels to adjust
  const settingsBtn = document.getElementById('settings-btn');

  if (dropdown.style.display === 'none' || !dropdown.style.display) {
    // Show the dropdown
    dropdown.style.display = 'block';
    // Move the footer down with a transition
    footer.style.transition = 'transform 0.4s ease';
    footer.style.transform = `translateY(${footerShift}px)`;

    // add the active class to the settings button
    settingsBtn.classList.add('active');
    
    // Resize the popup height to 400px
    browser.runtime.sendMessage({ action: 'resizePopup', size: 400 });
  } else {
    // Hide the dropdown
    dropdown.style.display = 'none';
    // Reset the footer position
    footer.style.transform = 'translateY(0px)';
    
    // remove the active class from the settings button
    settingsBtn.classList.remove('active');
    
    // Restore the original popup height
    browser.runtime.sendMessage({ action: 'resizePopup', size: 'auto' });
  }
});




// Example usage for default (all categories enabled)
const enabledCategories = gameCategories.map(cat => cat.name);

// Toggle the settings menu visibility and content height
document.getElementById('settings-btn').addEventListener('click', () => {
  const dropdown = document.getElementById('settings-dropdown');
  const body = document.body;

  if (dropdown.classList.contains('show')) {
    // When closing the settings menu
    dropdown.classList.remove('show');
    dropdown.style.maxHeight = '0px';
    
    // Revert body height back to original
    body.style.height = ''; // Reset to auto/initial height

  } else {
    // When opening the settings menu
    dropdown.classList.add('show');
    dropdown.style.maxHeight = '272px'; // Ensure dropdown fits inside the content

    // Set body height to 400px (fixed size) when settings are open
    body.style.height = '420px';
  }
});





// Load tags from local storage
async function loadTags() {
  const { savedCategories } = await browser.storage.local.get('savedCategories');
  return savedCategories || gameCategories.map(category => category.name); // Default: all enabled
}


// Save selected categories to local storage
function saveTags(selectedCategories) {
  browser.storage.local.set({ savedCategories: selectedCategories });
}

// Render tags in the settings dropdown
function renderTags(selectedCategories) {
  const dropdown = document.getElementById('settings-dropdown');
  dropdown.innerHTML = '';

  gameCategories.forEach(category => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = category.name;
    
    // Disable tag if not selected
    if (!selectedCategories.includes(category.name)) {
      tag.classList.add('disabled');
    }

    // Toggle tag selection
    tag.addEventListener('click', () => {
      const index = selectedCategories.indexOf(category.name);
      if (index > -1) {
        selectedCategories.splice(index, 1);
        tag.classList.add('disabled');
      } else {
        selectedCategories.push(category.name);
        tag.classList.remove('disabled');
      }
      saveTags(selectedCategories);
    });

    dropdown.appendChild(tag);
  });
}

// Load and render tags when popup opens
(async function() {
  const selectedCategories = await loadTags();
  renderTags(selectedCategories);
})();



// Function to render the recent games list
function renderGameList(recentGames) {
  const gameListElement = document.getElementById('game-list');
  gameListElement.innerHTML = '';

  recentGames.forEach(game => {
      const gameItem = document.createElement('div');
      gameItem.className = 'game-item';

      const favicon = document.createElement('img');
      favicon.src = game.favicon;

      const gameLink = document.createElement('a');
      gameLink.href = game.url;
      gameLink.textContent = game.title;
      gameLink.target = '_blank';

      gameItem.appendChild(favicon);
      gameItem.appendChild(gameLink);
      gameListElement.appendChild(gameItem);
  });
}

// Listen for messages from background.js to update the recent games list
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateGameList') {
    // Fetch the updated recent games list from storage and re-render it
    browser.storage.local.get('recentGames', (data) => {
      const recentGames = data.recentGames || [];
      renderGameList(recentGames);
    });
  }
});




// Event listener for random game button
document.getElementById('random-game-btn').addEventListener('click', async () => {
  const selectedCategories = await loadTags();
  const randomGameUrl = await getRandomGame(selectedCategories);
  
  if (randomGameUrl) {
    // Send a message to background.js to open the random game and update recent games
    browser.runtime.sendMessage({ action: 'openRandomGame', url: randomGameUrl });
  } else {
    console.error("No valid game URL found.");
  }
});







// Load recent games on popup open
browser.storage.local.get('recentGames', (data) => {
  const recentGames = data.recentGames || [];
  renderGameList(recentGames);
});