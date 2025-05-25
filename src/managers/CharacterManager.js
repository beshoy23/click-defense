import { CHARACTERS } from '../config/characters.js';
import { Utils } from '../utils/utils.js';

export class CharacterManager {
  constructor(game) {
    this.game = game;
  }

  getCurrentCharacter() {
    return CHARACTERS.find(c => c.id === this.game.state.currentCharacterId) || CHARACTERS[0];
  }

  applyCharacter() {
    const character = this.getCurrentCharacter();
    
    // Update clicker image
    const clicker = Utils.getElement('clicker');
    clicker.src = character.image;
    clicker.alt = character.name;
    
    // Update audio sources
    const characterSound = Utils.getElement('character-sound');
    const characterSoundLong = Utils.getElement('character-sound-long');
    
    characterSound.src = character.sound;
    if (character.soundLong) {
      characterSoundLong.src = character.soundLong;
    }
    
    // Recalculate stats with character bonuses
    this.game.upgradeManager.recalculateStats();
  }

  openModal() {
    const modal = Utils.getElement('character-modal-overlay');
    const choicesContainer = Utils.getElement('character-choices');
    
    choicesContainer.innerHTML = '';
    
    CHARACTERS.forEach(character => {
      const isUnlocked = this.game.state.unlockedCharacters.includes(character.id);
      const isActive = this.game.state.currentCharacterId === character.id;
      
      const div = document.createElement('div');
      div.className = 'upgrade-choice';
      if (!isUnlocked) div.classList.add('locked');
      if (isActive) div.style.border = '3px solid #FFD700';
      
      let bonusText = '';
      if (character.bonus) {
        if (character.bonus.clickBonus) bonusText += `+${character.bonus.clickBonus} Click Power `;
        if (character.bonus.critChance) bonusText += `+${character.bonus.critChance}% Crit `;
        if (character.bonus.meterBonus) bonusText += `+${character.bonus.meterBonus}% Meter Fill `;
      }
      
      div.innerHTML = `
        <img src="${character.image}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
        <div class="upgrade-choice-name">${character.name}</div>
        <div class="upgrade-choice-effect">${character.description}</div>
        ${bonusText ? `<div style="color: #4CAF50; font-size: 12px; margin: 5px 0;">${bonusText}</div>` : ''}
        ${!isUnlocked ? `<div class="upgrade-choice-cost">Unlock: ${Utils.formatNumber(character.cost)} coins</div>` : 
          (isActive ? '<div style="color: #FFD700; font-weight: bold;">ACTIVE</div>' : 
                     '<div style="color: #4CAF50;">Unlocked</div>')}
      `;
      
      div.onclick = () => {
        if (isUnlocked && !isActive) {
          this.selectCharacter(character.id);
        } else if (!isUnlocked && this.game.state.money >= character.cost) {
          this.unlockCharacter(character.id);
        }
      };
      
      choicesContainer.appendChild(div);
    });
    
    modal.style.display = 'block';
  }

  closeModal() {
    Utils.hideElement('character-modal-overlay');
  }

  selectCharacter(characterId) {
    this.game.state.currentCharacterId = characterId;
    this.applyCharacter();
    this.game.saveManager.save();
    Utils.showNotification(`Selected ${this.getCurrentCharacter().name}!`, 'achievement');
    this.openModal(); // Refresh the modal
  }

  unlockCharacter(characterId) {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (character && this.game.state.money >= character.cost) {
      this.game.state.money -= character.cost;
      this.game.state.unlockedCharacters.push(characterId);
      this.game.saveManager.save();
      Utils.showNotification(`Unlocked ${character.name}!`, 'achievement');
      this.openModal(); // Refresh the modal
    }
  }
}