// game.js
const upgradeTargets = {
  maxPower: 10,
  ballSpeed: 10,
  shotCooldown: 1.0,
  teeSpeed: 10000,
};

const tileSize = 40;

const game = {
  currencies: {
    money: 100,
    research: 0
  },
  upgrades: {
  },
  unlocks: {
    upgrades: true,
    arrow: false,
    PUrevert: false
  },
  other: {
    settings: {
      hide_complete_upgrades: false
    }
  },
  non_persist: {
    run: {
      active: false
    }
  }
};