class InsuranceEmpireGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.policies = 0;
        this.money = 0;
        this.policiesPerSecond = 0;
        this.clickPower = 1;
        this.autoClickers = 0;
        this.particles = [];
        
        // Game state
        this.isClicking = false;
        this.clickAnimation = 0;
        this.deskAnimation = 0;
        
        // Upgrades data
        this.upgrades = [
            {
                id: 'better_pen',
                name: 'Better Pen',
                description: 'Increases click power by 1',
                baseCost: 10,
                cost: 10,
                owned: 0,
                effect: () => this.clickPower += 1,
                maxLevel: 100,
                costMultiplier: 1.15
            },
            {
                id: 'assistant',
                name: 'Insurance Assistant',
                description: 'Automatically issues 1 policy per second',
                baseCost: 50,
                cost: 50,
                owned: 0,
                effect: () => this.autoClickers += 1,
                maxLevel: 50,
                costMultiplier: 1.2
            },
            {
                id: 'premium_policies',
                name: 'Premium Policies',
                description: 'Each policy earns 2x money',
                baseCost: 200,
                cost: 200,
                owned: 0,
                effect: () => this.moneyMultiplier = (this.moneyMultiplier || 1) * 2,
                maxLevel: 10,
                costMultiplier: 2.5
            },
            {
                id: 'office_upgrade',
                name: 'Office Upgrade',
                description: 'All assistants work 2x faster',
                baseCost: 500,
                cost: 500,
                owned: 0,
                effect: () => this.assistantEfficiency = (this.assistantEfficiency || 1) * 2,
                maxLevel: 15,
                costMultiplier: 3
            },
            {
                id: 'marketing',
                name: 'Marketing Campaign',
                description: 'Increases policies per second by 50%',
                baseCost: 1000,
                cost: 1000,
                owned: 0,
                effect: () => this.marketingMultiplier = (this.marketingMultiplier || 1) * 1.5,
                maxLevel: 12,
                costMultiplier: 2.8
            },
            {
                id: 'insurance_broker',
                name: 'Insurance Broker',
                description: 'Sells policies for 3x money but slower',
                baseCost: 2500,
                cost: 2500,
                owned: 0,
                effect: () => {
                    this.brokers = (this.brokers || 0) + 1;
                    this.brokerEfficiency = (this.brokerEfficiency || 1) * 1.2;
                },
                maxLevel: 20,
                costMultiplier: 2.2
            },
            {
                id: 'call_center',
                name: 'Call Center',
                description: 'Massive policy generation boost',
                baseCost: 10000,
                cost: 10000,
                owned: 0,
                effect: () => this.callCenter = (this.callCenter || 0) + 1,
                maxLevel: 8,
                costMultiplier: 4
            },
            {
                id: 'ai_system',
                name: 'AI Policy System',
                description: 'Exponential growth multiplier',
                baseCost: 50000,
                cost: 50000,
                owned: 0,
                effect: () => this.aiMultiplier = (this.aiMultiplier || 1) * 1.5,
                maxLevel: 5,
                costMultiplier: 5
            }
        ];
        
        this.moneyMultiplier = 1;
        this.assistantEfficiency = 1;
        this.marketingMultiplier = 1;
        
        // Prestige system
        this.prestigeLevel = 0;
        this.prestigePoints = 0;
        this.totalPoliciesEver = 0;
        
        // Achievements
        this.achievements = [
            { id: 'first_policy', name: 'First Policy', description: 'Issue your first policy', unlocked: false, condition: () => this.policies >= 1 },
            { id: 'hundred_policies', name: 'Century Club', description: 'Issue 100 policies', unlocked: false, condition: () => this.policies >= 100 },
            { id: 'thousand_policies', name: 'Millennium', description: 'Issue 1,000 policies', unlocked: false, condition: () => this.policies >= 1000 },
            { id: 'ten_thousand', name: 'Policy Master', description: 'Issue 10,000 policies', unlocked: false, condition: () => this.policies >= 10000 },
            { id: 'first_upgrade', name: 'Investor', description: 'Buy your first upgrade', unlocked: false, condition: () => this.upgrades.some(u => u.owned > 0) },
            { id: 'rich_agent', name: 'Rich Agent', description: 'Earn $10,000', unlocked: false, condition: () => this.money >= 10000 },
            { id: 'millionaire', name: 'Millionaire', description: 'Earn $1,000,000', unlocked: false, condition: () => this.money >= 1000000 },
            { id: 'auto_empire', name: 'Automated Empire', description: 'Have 10 assistants', unlocked: false, condition: () => this.autoClickers >= 10 },
            { id: 'broker_network', name: 'Broker Network', description: 'Hire 5 insurance brokers', unlocked: false, condition: () => (this.brokers || 0) >= 5 },
            { id: 'call_center_boss', name: 'Call Center Boss', description: 'Build your first call center', unlocked: false, condition: () => (this.callCenter || 0) >= 1 },
            { id: 'ai_pioneer', name: 'AI Pioneer', description: 'Implement AI policy system', unlocked: false, condition: () => (this.aiMultiplier || 1) > 1 },
            { id: 'clicking_master', name: 'Clicking Master', description: 'Reach 100 click power', unlocked: false, condition: () => this.clickPower >= 100 }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.render();
        this.gameLoop();
        this.generateUpgrades();
        this.generateAchievements();
        this.setupPrestige();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousedown', () => this.isClicking = true);
        this.canvas.addEventListener('mouseup', () => this.isClicking = false);
        this.canvas.addEventListener('mouseleave', () => this.isClicking = false);
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on the desk area
        if (this.isPointInDesk(x, y)) {
            this.issuePolicy();
            this.createParticle(x, y, `+${this.clickPower} Policy`);
            this.clickAnimation = 1;
        }
    }
    
    isPointInDesk(x, y) {
        // Desk is roughly in the center-bottom area
        const deskX = 150;
        const deskY = 200;
        const deskWidth = 100;
        const deskHeight = 60;
        
        return x >= deskX && x <= deskX + deskWidth && 
               y >= deskY && y <= deskY + deskHeight;
    }
    
    issuePolicy() {
        this.policies += this.clickPower;
        this.money += this.clickPower * this.moneyMultiplier;
        this.updateDisplay();
        this.checkAchievements();
        
        // Create multiple particles for bigger clicks
        if (this.clickPower > 1) {
            for (let i = 0; i < Math.min(this.clickPower, 5); i++) {
                setTimeout(() => {
                    this.createParticle(
                        200 + (Math.random() - 0.5) * 50, 
                        230 + (Math.random() - 0.5) * 20, 
                        `+${Math.floor(this.clickPower / Math.min(this.clickPower, 5))} Policy`
                    );
                }, i * 100);
            }
        }
    }
    
    createParticle(x, y, text) {
        this.particles.push({
            x: x,
            y: y,
            text: text,
            life: 1,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.1; // gravity
            
            return particle.life > 0;
        });
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw office background
        this.drawOffice();
        
        // Draw desk with animation
        this.drawDesk();
        
        // Draw policy papers
        this.drawPolicyPapers();
        
        // Draw click effects
        if (this.clickAnimation > 0) {
            this.drawClickEffect();
        }
        
        // Draw particles
        this.drawParticles();
        
        // Draw UI elements on canvas
        this.drawCanvasUI();
    }
    
    drawOffice() {
        // Floor
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 250, this.canvas.width, 50);
        
        // Wall
        this.ctx.fillStyle = '#E6E6FA';
        this.ctx.fillRect(0, 0, this.canvas.width, 250);
        
        // Window
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(20, 20, 100, 80);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 20, 100, 80);
        
        // Window frame
        this.ctx.strokeRect(70, 20, 0, 80);
        this.ctx.strokeRect(20, 60, 100, 0);
    }
    
    drawDesk() {
        const deskX = 150;
        const deskY = 200;
        const deskWidth = 100;
        const deskHeight = 60;
        
        // Desk shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(deskX + 3, deskY + 3, deskWidth, deskHeight);
        
        // Desk main
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(deskX, deskY, deskWidth, deskHeight);
        
        // Desk top
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(deskX, deskY, deskWidth, 10);
        
        // Desk legs
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(deskX + 5, deskY + 10, 8, deskHeight - 10);
        this.ctx.fillRect(deskX + deskWidth - 13, deskY + 10, 8, deskHeight - 10);
        
        // Click animation with enhanced effects
        if (this.clickAnimation > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 0, ${this.clickAnimation})`;
            this.ctx.fillRect(deskX, deskY, deskWidth, 10);
            
            // Add sparkle effect
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.clickAnimation})`;
            for (let i = 0; i < 5; i++) {
                const sparkleX = deskX + Math.random() * deskWidth;
                const sparkleY = deskY + Math.random() * 10;
                this.ctx.fillRect(sparkleX, sparkleY, 2, 2);
            }
            
            this.clickAnimation -= 0.1;
        }
        
        // Desk animation with subtle movement
        this.deskAnimation += 0.05;
        const bounce = Math.sin(this.deskAnimation) * 1;
        this.ctx.translate(0, bounce);
        this.ctx.translate(0, -bounce);
        
        // Draw pen on desk
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(deskX + 20, deskY + 5, 15, 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(deskX + 20, deskY + 4, 2, 4);
    }
    
    drawPolicyPapers() {
        // Draw scattered policy papers on desk
        const papers = [
            { x: 160, y: 180, rotation: 0.1 },
            { x: 200, y: 185, rotation: -0.2 },
            { x: 180, y: 190, rotation: 0.3 },
            { x: 220, y: 175, rotation: -0.1 }
        ];
        
        papers.forEach(paper => {
            this.ctx.save();
            this.ctx.translate(paper.x, paper.y);
            this.ctx.rotate(paper.rotation);
            
            // Paper
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, 30, 20);
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, 30, 20);
            
            // Text lines
            this.ctx.fillStyle = '#000';
            this.ctx.font = '8px Arial';
            this.ctx.fillText('POLICY', 2, 8);
            this.ctx.fillText('INSURANCE', 2, 15);
            
            this.ctx.restore();
        });
    }
    
    drawClickEffect() {
        // Draw ripple effect
        this.ctx.strokeStyle = `rgba(255, 255, 0, ${this.clickAnimation})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(200, 230, 50 * (1 - this.clickAnimation), 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = '#4caf50';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(particle.text, particle.x, particle.y);
            this.ctx.restore();
        });
    }
    
    drawCanvasUI() {
        // Draw click power indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`Click Power: ${this.clickPower}`, 15, 30);
    }
    
    gameLoop() {
        this.update();
        this.render();
        this.updateParticles();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        let totalPoliciesPerSecond = 0;
        
        // Auto-clickers
        if (this.autoClickers > 0) {
            const autoPolicies = this.autoClickers * this.assistantEfficiency * this.marketingMultiplier;
            this.policies += autoPolicies / 60; // 60 FPS
            this.money += (autoPolicies * this.moneyMultiplier) / 60;
            totalPoliciesPerSecond += autoPolicies;
        }
        
        // Brokers (slower but more profitable)
        if (this.brokers > 0) {
            const brokerPolicies = (this.brokers * this.brokerEfficiency) / 3; // 3x slower
            this.policies += brokerPolicies / 60;
            this.money += (brokerPolicies * this.moneyMultiplier * 3) / 60; // 3x money
            totalPoliciesPerSecond += brokerPolicies;
        }
        
        // Call Center (massive boost)
        if (this.callCenter > 0) {
            const callCenterPolicies = this.callCenter * 10 * this.marketingMultiplier;
            this.policies += callCenterPolicies / 60;
            this.money += (callCenterPolicies * this.moneyMultiplier) / 60;
            totalPoliciesPerSecond += callCenterPolicies;
        }
        
        // AI System (exponential multiplier)
        if (this.aiMultiplier > 1) {
            totalPoliciesPerSecond *= this.aiMultiplier;
            this.policies += (totalPoliciesPerSecond * (this.aiMultiplier - 1)) / 60;
            this.money += (totalPoliciesPerSecond * (this.aiMultiplier - 1) * this.moneyMultiplier) / 60;
        }
        
        this.policiesPerSecond = totalPoliciesPerSecond;
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('policies-count').textContent = Math.floor(this.policies).toLocaleString();
        document.getElementById('money-count').textContent = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('policies-per-second').textContent = this.policiesPerSecond.toFixed(1);
    }
    
    generateUpgrades() {
        const container = document.getElementById('upgrades-container');
        container.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const canAfford = this.money >= upgrade.cost && upgrade.owned < upgrade.maxLevel;
            
            const upgradeElement = document.createElement('button');
            upgradeElement.className = `upgrade-item ${canAfford ? 'affordable' : ''}`;
            upgradeElement.disabled = !canAfford;
            
            upgradeElement.innerHTML = `
                <div class="upgrade-name">${upgrade.name} (${upgrade.owned}/${upgrade.maxLevel})</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost">$${upgrade.cost.toLocaleString()}</div>
            `;
            
            upgradeElement.addEventListener('click', () => this.buyUpgrade(upgrade));
            container.appendChild(upgradeElement);
        });
    }
    
    buyUpgrade(upgrade) {
        if (this.money >= upgrade.cost && upgrade.owned < upgrade.maxLevel) {
            this.money -= upgrade.cost;
            upgrade.owned++;
            upgrade.effect();
            
            // Increase cost for next purchase using the upgrade's cost multiplier
            upgrade.cost = Math.floor(upgrade.cost * upgrade.costMultiplier);
            
            this.updateDisplay();
            this.generateUpgrades();
            this.checkAchievements();
            
            // Create purchase effect
            this.createParticle(this.canvas.width / 2, this.canvas.height / 2, 'Upgrade Purchased!');
        }
    }
    
    generateAchievements() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-name">${achievement.unlocked ? '✓ ' : ''}${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            
            container.appendChild(achievementElement);
        });
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                this.createParticle(this.canvas.width / 2, this.canvas.height / 2, 'Achievement Unlocked!');
                this.generateAchievements();
            }
        });
    }
    
    setupPrestige() {
        const prestigeBtn = document.getElementById('prestige-btn');
        prestigeBtn.addEventListener('click', () => this.prestige());
    }
    
    prestige() {
        if (this.policies >= 1000000) {
            // Calculate prestige points
            const newPrestigePoints = Math.floor(this.policies / 1000000);
            this.prestigePoints += newPrestigePoints;
            this.prestigeLevel++;
            this.totalPoliciesEver += this.policies;
            
            // Reset game state but keep prestige benefits
            this.policies = 0;
            this.money = 0;
            this.clickPower = 1 + this.prestigeLevel; // Prestige gives click power
            this.autoClickers = 0;
            this.brokers = 0;
            this.callCenter = 0;
            this.aiMultiplier = 1;
            this.moneyMultiplier = 1 + (this.prestigeLevel * 0.1); // 10% money bonus per prestige
            this.assistantEfficiency = 1;
            this.marketingMultiplier = 1;
            this.brokerEfficiency = 1;
            
            // Reset upgrades
            this.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
            });
            
            this.updateDisplay();
            this.generateUpgrades();
            this.createParticle(this.canvas.width / 2, this.canvas.height / 2, `PRESTIGE! +${newPrestigePoints} Points`);
        }
    }
    
    updateDisplay() {
        document.getElementById('policies-count').textContent = Math.floor(this.policies).toLocaleString();
        document.getElementById('money-count').textContent = `$${Math.floor(this.money).toLocaleString()}`;
        document.getElementById('policies-per-second').textContent = this.policiesPerSecond.toFixed(1);
        document.getElementById('prestige-level').textContent = this.prestigeLevel;
        document.getElementById('prestige-points').textContent = this.prestigePoints;
        
        // Update prestige button
        const prestigeBtn = document.getElementById('prestige-btn');
        if (this.policies >= 1000000) {
            prestigeBtn.disabled = false;
            prestigeBtn.textContent = `Prestige (+${Math.floor(this.policies / 1000000)} points)`;
        } else {
            prestigeBtn.disabled = true;
            prestigeBtn.textContent = `Prestige (${(1000000 - this.policies).toLocaleString()} more policies needed)`;
        }
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new InsuranceEmpireGame();
});