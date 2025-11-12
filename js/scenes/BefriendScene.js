// BefriendScene.js
// Scene for befriending wild Neopets through trust-building

class BefriendScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BefriendScene' });
    }

    init(data) {
        this.wildPetSpecies = data.wildPetSpecies;
        this.wildPetIndex = data.wildPetIndex;
        this.wildPetLevel = data.wildPetLevel;
        this.moodData = data.moodData;
        this.location = data.location || 'Neopia Central';

        this.encounterManager = new EncounterManager(gameState);
        this.gallery = gameState.gallery;

        this.trust = this.encounterManager.getInitialTrust(this.moodData.mood);
        this.maxTrust = 100;
        this.turnCount = 0;
        this.maxTurns = 6;

        // Record sighting
        this.gallery.recordSighting(this.wildPetSpecies, this.location, this.moodData.mood);
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(0, 0, width, height, 0xCDE8F6).setOrigin(0, 0);

        // Create UI
        this.createWildPetDisplay();
        this.createTrustMeter();
        this.createMessageBox();
        this.createActionButtons();

        // Initial message
        this.showMessage(`A ${this.moodData.description} ${this.wildPetSpecies} appeared!`);
    }

    createWildPetDisplay() {
        const { width } = this.cameras.main;

        // Wild pet container
        const petX = width * 0.3;
        const petY = 180;

        // Frame box (brand styled)
        const frame = this.add.rectangle(petX, petY, 200, 200, 0xFFFFFF);
        frame.setStrokeStyle(3, 0x003366);

        // Pet sprite
        const wildPetSprite = this.add.sprite(petX, petY, 'neopets', this.wildPetIndex);
        wildPetSprite.setScale(1);

        // Mood indicator badge
        const badge = this.add.container(petX + 80, petY - 80);
        const badgeBg = this.add.circle(0, 0, 20, Phaser.Display.Color.HexStringToColor(this.moodData.color).color);
        badgeBg.setStrokeStyle(2, 0x003366);
        const badgeText = this.add.text(0, 0, this.moodData.icon, {
            fontSize: '20px',
            fontFamily: 'Verdana, Tahoma, sans-serif'
        }).setOrigin(0.5);
        badge.add([badgeBg, badgeText]);

        // Species name label
        const nameLabel = this.add.text(petX, petY + 120, this.wildPetSpecies, {
            fontSize: '20px',
            fontFamily: 'Fredoka One, sans-serif',
            color: '#003366',
            stroke: '#003366',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
        }).setOrigin(0.5);

        // Level indicator
        const levelText = this.add.text(petX, petY + 145, `Level ${this.wildPetLevel}`, {
            fontSize: '14px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#000000'
        }).setOrigin(0.5);
    }

    createTrustMeter() {
        const { width } = this.cameras.main;
        const meterX = width * 0.7;
        const meterY = 120;

        // Title
        this.add.text(meterX, meterY - 40, 'Trust Meter', {
            fontSize: '18px',
            fontFamily: 'Fredoka One, sans-serif',
            color: '#003366',
            stroke: '#003366',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Meter background
        const meterWidth = 200;
        const meterHeight = 30;
        this.trustMeterBg = this.add.rectangle(meterX, meterY, meterWidth, meterHeight, 0xFFFFFF);
        this.trustMeterBg.setStrokeStyle(3, 0x003366);

        // Trust fill
        this.trustMeterFill = this.add.rectangle(
            meterX - meterWidth / 2,
            meterY,
            0,
            meterHeight - 6,
            0x5FBB4E
        ).setOrigin(0, 0.5);

        // Trust text
        this.trustText = this.add.text(meterX, meterY, `${this.trust} / ${this.maxTrust}`, {
            fontSize: '16px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Turn counter
        this.turnText = this.add.text(meterX, meterY + 50, `Turn ${this.turnCount + 1} / ${this.maxTurns}`, {
            fontSize: '14px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#003366'
        }).setOrigin(0.5);

        this.updateTrustMeter();
    }

    createMessageBox() {
        const { width, height } = this.cameras.main;
        const boxX = width / 2;
        const boxY = height - 180;

        // Message container
        const boxWidth = width - 100;
        const boxHeight = 100;

        const messageBg = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xFFFFFF);
        messageBg.setStrokeStyle(3, 0x3E77E4);

        this.messageText = this.add.text(boxX, boxY, '', {
            fontSize: '16px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#000000',
            align: 'center',
            wordWrap: { width: boxWidth - 40 }
        }).setOrigin(0.5);
    }

    createActionButtons() {
        const { width, height } = this.cameras.main;
        const buttonY = height - 60;
        const buttonSpacing = 160;
        const startX = width / 2 - (buttonSpacing * 2);

        // Button configurations
        const buttons = [
            { label: 'Offer Item', action: () => this.openItemMenu() },
            { label: 'Talk/Play', action: () => this.doInteraction() },
            { label: 'Use Pet', action: () => this.usePartyPet() },
            { label: 'Gallery', action: () => this.checkGallery() },
            { label: 'Flee', action: () => this.flee() }
        ];

        this.actionButtons = [];

        buttons.forEach((btn, i) => {
            const x = startX + (i * buttonSpacing);
            const button = this.createBrandButton(x, buttonY, btn.label, btn.action);
            this.actionButtons.push(button);
        });
    }

    createBrandButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        // Button background (gel effect)
        const bg = this.add.rectangle(0, 0, 140, 40, 0x3E77E4, 1);
        bg.setStrokeStyle(2, 0x003366);

        // Gloss effect
        const gloss = this.add.ellipse(0, -8, 120, 15, 0xFFFFFF, 0.3);

        // Button text
        const text = this.add.text(0, 0, label, {
            fontSize: '14px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, gloss, text]);
        button.setSize(140, 40);
        button.setInteractive();

        // Hover effect
        button.on('pointerover', () => {
            bg.setFillStyle(0x5A9AFF);
            this.game.canvas.style.cursor = 'pointer';
        });
        button.on('pointerout', () => {
            bg.setFillStyle(0x3E77E4);
            this.game.canvas.style.cursor = 'default';
        });
        button.on('pointerdown', () => {
            bg.setFillStyle(0x2E5FC4);
        });
        button.on('pointerup', () => {
            bg.setFillStyle(0x3E77E4);
            callback();
        });

        return button;
    }

    openItemMenu() {
        // Disable action buttons
        this.setButtonsInteractive(false);

        // Create item selection overlay
        this.createItemSelectionMenu();
    }

    createItemSelectionMenu() {
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        this.itemMenuOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0);
        this.itemMenuOverlay.setInteractive();

        // Menu panel
        const panelWidth = 500;
        const panelHeight = 400;
        const panelX = width / 2;
        const panelY = height / 2;

        this.itemMenuPanel = this.add.container(panelX, panelY);

        const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xFFFFFF);
        panelBg.setStrokeStyle(4, 0x3E77E4);

        // Title bar
        const titleBar = this.add.rectangle(0, -panelHeight / 2 + 25, panelWidth, 50, 0x3E77E4);
        const titleText = this.add.text(0, -panelHeight / 2 + 25, 'Choose an Item', {
            fontSize: '20px',
            fontFamily: 'Fredoka One, sans-serif',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.itemMenuPanel.add([panelBg, titleBar, titleText]);

        // Item list
        this.createItemList(panelWidth, panelHeight);

        // Close button
        const closeBtn = this.createBrandButton(0, panelHeight / 2 - 40, 'Cancel', () => {
            this.closeItemMenu();
        });
        this.itemMenuPanel.add(closeBtn);
    }

    createItemList(panelWidth, panelHeight) {
        const startY = -panelHeight / 2 + 80;
        const itemSpacing = 50;
        let currentY = startY;

        const inventory = gameState.inventory;

        // Food items
        if (inventory.food && Object.keys(inventory.food).length > 0) {
            const foodLabel = this.add.text(-panelWidth / 2 + 30, currentY, 'Food:', {
                fontSize: '16px',
                fontFamily: 'Verdana, Tahoma, sans-serif',
                color: '#003366',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.itemMenuPanel.add(foodLabel);
            currentY += 30;

            for (const [itemId, count] of Object.entries(inventory.food)) {
                if (count > 0) {
                    const item = getItem('food', itemId);
                    if (item) {
                        this.createItemButton(item, itemId, 'food', count, -panelWidth / 2 + 50, currentY);
                        currentY += itemSpacing;
                    }
                }
            }
        }

        // Toy items
        if (inventory.toys && Object.keys(inventory.toys).length > 0) {
            const toyLabel = this.add.text(-panelWidth / 2 + 30, currentY, 'Toys:', {
                fontSize: '16px',
                fontFamily: 'Verdana, Tahoma, sans-serif',
                color: '#003366',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.itemMenuPanel.add(toyLabel);
            currentY += 30;

            for (const [itemId, count] of Object.entries(inventory.toys)) {
                if (count > 0) {
                    const item = getItem('toys', itemId);
                    if (item) {
                        this.createItemButton(item, itemId, 'toys', count, -panelWidth / 2 + 50, currentY);
                        currentY += itemSpacing;
                    }
                }
            }
        }

        // Show "no items" message if inventory is empty
        if (currentY === startY) {
            const noItemsText = this.add.text(0, 0, 'No items available!\nReturn to the world and find some items.', {
                fontSize: '14px',
                fontFamily: 'Verdana, Tahoma, sans-serif',
                color: '#E63939',
                align: 'center'
            }).setOrigin(0.5);
            this.itemMenuPanel.add(noItemsText);
        }
    }

    createItemButton(item, itemId, category, count, x, y) {
        const button = this.add.container(x, y);

        const text = this.add.text(0, 0, `${item.name} (${count})`, {
            fontSize: '14px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#000000'
        }).setOrigin(0, 0.5);

        button.add(text);
        button.setSize(300, 30);
        button.setInteractive();

        button.on('pointerover', () => {
            text.setColor('#3E77E4');
            this.game.canvas.style.cursor = 'pointer';
        });
        button.on('pointerout', () => {
            text.setColor('#000000');
            this.game.canvas.style.cursor = 'default';
        });
        button.on('pointerup', () => {
            this.offerItem(itemId, category);
            this.closeItemMenu();
        });

        this.itemMenuPanel.add(button);
    }

    closeItemMenu() {
        if (this.itemMenuOverlay) this.itemMenuOverlay.destroy();
        if (this.itemMenuPanel) this.itemMenuPanel.destroy();
        this.setButtonsInteractive(true);
    }

    offerItem(itemId, category) {
        // Calculate trust gain
        const result = this.encounterManager.calculateTrustGain(
            this.wildPetSpecies,
            itemId,
            category,
            this.gallery
        );

        // Remove item from inventory
        if (category === 'food') {
            gameState.inventory.food[itemId]--;
        } else if (category === 'toys') {
            gameState.inventory.toys[itemId]--;
        }
        gameState.saveToLocalStorage();

        // Learn preference if discovered
        const item = getItem(category, itemId);
        this.gallery.learnPreference(this.wildPetSpecies, category === 'food' ? 'food' : 'toy', item.name, result.reactionType);

        // Update trust
        this.adjustTrust(result.trustGain);
        this.showMessage(`You offered ${item.name}. ${result.reactionText}`);

        this.nextTurn();
    }

    doInteraction() {
        const interactions = [
            'You pet the Neopet gently.',
            'You tell a silly joke!',
            'You dance around playfully.',
            'You offer a friendly smile.',
            'You wave excitedly!'
        ];

        const interaction = Phaser.Utils.Array.GetRandom(interactions);
        const trustGain = this.encounterManager.calculateInteractionTrust();

        this.adjustTrust(trustGain);
        this.showMessage(`${interaction} (Trust +${trustGain})`);

        this.nextTurn();
    }

    usePartyPet() {
        const playerPet = gameState.player;
        const petStats = gameState.petStats;

        const result = this.encounterManager.calculatePartyPetBonus(
            petStats.happiness,
            playerPet.species,
            this.wildPetSpecies
        );

        this.adjustTrust(result.bonus);
        this.showMessage(`${playerPet.name} approaches! ${result.message} (Trust +${result.bonus})`);

        this.nextTurn();
    }

    checkGallery() {
        const entry = this.gallery.getEntry(this.wildPetSpecies);

        if (!entry) {
            this.showMessage(`You haven't befriended a ${this.wildPetSpecies} yet!\nYou don't know their preferences.`);
            return;
        }

        let message = `${this.wildPetSpecies} Info:\n`;

        if (entry.preferences.favoriteFood) {
            const foodItem = getItem('food', entry.preferences.favoriteFood);
            message += `Favorite Food: ${foodItem ? foodItem.name : 'Unknown'}\n`;
        } else {
            message += `Favorite Food: ???\n`;
        }

        if (entry.preferences.lovedToy) {
            const toyItem = getItem('toys', entry.preferences.lovedToy);
            message += `Loved Toy: ${toyItem ? toyItem.name : 'Unknown'}`;
        } else {
            message += `Loved Toy: ???`;
        }

        this.showMessage(message);
    }

    flee() {
        this.showMessage(`You backed away safely.`);
        this.time.delayedCall(1500, () => {
            this.scene.start('WorldScene');
        });
    }

    adjustTrust(amount) {
        this.trust = Phaser.Math.Clamp(this.trust + amount, 0, this.maxTrust);
        this.updateTrustMeter();
    }

    updateTrustMeter() {
        const meterWidth = 194; // 200 - 6 for padding
        const fillWidth = (this.trust / this.maxTrust) * meterWidth;
        this.trustMeterFill.width = fillWidth;

        // Color based on trust level
        if (this.trust >= 80) {
            this.trustMeterFill.setFillStyle(0x5FBB4E); // Green
        } else if (this.trust >= 50) {
            this.trustMeterFill.setFillStyle(0xFFCC00); // Yellow
        } else {
            this.trustMeterFill.setFillStyle(0xFF9900); // Orange
        }

        this.trustText.setText(`${Math.floor(this.trust)} / ${this.maxTrust}`);
    }

    nextTurn() {
        this.turnCount++;
        this.turnText.setText(`Turn ${this.turnCount + 1} / ${this.maxTurns}`);

        // Check for success
        if (this.encounterManager.checkBefriendSuccess(this.trust)) {
            this.befriendSuccess();
            return;
        }

        // Check for flee
        if (this.encounterManager.shouldPetFlee(this.turnCount, this.trust)) {
            this.petFlees();
            return;
        }
    }

    befriendSuccess() {
        this.setButtonsInteractive(false);

        // Record befriend in gallery
        this.gallery.recordBefriend(this.wildPetSpecies);

        // Add to party or storage (for now, just show success message)
        this.showMessage(`Success! The ${this.wildPetSpecies} wants to join you! ✨`);

        // Add note if this was a special mood
        if (this.moodData.mood === 'grumpy') {
            this.gallery.addNote(this.wildPetSpecies, 'You calmed down a grumpy one!');
        } else if (this.moodData.mood === 'sick') {
            this.gallery.addNote(this.wildPetSpecies, 'You helped cure a sick one!');
        }

        // Continue button
        this.time.delayedCall(1000, () => {
            const continueBtn = this.createBrandButton(
                this.cameras.main.width / 2,
                this.cameras.main.height - 60,
                'Continue',
                () => {
                    this.scene.start('WorldScene', { removePetIndex: this.wildPetIndex });
                }
            );
        });
    }

    petFlees() {
        this.setButtonsInteractive(false);
        this.showMessage(`The ${this.wildPetSpecies} lost interest and ran away...`);

        this.time.delayedCall(2000, () => {
            this.scene.start('WorldScene');
        });
    }

    showMessage(text) {
        this.messageText.setText(text);
    }

    setButtonsInteractive(enabled) {
        this.actionButtons.forEach(btn => {
            btn.setInteractive(enabled);
            btn.setAlpha(enabled ? 1 : 0.5);
        });
    }
}

// Make available globally
window.BefriendScene = BefriendScene;
