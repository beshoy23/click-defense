// Tower Defense Configuration
export const GAME_CONFIG = {
  // Arena
  ARENA_WIDTH: 800,
  ARENA_HEIGHT: 600,
  
  // Tower
  INITIAL_DAMAGE: 1,
  INITIAL_FIRE_RATE: 1, // shots per second
  INITIAL_RANGE: 150,
  TOWER_POSITION: { x: 0.5, y: 0.5 }, // Center of arena
  
  // Projectiles
  PROJECTILE_SPEED: 500, // pixels per second
  PROJECTILE_SIZE: 8,
  
  // Enemies
  INITIAL_ENEMY_HEALTH: 3,
  INITIAL_ENEMY_SPEED: 50, // pixels per second
  ENEMY_SIZE: 40,
  ENEMY_SPAWN_RATE: 2, // seconds between spawns
  ENEMIES_PER_WAVE: 10,
  
  // Progression
  WAVE_MULTIPLIER: 1.2, // Health and speed increase per wave
  COIN_DROP_CHANCE: 0.5,
  COINS_PER_ENEMY: 1,
  
  // Special abilities
  MULTISHOT_ANGLE: 15, // degrees between shots
  EXPLOSIVE_RADIUS: 100,
  FREEZE_DURATION: 2000, // milliseconds
};

// Tower Upgrades
export const TOWER_UPGRADES = [
  {
    id: 'damage',
    name: 'Damage',
    icon: '💥',
    description: 'Increase damage per shot',
    baseCost: 10,
    effect: { damage: 1 },
    costMultiplier: 1.5
  },
  {
    id: 'firerate',
    name: 'Fire Rate',
    icon: '⚡',
    description: 'Shoot faster',
    baseCost: 15,
    effect: { fireRate: 0.2 },
    costMultiplier: 1.4
  },
  {
    id: 'range',
    name: 'Range',
    icon: '🎯',
    description: 'Increase shooting range',
    baseCost: 20,
    effect: { range: 25 },
    costMultiplier: 1.3
  },
  {
    id: 'piercing',
    name: 'Piercing Shots',
    icon: '🏹',
    description: 'Shots go through enemies',
    baseCost: 100,
    effect: { piercing: 1 },
    costMultiplier: 2,
    maxLevel: 3
  }
];

// Ability Upgrades
export const ABILITY_UPGRADES = [
  {
    id: 'multishot',
    name: 'Multi-Shot',
    icon: '🌟',
    description: 'Shoot multiple projectiles',
    baseCost: 50,
    effect: { shots: 2 },
    costMultiplier: 2,
    maxLevel: 5
  },
  {
    id: 'explosive',
    name: 'Explosive Rounds',
    icon: '💣',
    description: 'Shots explode on impact',
    baseCost: 200,
    effect: { explosive: true },
    costMultiplier: 3,
    maxLevel: 1
  },
  {
    id: 'freeze',
    name: 'Freeze Shot',
    icon: '❄️',
    description: 'Chance to freeze enemies',
    baseCost: 150,
    effect: { freezeChance: 0.1 },
    costMultiplier: 1.8,
    maxLevel: 5
  },
  {
    id: 'autocollect',
    name: 'Auto-Collect',
    icon: '🧲',
    description: 'Automatically collect coins',
    baseCost: 300,
    effect: { autoCollect: true },
    costMultiplier: 1,
    maxLevel: 1
  }
];

// Enemy Types
export const ENEMY_TYPES = [
  {
    id: 'basic',
    name: 'Basic Enemy',
    color: '#ff4444',
    speedMultiplier: 1,
    healthMultiplier: 1,
    coinMultiplier: 1
  },
  {
    id: 'fast',
    name: 'Fast Enemy',
    color: '#44ff44',
    speedMultiplier: 1.5,
    healthMultiplier: 0.8,
    coinMultiplier: 1.5,
    spawnChance: 0.2
  },
  {
    id: 'tank',
    name: 'Tank Enemy',
    color: '#4444ff',
    speedMultiplier: 0.6,
    healthMultiplier: 3,
    coinMultiplier: 3,
    spawnChance: 0.1
  }
];

// Visual Effects
export const EFFECTS = {
  HIT_SHAKE_DURATION: 100,
  DEATH_ANIMATION_DURATION: 300,
  COIN_LIFETIME: 10000, // milliseconds before coins disappear
  PROJECTILE_TRAIL: true,
  DAMAGE_NUMBERS: true
};