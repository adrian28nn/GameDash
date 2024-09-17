// Curated list of itch.io games playable in browser
const gamesFileURL = 'https://raw.githubusercontent.com/adrian28nn/GameDash/main/games.txt'; 

// Get a random game URL from the list
function getRandomGame() {
  return fetch(gamesFileURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(text => {
      const gameLinks = text.split('\n').filter(link => link.trim() !== '');
      const randomIndex = Math.floor(Math.random() * gameLinks.length);
      return gameLinks[randomIndex];
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
