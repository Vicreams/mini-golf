 const upgrades = [
  {
    id: "maxPowerBoost",
    name: "Sand your rock",
    description: "You're golfing with a... cube? Sand it down, increasing your distance.",
    effect: {
      target: "maxPower",
      type: "multiply",
      value: 1.3,
      prefix: "×",
      suffix: " Max Power"
    },
    cost: {
      currency: "money",
      amount: 3,
      multiplier: 1.5,
      prefix: "$",
      suffix: ""
    },
    maxLevel: 3,
    requirements: {
      upgrades: [],
      unlocks: []
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
    }
  }, //Sand rock
  {
    id: "BetterArrow",
    name: "Predictive Path",
    description: "See where your ball will go before releasing.",
    effect: null, // or just remove this line entirely
    cost: {
      currency: "money",
      amount: 40,
      multiplier: 1, // no scaling needed for a 1-time unlock
      prefix: "$",
      suffix: ""
    },
    maxLevel: 1,
    requirements: {
      upgrades: [],
      unlocks: []
    },
    fallback: () => {
      game.unlocks.predictiveDots = true;
    }
  } //arrow unlock
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