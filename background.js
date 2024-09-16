// Curated list of browser-based itch.io games
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
  
  // Function to get a random game URL
  function getRandomGame() {
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }
  
  // Listen for toolbar button click
  browser.browserAction.onClicked.addListener(() => {
    const randomGame = getRandomGame();
    browser.tabs.create({ url: randomGame });
  });
  