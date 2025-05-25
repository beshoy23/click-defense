// Game Configuration Constants
export const CONFIG = {
  // Initial values
  INITIAL_MONEY: 0,
  INITIAL_CLICK_POWER: 1,
  INITIAL_UPGRADE_COST: 50,
  
  // Meter settings
  METER_MAX: 100,
  METER_DECAY_RATE: 2,
  METER_BOOST_MULTIPLIER: 2,
  METER_FILL_BASE: 20,
  
  // Sound settings
  SOUND_COOLDOWN: 3000,
  HIMARIKO_LONG_DELAY: 3000,
  
  // Upgrade settings
  UPGRADE_COST_MULTIPLIER: 1.5,
  UPGRADE_CHOICES_COUNT: 3,
  
  // Critical hit
  MAX_CRIT_CHANCE: 25,
  CRIT_MULTIPLIER: 2,
  
  // Combo settings
  COMBO_TIMEOUT: 2000,
  MAX_COMBO_MULTIPLIER: 20,
  
  // Challenge settings
  CHALLENGE_SPAWN_CHANCE: 0.001,
  
  // Auto save
  AUTO_SAVE_INTERVAL: 5000,
  
  // Animation durations
  NOTIFICATION_DURATION: 4000,
  FLOATING_TEXT_DURATION: 1200,
};

// Milestones
export const MILESTONES = [
  { amount: 100, message: "First 100! 🎉" },
  { amount: 1000, message: "1K Club! 🔥" },
  { amount: 10000, message: "10K Master! 💪" },
  { amount: 100000, message: "100K Legend! 👑" },
  { amount: 1000000, message: "MILLIONAIRE! 💰" },
  { amount: 10000000, message: "10M TYCOON! 🚀" },
  { amount: 100000000, message: "100M MOGUL! 💎" },
  { amount: 1000000000, message: "BILLIONAIRE! 🌟" },
  { amount: 1000000000000, message: "TRILLIONAIRE! 🌌" },
  { amount: 1000000000000000, message: "QUADRILLIONAIRE! 🔥" },
  { amount: 1000000000000000000, message: "QUINTILLIONAIRE! ⭐" },
  { amount: 1e21, message: "SEXTILLIONAIRE! 🚀" },
  { amount: 1e24, message: "SEPTILLIONAIRE! 💫" },
  { amount: 1e27, message: "OCTILLIONAIRE! 🌈" },
  { amount: 1e30, message: "NONILLIONAIRE! 🎆" },
  { amount: 1e33, message: "DECILLIONAIRE! 👑" },
  { amount: 1e36, message: "INFINITY MASTER! ∞" }
];

// Musical notes for melody system
export const MUSICAL_NOTES = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale