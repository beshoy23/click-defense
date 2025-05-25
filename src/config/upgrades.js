// Click Power Upgrades - EXPONENTIAL SCALING
export const CLICK_UPGRADES = [
  { 
    name: 'Stronger Fingers', 
    baseCost: 10, 
    clickBonus: 1, 
    icon: '💪',
    description: 'Increases base click power by 1'
  },
  { 
    name: 'Power Gloves', 
    baseCost: 100, 
    multiplier: 0.25,
    icon: '🧤',
    description: 'Increases click power by 25%'
  },
  { 
    name: 'Lucky Charm', 
    baseCost: 500, 
    critChance: 2, 
    icon: '🍀',
    description: 'Adds 2% critical click chance (2x damage)'
  },
  { 
    name: 'Click Combo Master', 
    baseCost: 5000, 
    meterBonus: 10, 
    multiplier: 0.1,
    icon: '⚡',
    description: 'Meter fills 10% faster, +10% click power'
  },
  { 
    name: 'Titanium Clicker', 
    baseCost: 50000, 
    multiplier: 0.5,
    icon: '🔨',
    description: 'Increases click power by 50%'
  },
  { 
    name: 'Mega Multiplier', 
    baseCost: 1000000, 
    multiplier: 1,
    icon: '✖️',
    description: 'Doubles click power'
  },
  { 
    name: 'Critical Master', 
    baseCost: 25000000, 
    critChance: 3, 
    multiplier: 0.25,
    icon: '💎',
    description: '+3% crit chance, +25% click power'
  },
  { 
    name: 'Exponential Engine', 
    baseCost: 1000000000,
    expMultiplier: 0.02,
    icon: '🚀',
    description: 'Increases exponential growth rate by 2%'
  },
  { 
    name: 'Quantum Clicker', 
    baseCost: 100000000000,
    multiplier: 2,
    expMultiplier: 0.05,
    icon: '⚛️',
    description: 'Triples click power, +5% exponential growth'
  },
  { 
    name: 'Singularity', 
    baseCost: 10000000000000,
    multiplier: 5,
    expMultiplier: 0.1,
    icon: '🌌',
    description: '6x click power, +10% exponential growth'
  }
];

// Passive Income Upgrades - EXPONENTIAL SCALING
export const PASSIVE_UPGRADES = [
  { 
    name: 'Auto Clicker', 
    baseCost: 25, 
    baseCps: 0.5, 
    cpsMultiplier: 1.1,
    icon: '👆',
    description: 'Clicks for you automatically'
  },
  { 
    name: 'Pasta Factory', 
    baseCost: 250, 
    baseCps: 5, 
    cpsMultiplier: 1.15,
    icon: '🍝',
    description: 'Mass produces brainrot pasta'
  },
  { 
    name: 'Kebab Stand', 
    baseCost: 5000, 
    baseCps: 50, 
    cpsMultiplier: 1.2,
    icon: '🥙',
    description: 'Serves endless kebabs'
  },
  { 
    name: 'Pizza Empire', 
    baseCost: 100000, 
    baseCps: 1000, 
    cpsMultiplier: 1.25,
    icon: '🍕',
    description: 'Chain of pizza restaurants'
  },
  { 
    name: 'Food Truck Fleet', 
    baseCost: 5000000, 
    baseCps: 50000, 
    cpsMultiplier: 1.3,
    icon: '🚚',
    description: 'Mobile brainrot distribution'
  },
  { 
    name: 'Culinary Academy', 
    baseCost: 500000000,
    baseCps: 5000000,
    cpsMultiplier: 1.35,
    icon: '🎓',
    description: 'Trains brainrot chefs'
  },
  { 
    name: 'Food Network', 
    baseCost: 75000000000,
    baseCps: 750000000,
    cpsMultiplier: 1.4,
    icon: '📺',
    description: 'Broadcasts brainrot cooking shows'
  },
  { 
    name: 'Global Chain', 
    baseCost: 10000000000000,
    baseCps: 100000000000,
    cpsMultiplier: 1.5,
    icon: '🌍',
    description: 'Worldwide brainrot domination'
  },
  { 
    name: 'Space Kitchen', 
    baseCost: 2000000000000000,
    baseCps: 20000000000000,
    cpsMultiplier: 1.75,
    icon: '🛸',
    description: 'Intergalactic brainrot distribution'
  },
  { 
    name: 'Timeline Manipulator', 
    baseCost: 500000000000000000,
    baseCps: 5000000000000000,
    cpsMultiplier: 2,
    icon: '⏰',
    description: 'Generates brainrot across timelines'
  }
];

// Boost Types
export const BOOST_TYPES = [
  { name: '2x Income', duration: 30000, effect: 'income', multiplier: 2, cost: 1000, icon: '💰' },
  { name: '3x Click Power', duration: 20000, effect: 'click', multiplier: 3, cost: 2000, icon: '🔥' },
  { name: '5x CPS', duration: 15000, effect: 'cps', multiplier: 5, cost: 5000, icon: '⚡' },
  { name: 'Golden Rain', duration: 10000, effect: 'golden', multiplier: 1, cost: 10000, icon: '✨' }
];