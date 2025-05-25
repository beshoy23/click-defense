// Character Definitions
export const CHARACTERS = [
  {
    id: 'himariko',
    name: 'Himariko Ferariko',
    image: 'himariko ferariko.png',
    sound: 'himariko ferariko.mp3',
    soundLong: 'himariko ferariko long.mp3',
    unlocked: true,
    cost: 0,
    description: 'The original brainrot master!'
  },
  {
    id: 'timsahiko',
    name: 'Timsahiko Btkhekho',
    image: 'timsahiko.png',
    sound: 'timsahiko btkhekho.mp3',
    soundLong: 'timsahiko btkhekho long.mp3',
    unlocked: false,
    cost: 50000,
    description: 'The crocodile comedian!',
    bonus: { clickBonus: 2, critChance: 1 }
  },
  {
    id: 'blalino',
    name: 'Blalino',
    image: 'blalino.png',
    sound: 'blalino.mp3',
    soundLong: 'blalino.mp3',
    unlocked: false,
    cost: 100000,
    description: 'The mysterious brainrot legend!',
    bonus: { clickBonus: 3, critChance: 2, meterBonus: 5 }
  }
];