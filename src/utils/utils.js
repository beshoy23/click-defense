import { CONFIG } from '../config/constants.js';

export const Utils = {
  formatNumber(num, decimals = 0) {
    if (num < 1000) return num.toFixed(decimals);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(1) + 'Qa';
    if (num < 1000000000000000000000) return (num / 1000000000000000000).toFixed(1) + 'Qi';
    if (num < 1000000000000000000000000) return (num / 1000000000000000000000).toFixed(1) + 'Sx';
    if (num < 1000000000000000000000000000) return (num / 1000000000000000000000000).toFixed(1) + 'Sp';
    if (num < 1000000000000000000000000000000) return (num / 1000000000000000000000000000).toFixed(1) + 'Oc';
    if (num < 1000000000000000000000000000000000) return (num / 1000000000000000000000000000000).toFixed(1) + 'No';
    if (num < 1000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000).toFixed(1) + 'Dc';
    return num.toExponential(2);
  },

  showNotification(text, type = 'notification') {
    const notificationsContainer = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, CONFIG.NOTIFICATION_DURATION);
  },

  showFloatingText(text, isCritical = false) {
    const float = document.createElement("div");
    float.className = "floating-text" + (isCritical ? " critical" : "");
    float.innerText = isCritical ? `CRIT! ${text}` : text;
    document.getElementById("clicker-container").appendChild(float);
    setTimeout(() => {
      if (float.parentNode) {
        float.remove();
      }
    }, CONFIG.FLOATING_TEXT_DURATION);
  },
  
  createFloatingCoin(value, isCritical = false) {
    const coin = document.createElement("div");
    coin.className = "floating-coin" + (isCritical ? " critical-coin" : "");
    coin.innerHTML = isCritical ? "💎" : "🪙";
    
    const container = document.getElementById("clicker-container");
    const rect = container.getBoundingClientRect();
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    
    coin.style.left = `calc(50% + ${offsetX}px)`;
    coin.style.bottom = `80px`;
    coin.style.setProperty('--offset-x', `${offsetX * 2}px`);
    coin.style.setProperty('--offset-y', `${-100 - Math.random() * 100}px`);
    
    container.appendChild(coin);
    
    setTimeout(() => coin.remove(), 1500);
  },
  
  shakeScreen(intensity = 'light') {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add(`shake-${intensity}`);
    setTimeout(() => {
      gameContainer.classList.remove(`shake-${intensity}`);
    }, 200);
  },
  
  createParticleBurst() {
    const container = document.getElementById("clicker-container");
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = (Math.PI * 2 * i) / 12;
      const velocity = 100 + Math.random() * 100;
      
      particle.style.setProperty('--vx', `${Math.cos(angle) * velocity}px`);
      particle.style.setProperty('--vy', `${Math.sin(angle) * velocity}px`);
      
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  },

  getElement(id) {
    return document.getElementById(id);
  },

  updateElement(id, value) {
    const element = this.getElement(id);
    if (element) element.textContent = value;
  },

  showElement(id) {
    const element = this.getElement(id);
    if (element) element.style.display = 'block';
  },

  hideElement(id) {
    const element = this.getElement(id);
    if (element) element.style.display = 'none';
  },

  addClass(id, className) {
    const element = this.getElement(id);
    if (element) element.classList.add(className);
  },

  removeClass(id, className) {
    const element = this.getElement(id);
    if (element) element.classList.remove(className);
  },

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};