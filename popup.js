// Curated list of itch.io games playable in browser
const gamesFileURL = 'https://raw.githubusercontent.com/adrian28nn/GameDash/main/games.txt'; 

// Function to fetch game links from the remote text file
function fetchGameLinks() {
  fetch(gamesFileURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(text => {
      // Split the text by lines and process the URLs
      const gameLinks = text.split('\n').filter(link => link.trim() !== '');
      populateGameList(gameLinks);
    })
    .catch(error => console.error('Error fetching game links:', error));
}

// Function to populate the game list in the popup
function populateGameList(gameLinks) {
  const gameList = document.getElementById('game-list');
  gameList.innerHTML = ''; // Clear existing list
  gameLinks.forEach(link => {
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.textContent = link;
    anchor.target = '_blank';
    listItem.appendChild(anchor);
    gameList.appendChild(listItem);
  });
}

// Fetch and display game links when the popup is opened
document.addEventListener('DOMContentLoaded', fetchGameLinks);

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
    }, 500); // Slight delay for better UX
  } catch (error) {
    console.error('Error updating recent games:', error);
  }
}

// Render the recent games list
function renderGameList(recentGames) {
  const gameListElement = document.getElementById('game-list');
  gameListElement.innerHTML = '';

  if (recentGames.length === 0) {
    gameListElement.textContent = 'No recent games.';
  } else {
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
}

// Event listener for random game button
document.getElementById('random-game-btn').addEventListener('click', async () => {
  try {
    const randomGameUrl = await getRandomGame();
    // Update recent games list
    updateRecentGames(randomGameUrl);
  } catch (error) {
    console.error('Error getting random game:', error);
  }
});

// Load recent games on popup open
browser.storage.local.get('recentGames', (data) => {
  const recentGames = data.recentGames || [];
  renderGameList(recentGames);
});
