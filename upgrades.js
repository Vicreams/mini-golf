const upgrades = [
  {
    id: "maxPowerBoost",
    name: "Sand your rock",
    description:
      "You're golfing with a... cube? Sand it down, increasing your distance.",
    category: "basic",
    effect: {
      target: "maxPower",
      type: "multiply",
      value: 1.3,
      prefix: "×",
      suffix: " Max Power",
    },
    cost: {
      currency: "money",
      amount: 3,
      multiplier: 1.5,
      prefix: "$",
      suffix: "",
    },
    maxLevel: 3,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      const level = game.upgrades["maxPowerBoost"] || 0;
      if (level === 1) {
        ball.style.borderRadius = "25%";
      } else if (level === 2) {
        ball.style.borderRadius = "40%";
      } else if (level >= 3) {
        ball.style.borderRadius = "50%";
      }
    },
  }, //maxpower ++
  {
    id: "teeSpawnRate",
    name: "More likely tee.!",
    description: "Tee are more likely to spawn.",
    category: "basic",
    effect: {
      target: "teeSpeed",
      type: "multiply",
      value: 0.15,
      prefix: "×",
      suffix: " Max Power",
    },
    cost: {
      currency: "money",
      amount: 20,
      multiplier: 1.5,
      prefix: "$",
      suffix: "",
    },
    maxLevel: 3,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      startTeeSpawning();
    },
  }, //tee spawnrate
  {
    id: "shotCooldown",
    name: "Quick Trigger",
    description: "Shoot faster with less delay.",
    category: "basic",
    effect: {
      target: "shotCooldown",
      type: "multiply",
      value: 0.9,
      prefix: "×",
      suffix: " Cooldown",
    },
    cost: {
      currency: "money",
      amount: 10,
      multiplier: 2,
      prefix: "$",
      suffix: "",
    },
    maxLevel: 5,
  }, //shot cooldown reduce
  {
    id: "holePoint1",
    name: "Hole $$",
    description: "Gain +2$ from scoring!",
    category: "basic",
    effect: {
      target: "holeMoney",
      type: "increment",
      value: 3,
      prefix: "+",
      suffix: " Cooldown",
    },
    cost: {
      currency: "money",
      amount: 10,
      multiplier: 1.4,
      prefix: "$",
      suffix: "",
    },
    maxLevel: 3,
  }, //shot cooldown reduce
  {
    id: "BetterArrow",
    name: "Predictive Path",
    description: "See where your ball will go before releasing.",
    category: "basic",
    cost: {
      currency: "money",
      amount: 40,
      multiplier: 1, // no scaling needed for a 1-time unlock
      prefix: "$",
      suffix: "",
    },
    maxLevel: 1,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      game.unlocks.predictiveDots = true;
    },
  }, //better arrow
  {
    id: "PUfreeze",
    name: "Freeze Time",
    description: "Press Space to freeze the ball mid-roll.",
    category: "prestige",
    cost: {
      currency: "money",
      amount: 20,
      multiplier: 1,
      prefix: "$",
      suffix: ""
    },
    maxLevel: 1,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      game.unlocks.freeze = true;
      document.getElementById("freeze").style.opacity = 1;
    },
  }, //freeze
  {
    id: "PUrevert",
    name: "Revert power up!",
    description: "Power up: revert your ball to last position.",
    category: "prestige",
    cost: {
      currency: "money",
      amount: 40,
      multiplier: 1, 
      prefix: "$",
      suffix: "",
    },
    maxLevel: 1,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      document.getElementById("revertBtn").style.opacity = 1;
      game.unlocks.PUrevert = true;
    },
  }, //Revert PU
  {
    id: "waterForgiveness",
    name: "Water now forgives you!",
    description: "Water resets to last location",
    category: "prestige",
    cost: {
      currency: "money",
      amount: 40,
      multiplier: 1, // no scaling needed for a 1-time unlock
      prefix: "$",
      suffix: "",
    },
    maxLevel: 1,
    requirements: {
      upgrades: [],
      unlocks: [],
    },
    fallback: () => {
      game.unlocks.waterForgiveness = true;
    },
  }, //Water forgiveness
  {
    id: "bunkerFriction",
    name: "Learn bunker basics",
    description: "Bunker slows you down less",
    category: "prestige",
    effect: {
      target: "sandFriction",
      type: "multiply",
      value: 1.05,
      prefix: "×",
      suffix: " Cooldown",
    },
    cost: {
      currency: "money",
      amount: 10,
      multiplier: 2,
      prefix: "$",
      suffix: "",
    },
    maxLevel: 5,
  }, //bunker slowdown reduce
];

function applyUpgradeEffect(upg) {
  if (!upg.effect) return;
  const { target, type, value } = upg.effect;
  if (!upgradeTargets.hasOwnProperty(target)) return;
  if (type === "multiply") {
    upgradeTargets[target] *= value;
  } else if (type === "increment") {
    upgradeTargets[target] += value;
  }
}

function getUpgradeCost(upg) {
  const level = game.upgrades[upg.id] || 0;
  return Math.ceil(upg.cost.amount * Math.pow(upg.cost.multiplier, level));
}
