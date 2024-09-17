// Curated list of itch.io games playable in browser
const games = [
  "https://ncase.itch.io/anxiety",
  "https://ninja-muffin24.itch.io/funkin",
  "https://ncase.itch.io/wbwwb",
  "https://picogram.itch.io/goodbye-doggy",
  "https://teambeanloop.itch.io/six-cats-under",
  "https://graebor.itch.io/sort-the-court",
  "https://ncase.itch.io/wbwwb",
  "https://paranoidhawk.itch.io/lookouts",
  "https://qwook.itch.io/last-seen-online",
  "https://idrellegames.itch.io/wayfarer",
  "https://anya-writes.itch.io/scout-an-apocalypse-story",
  "https://waxwing0.itch.io/fbc",
  "https://poncle.itch.io/vampire-survivors",
  "https://llamagirl.itch.io/the-bastard-of-camelot",
  "https://pomepomelo.itch.io/irori",
  "https://speakergame.itch.io/speaker",
  "https://ncase.itch.io/coming-out-simulator-2014",
  "https://adayofjoy.itch.io/exhibit-of-sorrows",
  "https://nivrad00.itch.io/purrgatory",
  "https://haraiva.itch.io/novena",
  "https://gmtk.itch.io/platformer-toolkit",
  "https://qeresi.itch.io/a-tale-of-crowns"
];

// Get a random game, excluding the last 15 accessed games
async function getRandomGame() {
  return new Promise((resolve) => {
      browser.storage.local.get('recentGames', (data) => {
          const recentGames = data.recentGames || [];
          const recentUrls = recentGames.map(game => game.url);
          const availableGames = games.filter(game => !recentUrls.includes(game));
          
          if (availableGames.length === 0) {
              // If all games are in the recent list, return a random game from the full list
              resolve(games[Math.floor(Math.random() * games.length)]);
          } else {
              // Select a random game from the available list
              const randomIndex = Math.floor(Math.random() * availableGames.length);
              resolve(availableGames[randomIndex]);
          }
      });
  });
}

// Update the recent games list in storage and on the UI
async function updateRecentGames(gameUrl) {
  try {
      // Send message to background script to handle tab creation and title fetching
      browser.runtime.sendMessage({ action: 'openRandomGame', url: gameUrl });
      
      // Add a delay before updating the recent games list
      setTimeout(() => {
          // Retrieve the recent games list and render it
          browser.storage.local.get('recentGames', (data) => {
              const recentGames = data.recentGames || [];
              renderGameList(recentGames);
          });
      }, 0); // delay
  } catch (error) {
      console.error('Error updating recent games:', error);
  }
}

// Render the recent games list
function renderGameList(recentGames) {
  const gameListElement = document.getElementById('game-list');
  gameListElement.innerHTML = '';

  recentGames.forEach(game => {
      const gameItem = document.createElement('div');
      gameItem.className = 'game-item';

      const favicon = document.createElement('img');
      favicon.src = `https://www.google.com/s2/favicons?domain=${game.url}`;
      favicon.alt = game.title;

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
  const randomGameUrl = await getRandomGame();
  
  // Update recent games list
  updateRecentGames(randomGameUrl);
});

// Load recent games on popup open
browser.storage.local.get('recentGames', (data) => {
  const recentGames = data.recentGames || [];
  renderGameList(recentGames);
});
