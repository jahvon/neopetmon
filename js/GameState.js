// Global game state management
class GameState {
    constructor() {
        this.player = null;
        this.petStats = {
            hp: 100,
            maxHp: 100,
            level: 1,
            exp: 0,
            expToLevel: 100,
            hunger: 100,
            happiness: 100,
            energy: 100,
            attack: 10,
            defense: 5
        };
        this.inventory = {
            food: {
                choc_donut: 2,
                apple: 2,
                pizza_slice: 1,
                jelly: 2
            },
            toys: {
                bouncy_ball: 1,
                plushie: 1,
                yo_yo: 1
            },
            grooming: {
                brush: 1
            },
            potions: 3
        };
        this.battlesWon = 0;
        this.battlesSinceSpecial = 0; // Track battles for special move cooldown
        this.wildPets = []; // Store wild pet data for persistence
        this.specialItems = []; // Store special item data for persistence
        this.gallery = new NeopetGallery(); // Initialize gallery
        this.load();
    }

    setPlayer(name, spriteIndex, row, col) {
        this.player = {
            name,
            spriteIndex,
            row,
            col,
            species: getNeopetSpecies(spriteIndex)
        };
        this.save();
    }

    updateStats(stats) {
        Object.assign(this.petStats, stats);
        this.save();
    }

    feed(itemId) {
        // If no itemId provided, use any available food
        if (!itemId) {
            for (const [id, count] of Object.entries(this.inventory.food)) {
                if (count > 0) {
                    itemId = id;
                    break;
                }
            }
        }

        if (itemId && this.inventory.food[itemId] > 0) {
            this.inventory.food[itemId]--;
            const item = getItem('food', itemId);
            const hungerRestore = item ? item.hungerRestore : 20;
            this.petStats.hunger = Math.min(100, this.petStats.hunger + hungerRestore);
            this.petStats.happiness = Math.min(100, this.petStats.happiness + 10);
            this.save();
            return true;
        }
        return false;
    }

    // Helper to get total food count for UI
    getTotalFoodCount() {
        return Object.values(this.inventory.food).reduce((sum, count) => sum + count, 0);
    }

    rest() {
        this.petStats.energy = 100;
        this.petStats.happiness = Math.min(100, this.petStats.happiness + 20);
        // Time passes during rest
        this.petStats.hunger = Math.max(0, this.petStats.hunger - 15);
        this.save();
    }

    usePotion() {
        if (this.inventory.potions > 0) {
            this.inventory.potions--;
            this.petStats.hp = Math.min(this.petStats.maxHp, this.petStats.hp + 50);
            this.save();
            return true;
        }
        return false;
    }

    winBattle(expGained, enemyLevel) {
        this.battlesWon++;
        this.petStats.exp += expGained;

        // Small stat increases from battle experience (even without leveling)
        // This makes the pet gradually stronger through fighting
        const battleBonus = Math.floor(expGained / 20); // Small increments
        this.petStats.attack += Phaser.Math.FloatBetween(0.1, 0.3);
        this.petStats.defense += Phaser.Math.FloatBetween(0.05, 0.2);

        // Level up
        let leveledUp = false;
        while (this.petStats.exp >= this.petStats.expToLevel) {
            this.petStats.exp -= this.petStats.expToLevel;
            this.petStats.level++;
            leveledUp = true;

            // Significant stat boosts on level up
            const hpGain = 10 + Math.floor(this.petStats.level * 0.5);
            this.petStats.maxHp += hpGain;
            this.petStats.hp = this.petStats.maxHp;
            this.petStats.attack += 2 + Math.floor(this.petStats.level * 0.3);
            this.petStats.defense += 1 + Math.floor(this.petStats.level * 0.2);
            this.petStats.expToLevel = Math.floor(this.petStats.expToLevel * 1.4);
        }

        // Rewards (better rewards for tougher enemies)
        const rewardMultiplier = Math.max(1, Math.floor(enemyLevel / 3));
        this.inventory.food += 1 + rewardMultiplier;
        this.inventory.potions += Math.floor(Math.random() * 2); // 0-1 potions

        // Battle takes a toll
        this.petStats.energy = Math.max(0, this.petStats.energy - 20);
        this.petStats.hunger = Math.max(0, this.petStats.hunger - 15);
        this.petStats.happiness = Math.max(0, this.petStats.happiness - 10);

        this.save();
        return leveledUp;
    }

    loseBattle() {
        this.petStats.happiness = Math.max(0, this.petStats.happiness - 20);
        this.petStats.energy = Math.max(0, this.petStats.energy - 30);
        this.save();
    }

