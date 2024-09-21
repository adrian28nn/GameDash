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
  { name: 'visual-novel', file: 'games/visual-novel.xt' },
  { name: 'other', file: 'games/other.txt' },
];

// Function to fetch game URLs from a specific file
async function fetchGameLinks(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Error fetching game list from ${filePath}`);
  }
  const text = await response.text();
  return text.split('\n').filter(link => link.trim() !== '');
}

// Get a random game from the enabled categories
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

  // If no links found, return an error
  if (allGameLinks.length === 0) {
    console.error('No games available from the selected categories');
    return null;
  }

  // Get a random game link
  const randomIndex = Math.floor(Math.random() * allGameLinks.length);
  return allGameLinks[randomIndex];
}

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



// Example usage for default (all categories enabled)
const enabledCategories = gameCategories.map(cat => cat.name);

// Handle settings button click
document.getElementById('settings-btn').addEventListener('click', () => {
  const dropdown = document.getElementById('settings-dropdown');
  
  // Toggle the 'show' class
  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
    dropdown.style.maxHeight = '0px'; // Close the dropdown
  } else {
    dropdown.classList.add('show');
    dropdown.style.maxHeight = '100%'; // Expand the dropdown to cover the content
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




// Render the recent games list
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

// Event listener for random game button
document.getElementById('random-game-btn').addEventListener('click', async () => {
  const selectedCategories = await loadTags();
  const randomGameUrl = await getRandomGame(selectedCategories);
  updateRecentGames(randomGameUrl);
});


// Load recent games on popup open
browser.storage.local.get('recentGames', (data) => {
  const recentGames = data.recentGames || [];
  renderGameList(recentGames);
});
