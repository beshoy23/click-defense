// Achievements
export const ACHIEVEMENTS = [
  { 
    id: 'first_click', 
    name: 'First Click!', 
    desc: 'Click for the first time', 
    condition: (stats) => stats.totalClicks >= 1, 
    reward: 10 
  },
  { 
    id: 'click_100', 
    name: 'Clicker', 
    desc: 'Click 100 times', 
    condition: (stats) => stats.totalClicks >= 100, 
    reward: 100 
  },
  { 
    id: 'click_1000', 
    name: 'Super Clicker', 
    desc: 'Click 1000 times', 
    condition: (stats) => stats.totalClicks >= 1000, 
    reward: 1000 
  },
  { 
    id: 'money_10k', 
    name: 'Rich!', 
    desc: 'Earn 10,000 coins', 
    condition: (stats) => stats.money >= 10000, 
    reward: 1000 
  }
];

// Challenge Types
export const CHALLENGE_TYPES = [
  { 
    name: 'Speed Clicker', 
    desc: 'Click 50 times in 15 seconds', 
    target: 50, 
    time: 15000, 
    reward: 2000,
    type: 'clicks'
  },
  { 
    name: 'Combo Champion', 
    desc: 'Reach a 10x combo streak', 
    target: 10, 
    time: 45000,
    reward: 5000,
    type: 'combo'
  }
];