    decreaseStatsOverTime() {
        // Called periodically to simulate pet needs
        this.petStats.hunger = Math.max(0, this.petStats.hunger - 1);
        this.petStats.energy = Math.max(0, this.petStats.energy - 0.5);

        if (this.petStats.hunger < 30 || this.petStats.energy < 30) {
            this.petStats.happiness = Math.max(0, this.petStats.happiness - 1);
        }
        this.save();
    }

    canBattle() {
        return this.petStats.energy >= 30 && this.petStats.happiness >= 20 && this.petStats.hp > 0;
    }

    canUseSpecialMove() {
        return this.battlesSinceSpecial >= 3;
    }

    useSpecialMove() {
        this.battlesSinceSpecial = 0;
        this.save();
    }

    incrementBattleCount() {
        this.battlesSinceSpecial++;
        this.save();
    }

    updatePlayerPosition(x, y) {
        this.playerPosition = { x, y };
        this.save();
    }

    getPlayerPosition() {
        return this.playerPosition || { x: 920, y: 550 };
    }

    updateWildPets(wildPetsData) {
        this.wildPets = wildPetsData;
        this.save();
    }

    removeWildPet(spriteIndex) {
        this.wildPets = this.wildPets.filter(pet => pet.spriteIndex !== spriteIndex);
        this.save();
    }

    getWildPets() {
        return this.wildPets || [];
    }

    updateSpecialItems(itemsData) {
        this.specialItems = itemsData;
        this.save();
    }

    removeSpecialItem(itemId) {
        this.specialItems = this.specialItems.filter(item => item.id !== itemId);
        this.save();
    }

    getSpecialItems() {
        return this.specialItems || [];
    }

    pickupSpecialItem(itemId, itemType, itemData) {
        // Add item to inventory based on type
        if (itemType === 'food' && this.inventory.food[itemData]) {
            this.inventory.food[itemData]++;
        } else if (itemType === 'toy' && this.inventory.toys[itemData]) {
            this.inventory.toys[itemData]++;
        } else if (itemType === 'potion') {
            this.inventory.potions++;
        }
        this.removeSpecialItem(itemId);
    }

    save() {
        const saveData = {
            player: this.player,
            petStats: this.petStats,
            inventory: this.inventory,
            battlesWon: this.battlesWon,
            battlesSinceSpecial: this.battlesSinceSpecial,
            playerPosition: this.playerPosition || { x: 920, y: 550 },
            wildPets: this.wildPets || [],
            specialItems: this.specialItems || []
        };
        localStorage.setItem('neopetmon_save', JSON.stringify(saveData));
    }

    load() {
        const saveData = localStorage.getItem('neopetmon_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.petStats = data.petStats;

            // Migrate old inventory format to new format
            if (data.inventory) {
                if (typeof data.inventory.food === 'number') {
                    // Old format - convert to new format
                    this.inventory = {
                        food: {
                            choc_donut: Math.floor(data.inventory.food / 4) || 1,
                            apple: Math.floor(data.inventory.food / 4) || 1,
                            pizza_slice: Math.floor(data.inventory.food / 4) || 0,
                            jelly: Math.floor(data.inventory.food / 4) || 1
                        },
                        toys: {
                            bouncy_ball: 1,
                            plushie: 1,
                            yo_yo: 1
                        },
                        grooming: {
                            brush: 1
                        },
                        potions: data.inventory.potions || 3
                    };
                } else {
                    // New format
                    this.inventory = data.inventory;
                }
            }

            this.battlesWon = data.battlesWon || 0;
            this.battlesSinceSpecial = data.battlesSinceSpecial || 0;
            this.playerPosition = data.playerPosition || { x: 920, y: 550 };
            this.wildPets = data.wildPets || [];
            this.specialItems = data.specialItems || [];
        }
    }

    saveToLocalStorage() {
        this.save();
    }

    reset() {
        localStorage.removeItem('neopetmon_save');
        this.player = null;
        this.petStats = {
            hp: 100,
            maxHp: 100,
            level: 1,
            exp: 0,
            expToLevel: 100,
            hunger: 100,
            happiness: 100,
            energy: 100,
            attack: 10,
            defense: 5
        };
        this.inventory = {
            food: {
                choc_donut: 2,
                apple: 2,
                pizza_slice: 1,
                jelly: 2
            },
            toys: {
                bouncy_ball: 1,
                plushie: 1,
                yo_yo: 1
            },
            grooming: {
                brush: 1
            },
            potions: 3
        };
        this.battlesWon = 0;
        this.battlesSinceSpecial = 0;
        this.gallery = new NeopetGallery();
    }
}

// Global instance
const gameState = new GameState();
