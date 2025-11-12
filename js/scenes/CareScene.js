class CareScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CareScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Semi-transparent overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

        // Card panel with brand styling
        const cardWidth = 400;
        const cardHeight = 500;
        const cardX = width / 2 - cardWidth / 2;
        const cardY = height / 2 - cardHeight / 2 - 30;

        // Outer border with Neopian Blue frame (per brand guide)
        const outerCard = this.add.graphics();
        outerCard.lineStyle(BrandWindows.FRAME.borderWidth, BrandColors.PRIMARY.NEOPIAN_BLUE, 1);
        outerCard.fillStyle(BrandColors.UTILITY.PURE_WHITE, 1);
        outerCard.fillRoundedRect(cardX - 10, cardY - 10, cardWidth + 20, cardHeight + 20, BrandWindows.FRAME.borderRadius);
        outerCard.strokeRoundedRect(cardX - 10, cardY - 10, cardWidth + 20, cardHeight + 20, BrandWindows.FRAME.borderRadius);

        // Inner card (Pure White per brand guide)
        const innerCard = this.add.graphics();
        innerCard.fillStyle(BrandColors.UTILITY.PURE_WHITE, 1);
        innerCard.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, BrandWindows.FRAME.borderRadius - 2);

        // Card header with Neopian Blue background
        const headerBg = this.add.graphics();
        headerBg.fillStyle(BrandColors.PRIMARY.NEOPIAN_BLUE, 1);
        headerBg.fillRoundedRect(cardX + 10, cardY + 10, cardWidth - 20, 80, 10);

        // Pet name with Golden Yellow color
        const petNameText = this.add.text(cardX + cardWidth / 2, cardY + 35, gameState.player.name, {
            fontSize: '28px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 3
        }).setOrigin(0.5);
        petNameText.setShadow(2, 2, 'rgba(0, 0, 0, 0.3)', 2);

        this.add.text(cardX + cardWidth / 2, cardY + 65, gameState.player.species, {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // HP bar with brand colors
        const hpBar = this.add.graphics();
        hpBar.fillStyle(BrandColors.UTILITY.DARK_BLUE, 0.5);
        hpBar.fillRoundedRect(cardX + 20, cardY + 85, cardWidth - 40, 10, 5);

        const hpPercent = gameState.petStats.hp / gameState.petStats.maxHp;
        const hpColor = hpPercent > 0.5 ? BrandColors.PRIMARY.GRASSY_GREEN : hpPercent > 0.25 ? BrandColors.PRIMARY.GOLDEN_YELLOW : BrandColors.SECONDARY.BRIGHT_RED;
        hpBar.fillStyle(hpColor, 1);
        hpBar.fillRoundedRect(cardX + 20, cardY + 85, (cardWidth - 40) * hpPercent, 10, 5);

        // Image frame with brand colors
        const imgFrameBg = this.add.graphics();
        imgFrameBg.fillStyle(BrandColors.UTILITY.PURE_WHITE, 1);
        imgFrameBg.lineStyle(3, BrandColors.PRIMARY.NEOPIAN_BLUE, 1);
        imgFrameBg.fillRoundedRect(cardX + 30, cardY + 105, cardWidth - 60, 150, 10);
        imgFrameBg.strokeRoundedRect(cardX + 30, cardY + 105, cardWidth - 60, 150, 10);

        // Pet sprite
        const petSprite = this.add.sprite(cardX + cardWidth / 2, cardY + 180, 'neopets', gameState.player.spriteIndex);
        petSprite.setScale(1.8);

        // Stats section with brand styling
        const statsY = cardY + 270;
        const statsBox = this.add.graphics();
        statsBox.fillStyle(BrandColors.UTILITY.PURE_WHITE, 0.95);
        statsBox.lineStyle(2, BrandColors.PRIMARY.NEOPIAN_BLUE, 1);
        statsBox.fillRoundedRect(cardX + 20, statsY, cardWidth - 40, 140, 8);
        statsBox.strokeRoundedRect(cardX + 20, statsY, cardWidth - 40, 140, 8);

        const s = gameState.petStats;

        const statStyle = {
            fontSize: '14px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        };
        this.add.text(cardX + 40, statsY + 15, `HP: ${Math.ceil(s.hp)}/${s.maxHp}`, statStyle);
        this.add.text(cardX + 230, statsY + 15, `Level: ${s.level}`, statStyle);

        this.add.text(cardX + 40, statsY + 40, `Hunger: ${Math.ceil(s.hunger)}/100`, statStyle);
        this.add.text(cardX + 230, statsY + 40, `Energy: ${Math.ceil(s.energy)}/100`, statStyle);

        this.add.text(cardX + 40, statsY + 65, `Happiness: ${Math.ceil(s.happiness)}/100`, statStyle);

        const totalFood = gameState.getTotalFoodCount();
        this.add.text(cardX + 40, statsY + 95, `Food: ${totalFood}`, statStyle);
        this.add.text(cardX + 230, statsY + 95, `Potions: ${gameState.inventory.potions}`, statStyle);

        const readyColor = gameState.canBattle() ? BrandColors.PRIMARY.GRASSY_GREEN_HEX : BrandColors.SECONDARY.BRIGHT_RED_HEX;
        const readyText = gameState.canBattle() ? 'Ready to Battle!' : 'Needs Care';
        this.add.text(cardX + cardWidth / 2, statsY + 120, readyText, {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: readyColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Action buttons (outside card, below) with brand styling
        const buttonY = cardY + cardHeight + 20;

        // Feed button (Grassy Green)
        const totalFoodForButton = gameState.getTotalFoodCount();
        const feedBtn = this.createButton(width / 2 - 210, buttonY, `Feed (${totalFoodForButton})`, BrandColors.PRIMARY.GRASSY_GREEN);
        feedBtn.on('pointerdown', () => {
            if (gameState.feed()) {
                this.scene.restart();
            }
        });

        // Rest button (Neopian Blue)
        const restBtn = this.createButton(width / 2 - 70, buttonY, 'Rest', BrandColors.PRIMARY.NEOPIAN_BLUE);
        restBtn.on('pointerdown', () => {
            gameState.rest();
            this.scene.restart();
        });

        // Potion button (Faerieland Purple)
        const potionBtn = this.createButton(width / 2 + 70, buttonY, `Potion (${gameState.inventory.potions})`, BrandColors.SECONDARY.FAERIELAND_PURPLE);
        potionBtn.on('pointerdown', () => {
            if (gameState.usePotion()) {
                this.scene.restart();
            }
        });

        // Close button (Cheery Orange)
        const closeBtn = this.createButton(width / 2 - 100, buttonY + 60, 'Return to World', BrandColors.SECONDARY.CHEERY_ORANGE, 200);
        closeBtn.on('pointerdown', () => this.closeMenu());

        // ESC key to close
        this.input.keyboard.on('keydown-ESC', () => this.closeMenu());
    }

    createButton(x, y, text, color, width = 120) {
        const button = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: Phaser.Display.Color.ValueToColor(color).rgba,
            padding: { x: 20, y: 12 },
            fontStyle: 'bold'
        }).setInteractive();

        const brighterColor = Phaser.Display.Color.ValueToColor(color).lighten(15).color;

        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: Phaser.Display.Color.ValueToColor(brighterColor).rgba });
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: Phaser.Display.Color.ValueToColor(color).rgba });
            button.setScale(1);
        });

        return button;
    }

    closeMenu() {
        this.scene.stop();
        this.scene.resume('WorldScene');
        const worldScene = this.scene.get('WorldScene');
        worldScene.updateExternalUI();
    }
}
