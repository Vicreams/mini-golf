// game.js
const upgradeTargets = {
  maxPower: 10,
  ballSpeed: 10,
  shotCooldown: 2000,
  teeSpeed: 10000,
  sandFriction: 0.85,
  holeMoney: 2,
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
    PUrevert: false,
    waterForgiveness: false,
    freeze: false
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