class SelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectionScene' });
        this.currentPetIndex = 0;
        this.maxPets = 56; // 8 cols x 7 rows
        this.petName = '';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Sky Blue gradient background (per brand guide)
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(
            BrandColors.UTILITY.SKY_BLUE,
            BrandColors.UTILITY.SKY_BLUE,
            BrandColors.UTILITY.PURE_WHITE,
            BrandColors.UTILITY.PURE_WHITE,
            1
        );
        graphics.fillRect(0, 0, width, height);

        // Floating sparkles with Golden Yellow stars
        for (let i = 0; i < 15; i++) {
            const sparkle = this.add.text(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                ['✨', '⭐', '💫'][Phaser.Math.Between(0, 2)],
                {
                    fontSize: '16px',
                    color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX
                }
            );
            this.tweens.add({
                targets: sparkle,
                y: sparkle.y - 50,
                alpha: 0.3,
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Clouds
        this.createCloud(100, 80, 1);
        this.createCloud(width - 150, 100, 0.8);
        this.createCloud(width / 2 + 100, 450, 1.2);

        // Title with Fredoka One font and Dark Blue outline
        const title = this.add.text(width / 2, 50, 'Choose Your Neopet!', {
            fontSize: '42px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        title.setShadow(3, 3, 'rgba(0, 0, 0, 0.3)', 2);

        // Instructions with brand font
        this.add.text(width / 2, 100, 'Use arrows to browse, then enter a magical name!', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Current pet display (sprites are 288x288, scale down to fit nicely)
        this.currentPet = this.add.sprite(width / 2, height / 2 - 50, 'neopets', this.currentPetIndex);
        this.currentPet.setScale(0.8);

        // Pet species name with brand styling
        this.petSpeciesText = this.add.text(width / 2, height / 2 + 140, '', {
            fontSize: '36px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.petSpeciesText.setShadow(2, 2, 'rgba(0, 0, 0, 0.3)', 2);

        // Pet counter with brand font
        this.petCounter = this.add.text(width / 2, height / 2 + 180, '', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Left arrow button with Neopian Blue
        const leftArrow = this.add.text(width / 2 - 250, height / 2, '◀', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive();

        leftArrow.on('pointerover', () => {
            leftArrow.setTint(BrandColors.PRIMARY.GOLDEN_YELLOW);
            leftArrow.setScale(1.1);
        });

        leftArrow.on('pointerout', () => {
            leftArrow.clearTint();
            leftArrow.setScale(1);
        });

        leftArrow.on('pointerdown', () => {
            this.previousPet();
        });

        // Right arrow button with Neopian Blue
        const rightArrow = this.add.text(width / 2 + 250, height / 2, '▶', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive();

        rightArrow.on('pointerover', () => {
            rightArrow.setTint(BrandColors.PRIMARY.GOLDEN_YELLOW);
            rightArrow.setScale(1.1);
        });

        rightArrow.on('pointerout', () => {
            rightArrow.clearTint();
            rightArrow.setScale(1);
        });

        rightArrow.on('pointerdown', () => {
            this.nextPet();
        });

        // Keyboard arrow controls
        this.input.keyboard.on('keydown-LEFT', () => {
            this.previousPet();
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.nextPet();
        });

        this.updatePetDisplay();

        // Name input area with brand styling
        const nameLabel = this.add.text(width / 2, height - 140, 'Enter Your Pet\'s Name', {
            fontSize: '24px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        nameLabel.setShadow(2, 2, 'rgba(0, 0, 0, 0.3)', 2);

        // Input box background with brand colors
        const inputBox = this.add.rectangle(width / 2, height - 100, 300, 40, BrandColors.UTILITY.PURE_WHITE);
        inputBox.setStrokeStyle(3, BrandColors.PRIMARY.NEOPIAN_BLUE);

        // Add placeholder text
        this.placeholderText = this.add.text(width / 2, height - 100, 'Type a magical name...', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: '#AAAAAA',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.nameText = this.add.text(width / 2, height - 100, '', {
            fontSize: '20px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Start button with brand styling (Neopian Blue)
        const startButton = this.add.text(width / 2, height - 45, 'Begin Adventure!', {
            fontSize: '22px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            padding: { x: 30, y: 14 },
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        // Add rounded corners effect
        startButton.setStyle({
            borderRadius: '15px'
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#5A8FEA' }); // Brightened blue
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX });
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            if (this.petName.length > 0) {
                const row = Math.floor(this.currentPetIndex / 8);
                const col = this.currentPetIndex % 8;
                gameState.setPlayer(this.petName, this.currentPetIndex, row, col);
                this.scene.start('WorldScene');
            } else {
                // Show error
                this.showError();
            }
        });

        // Keyboard input for name (but not arrow keys)
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                this.petName = this.petName.slice(0, -1);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                // Handled separately above
                return;
            } else if (event.key.length === 1 && this.petName.length < 15) {
                this.petName += event.key;
            }

            // Update display
            this.nameText.setText(this.petName);

            // Hide/show placeholder
            if (this.petName.length > 0) {
                this.placeholderText.setVisible(false);
            } else {
                this.placeholderText.setVisible(true);
            }
        });
    }

    nextPet() {
        this.currentPetIndex = (this.currentPetIndex + 1) % this.maxPets;
        this.updatePetDisplay();
    }

    previousPet() {
        this.currentPetIndex = (this.currentPetIndex - 1 + this.maxPets) % this.maxPets;
        this.updatePetDisplay();
    }

    updatePetDisplay() {
        this.currentPet.setFrame(this.currentPetIndex);
        this.petSpeciesText.setText(getNeopetSpecies(this.currentPetIndex));
        this.petCounter.setText(`${this.currentPetIndex + 1} / ${this.maxPets}`);
    }

    createCloud(x, y, scale) {
        const cloud = this.add.graphics();
        cloud.fillStyle(0xFFFFFF, 0.8);

        // Draw cloud with circles
        cloud.fillCircle(0, 0, 25 * scale);
        cloud.fillCircle(-20 * scale, 5, 20 * scale);
        cloud.fillCircle(20 * scale, 5, 20 * scale);
        cloud.fillCircle(-10 * scale, -10, 18 * scale);
        cloud.fillCircle(10 * scale, -10, 18 * scale);

        cloud.setPosition(x, y);

        // Animate cloud floating
        this.tweens.add({
            targets: cloud,
            x: x + 30,
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    showError() {
        const width = this.cameras.main.width;
        const errorText = this.add.text(width / 2, 130, 'Please enter a magical name!', {
            fontSize: '18px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX,
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: errorText,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => errorText.destroy()
        });
    }
}
