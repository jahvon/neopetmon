class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data) {
        this.wildPetIndex = data.wildPetIndex;
        this.wildPetSprite = data.wildPetSprite;
        this.wildPetLevel = data.wildPetLevel || gameState.petStats.level; // Use stored level or default
        this.battleMode = data.battleMode || 'normal'; // 'normal', 'calm', or 'cure'
        this.wildPetSpecies = data.wildPetSpecies;
        this.moodData = data.moodData;
        this.location = data.location || 'Neopia Central';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Battle background with brand gradient (Sky Blue to White)
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(
            BrandColors.UTILITY.SKY_BLUE,
            BrandColors.UTILITY.SKY_BLUE,
            BrandColors.UTILITY.PURE_WHITE,
            BrandColors.UTILITY.PURE_WHITE,
            1
        );
        graphics.fillRect(0, 0, width, height);

        // Battle sparkles with Golden Yellow
        for (let i = 0; i < 10; i++) {
            const sparkle = this.add.text(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                '⚡',
                {
                    fontSize: '20px',
                    color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX
                }
            );
            this.tweens.add({
                targets: sparkle,
                alpha: 0.4,
                scale: 1.3,
                duration: Phaser.Math.Between(500, 1000),
                yoyo: true,
                repeat: -1
            });
        }

        // Title with brand styling (Fredoka One + Dark Blue outline)
        let titleText = 'BATTLE!';
        let titleColor = BrandColors.SECONDARY.BRIGHT_RED_HEX;

        if (this.battleMode === 'calm') {
            titleText = 'CALM DOWN!';
            titleColor = BrandColors.SECONDARY.CHEERY_ORANGE_HEX;
        } else if (this.battleMode === 'cure') {
            titleText = 'HELP & HEAL!';
            titleColor = BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX;
        }

        const battleTitle = this.add.text(width / 2, 30, titleText, {
            fontSize: '44px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: titleColor,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        battleTitle.setShadow(3, 3, 'rgba(0, 0, 0, 0.3)', 2);

        // Wild pet stats (use stored level with randomized strength)
        const enemyLevel = this.wildPetLevel;
        const strengthMultiplier = Phaser.Math.FloatBetween(0.7, 1.3); // 70% to 130% strength

        // For calm/cure modes, use "Agitation" or "Sickness" instead of HP
        if (this.battleMode === 'calm' || this.battleMode === 'cure') {
            const meterName = this.battleMode === 'calm' ? 'agitation' : 'sickness';
            this.enemyStats = {
                level: enemyLevel,
                [meterName]: 100,
                [`max${meterName.charAt(0).toUpperCase() + meterName.slice(1)}`]: 100,
                attack: Math.floor((4 + (enemyLevel * 1) + Phaser.Math.Between(-1, 2)) * strengthMultiplier), // Weaker attacks
                defense: Math.floor((3 + enemyLevel + Phaser.Math.Between(-1, 2)) * strengthMultiplier)
            };
        } else {
            this.enemyStats = {
                level: enemyLevel,
                hp: Math.floor((60 + (enemyLevel * 8) + Phaser.Math.Between(-15, 15)) * strengthMultiplier),
                maxHp: 0, // Set after hp calculation
                attack: Math.floor((6 + (enemyLevel * 1.5) + Phaser.Math.Between(-2, 3)) * strengthMultiplier),
                defense: Math.floor((3 + enemyLevel + Phaser.Math.Between(-1, 2)) * strengthMultiplier)
            };
            this.enemyStats.maxHp = this.enemyStats.hp;
        }

        // Display pets with smaller scale
        this.playerPet = this.add.sprite(150, height / 2, 'neopets', gameState.player.spriteIndex);
        this.playerPet.setScale(0.8);

        this.enemyPet = this.add.sprite(width - 150, height / 2 - 50, 'neopets', this.wildPetIndex);
        this.enemyPet.setScale(0.8);

        // HP bars
        this.createHPBars();

        // Battle log with brand styling
        this.battleLog = this.add.text(width / 2, height - 200, '', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            backgroundColor: BrandColors.UTILITY.PURE_WHITE_HEX,
            padding: { x: 18, y: 14 },
            align: 'center',
            wordWrap: { width: width - 100 },
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Action buttons
        this.createActionButtons();

        // Battle state
        this.playerTurn = true;
        this.battleEnded = false;

        // Initial message based on mode
        if (this.battleMode === 'calm') {
            this.addBattleMessage(`A ${this.moodData.description} ${this.wildPetSpecies} is acting up!\nCalm it down to befriend it!`);
        } else if (this.battleMode === 'cure') {
            this.addBattleMessage(`A ${this.moodData.description} ${this.wildPetSpecies} needs help!\nHeal it to befriend it!`);
        } else {
            this.addBattleMessage(`A wild Neopet (Lv.${this.enemyStats.level}) appeared!`);
        }
    }

    createHPBars() {
        const width = this.cameras.main.width;

        // Player HP with brand styling
        this.add.text(20, 20, `${gameState.player.name} (Lv.${gameState.petStats.level})`, {
            fontSize: '18px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        });

        // HP bar with Dark Blue border
        this.playerHPBarBg = this.add.rectangle(20, 50, 200, 20, BrandColors.UTILITY.DARK_BLUE).setOrigin(0);
        this.playerHPBar = this.add.rectangle(22, 52, 196, 16, BrandColors.PRIMARY.GRASSY_GREEN).setOrigin(0);

        this.playerHPText = this.add.text(20, 75, '', {
            fontSize: '14px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        });

        // Enemy HP/Agitation/Sickness with brand styling
        let enemyLabel = `Wild Neopet (Lv.${this.enemyStats.level})`;
        if (this.battleMode === 'calm' || this.battleMode === 'cure') {
            enemyLabel = `${this.wildPetSpecies} (Lv.${this.enemyStats.level})`;
        }

        this.add.text(width - 220, 20, enemyLabel, {
            fontSize: '18px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        });

        // HP/Agitation/Sickness bar with Dark Blue border
        this.enemyHPBarBg = this.add.rectangle(width - 220, 50, 200, 20, BrandColors.UTILITY.DARK_BLUE).setOrigin(0);

        let barColor = BrandColors.SECONDARY.BRIGHT_RED;
        if (this.battleMode === 'calm') {
            barColor = BrandColors.SECONDARY.CHEERY_ORANGE;
        } else if (this.battleMode === 'cure') {
            barColor = BrandColors.SECONDARY.FAERIELAND_PURPLE;
        }

        this.enemyHPBar = this.add.rectangle(width - 218, 52, 196, 16, barColor).setOrigin(0);

        this.enemyHPText = this.add.text(width - 220, 75, '', {
            fontSize: '14px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            fontStyle: 'bold'
        });

        this.updateHPDisplay();
    }

    updateHPDisplay() {
        // Player HP with brand colors
        const playerHPPercent = gameState.petStats.hp / gameState.petStats.maxHp;
        this.playerHPBar.width = 196 * playerHPPercent;

        if (playerHPPercent > 0.5) {
            this.playerHPBar.setFillStyle(BrandColors.PRIMARY.GRASSY_GREEN); // Green for high HP
        } else if (playerHPPercent > 0.25) {
            this.playerHPBar.setFillStyle(BrandColors.PRIMARY.GOLDEN_YELLOW); // Yellow for medium HP
        } else {
            this.playerHPBar.setFillStyle(BrandColors.SECONDARY.BRIGHT_RED); // Red for low HP
        }

        this.playerHPText.setText(`HP: ${Math.ceil(gameState.petStats.hp)}/${gameState.petStats.maxHp}`);

        // Enemy HP/Agitation/Sickness
        if (this.battleMode === 'calm') {
            const agitationPercent = this.enemyStats.agitation / this.enemyStats.maxAgitation;
            this.enemyHPBar.width = 196 * agitationPercent;
            this.enemyHPText.setText(`Agitation: ${Math.ceil(this.enemyStats.agitation)}`);
        } else if (this.battleMode === 'cure') {
            const sicknessPercent = this.enemyStats.sickness / this.enemyStats.maxSickness;
            this.enemyHPBar.width = 196 * sicknessPercent;
            this.enemyHPText.setText(`Sickness: ${Math.ceil(this.enemyStats.sickness)}`);
        } else {
            const enemyHPPercent = this.enemyStats.hp / this.enemyStats.maxHp;
            this.enemyHPBar.width = 196 * enemyHPPercent;
            this.enemyHPText.setText(`HP: ${Math.ceil(this.enemyStats.hp)}/${this.enemyStats.maxHp}`);
        }
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Row 1: Attack moves
        const row1Y = height - 130;

        // Quick Attack button with brand styling (Cheery Orange)
        this.quickButton = this.add.text(width / 2 - 250, row1Y, 'Quick Attack', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.SECONDARY.CHEERY_ORANGE_HEX,
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setInteractive();

        this.quickButton.on('pointerover', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.quickButton.setStyle({ backgroundColor: '#FFB033' }); // Brightened orange
            }
        });

        this.quickButton.on('pointerout', () => {
            this.quickButton.setStyle({ backgroundColor: BrandColors.SECONDARY.CHEERY_ORANGE_HEX });
        });

        this.quickButton.on('pointerdown', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.playerQuickAttack();
            }
        });

        // Normal Attack button with brand styling (Bright Red)
        this.attackButton = this.add.text(width / 2 - 80, row1Y, 'Attack', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX,
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setInteractive();

        this.attackButton.on('pointerover', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.attackButton.setStyle({ backgroundColor: '#F04F4F' }); // Brightened red
            }
        });

        this.attackButton.on('pointerout', () => {
            this.attackButton.setStyle({ backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX });
        });

        this.attackButton.on('pointerdown', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.playerAttack();
            }
        });

        // Special Move button with brand styling (Faerieland Purple)
        const specialAvailable = gameState.canUseSpecialMove();
        const specialText = specialAvailable ? 'SPECIAL' : `SPECIAL (${3 - gameState.battlesSinceSpecial})`;

        this.specialButton = this.add.text(width / 2 + 60, row1Y, specialText, {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: specialAvailable ? BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX : '#888888',
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setInteractive();

        this.specialButton.on('pointerover', () => {
            if (this.playerTurn && !this.battleEnded && specialAvailable) {
                this.specialButton.setStyle({ backgroundColor: '#AB6FE8' }); // Brightened purple
            }
        });

        this.specialButton.on('pointerout', () => {
            this.specialButton.setStyle({ backgroundColor: specialAvailable ? BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX : '#888888' });
        });

        this.specialButton.on('pointerdown', () => {
            if (this.playerTurn && !this.battleEnded && specialAvailable) {
                this.playerSpecialAttack();
            }
        });

        // Row 2: Items and actions
        const row2Y = height - 80;

        // Use Potion button with brand styling (Grassy Green)
        this.potionButton = this.add.text(width / 2 - 150, row2Y, `Potion (${gameState.inventory.potions})`, {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.PRIMARY.GRASSY_GREEN_HEX,
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setInteractive();

        this.potionButton.on('pointerover', () => {
            if (this.playerTurn && !this.battleEnded && gameState.inventory.potions > 0) {
                this.potionButton.setStyle({ backgroundColor: '#7BCB6A' }); // Brightened green
            }
        });

        this.potionButton.on('pointerout', () => {
            this.potionButton.setStyle({ backgroundColor: BrandColors.PRIMARY.GRASSY_GREEN_HEX });
        });

        this.potionButton.on('pointerdown', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.usePotion();
            }
        });

        // Run button with brand styling (Neopian Blue)
        this.runButton = this.add.text(width / 2 + 30, row2Y, 'Run', {
            fontSize: '16px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.UTILITY.PURE_WHITE_HEX,
            backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            padding: { x: 18, y: 10 },
            fontStyle: 'bold'
        }).setInteractive();

        this.runButton.on('pointerover', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.runButton.setStyle({ backgroundColor: '#5A8FEA' }); // Brightened blue
            }
        });

        this.runButton.on('pointerout', () => {
            this.runButton.setStyle({ backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX });
        });

        this.runButton.on('pointerdown', () => {
            if (this.playerTurn && !this.battleEnded) {
                this.runAway();
            }
        });
    }

    playerQuickAttack() {
        this.playerTurn = false;
        this.disableButtons();

        // Quick attack: 70% damage, high accuracy, faster
        const baseDamage = gameState.petStats.attack * 0.7;
        const damage = Math.max(1, Math.floor(baseDamage - Math.floor(this.enemyStats.defense / 3) + Phaser.Math.Between(-2, 2)));

        // Apply damage to appropriate stat
        if (this.battleMode === 'calm') {
            this.enemyStats.agitation -= damage;
            this.addBattleMessage(`⚡ ${gameState.player.name} uses Gentle Tackle! (Agitation -${damage})`);
        } else if (this.battleMode === 'cure') {
            this.enemyStats.sickness -= damage;
            this.addBattleMessage(`⚡ ${gameState.player.name} uses Comforting Touch! (Sickness -${damage})`);
        } else {
            this.enemyStats.hp -= damage;
            this.addBattleMessage(`⚡ ${gameState.player.name} uses Quick Attack for ${damage} damage!`);
        }

        // Quick attack animation (faster)
        this.tweens.add({
            targets: this.playerPet,
            x: this.playerPet.x + 60,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.enemyPet.setTint(0xFFFF00);
                this.time.delayedCall(150, () => {
                    this.enemyPet.clearTint();
                });
            }
        });

        this.updateHPDisplay();

        // Check victory condition
        if (this.checkVictoryCondition()) {
            this.time.delayedCall(1000, () => this.playerWin());
        } else {
            this.time.delayedCall(1200, () => this.enemyAttack());
        }
    }

    playerAttack() {
        this.playerTurn = false;
        this.disableButtons();

        // Normal attack: 100% damage
        const damage = Math.max(1, Math.floor(gameState.petStats.attack - Math.floor(this.enemyStats.defense / 2) + Phaser.Math.Between(-3, 3)));

        // Apply damage to appropriate stat
        if (this.battleMode === 'calm') {
            this.enemyStats.agitation -= damage;
            this.addBattleMessage(`💥 ${gameState.player.name} uses Soothing Sound! (Agitation -${damage})`);
        } else if (this.battleMode === 'cure') {
            this.enemyStats.sickness -= damage;
            this.addBattleMessage(`💥 ${gameState.player.name} uses Medicine Spray! (Sickness -${damage})`);
        } else {
            this.enemyStats.hp -= damage;
            this.addBattleMessage(`💥 ${gameState.player.name} attacks for ${damage} damage!`);
        }

        // Attack animation
        this.tweens.add({
            targets: this.playerPet,
            x: this.playerPet.x + 50,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.enemyPet.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                    this.enemyPet.clearTint();
                });
            }
        });

        this.updateHPDisplay();

        if (this.checkVictoryCondition()) {
            this.time.delayedCall(1000, () => this.playerWin());
        } else {
            this.time.delayedCall(1500, () => this.enemyAttack());
        }
    }

    playerSpecialAttack() {
        this.playerTurn = false;
        this.disableButtons();

        // Special attack: 180% damage, ignores more defense
        const baseDamage = gameState.petStats.attack * 1.8;
        const damage = Math.max(1, Math.floor(baseDamage - Math.floor(this.enemyStats.defense / 4) + Phaser.Math.Between(-2, 5)));

        // Apply damage to appropriate stat
        if (this.battleMode === 'calm') {
            this.enemyStats.agitation -= damage;
            this.addBattleMessage(`✨ ${gameState.player.name} uses MEGA CALM! (Agitation -${damage}) ✨`);
        } else if (this.battleMode === 'cure') {
            this.enemyStats.sickness -= damage;
            this.addBattleMessage(`✨ ${gameState.player.name} uses SUPER HEALING! (Sickness -${damage}) ✨`);
        } else {
            this.enemyStats.hp -= damage;
            this.addBattleMessage(`✨ ${gameState.player.name} unleashes SPECIAL ATTACK for ${damage} damage! ✨`);
        }

        gameState.useSpecialMove();

        // Special attack animation (dramatic)
        this.tweens.add({
            targets: this.playerPet,
            scale: this.playerPet.scaleX * 1.3,
            duration: 200,
            yoyo: true
        });

        this.tweens.add({
            targets: this.playerPet,
            x: this.playerPet.x + 70,
            duration: 250,
            yoyo: true,
            onComplete: () => {
                this.enemyPet.setTint(0xFF00FF);
                // Flash effect
                for (let i = 0; i < 3; i++) {
                    this.time.delayedCall(100 * i, () => {
                        this.enemyPet.clearTint();
                    });
                    this.time.delayedCall(100 * i + 50, () => {
                        this.enemyPet.setTint(0xFF00FF);
                    });
                }
                this.time.delayedCall(300, () => {
                    this.enemyPet.clearTint();
                });
            }
        });

        this.updateHPDisplay();

        if (this.checkVictoryCondition()) {
            this.time.delayedCall(1000, () => this.playerWin());
        } else {
            this.time.delayedCall(1800, () => this.enemyAttack());
        }
    }

    enemyAttack() {
        const damage = Math.max(1, this.enemyStats.attack - Math.floor(gameState.petStats.defense / 2) + Phaser.Math.Between(-3, 3));
        gameState.petStats.hp -= damage;
        gameState.save();

        this.addBattleMessage(`Wild Neopet attacks for ${damage} damage!`);

        // Attack animation
        this.tweens.add({
            targets: this.enemyPet,
            x: this.enemyPet.x - 50,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.playerPet.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                    this.playerPet.clearTint();
                });
            }
        });

        this.updateHPDisplay();

        if (gameState.petStats.hp <= 0) {
            this.time.delayedCall(1000, () => this.playerLose());
        } else {
            this.time.delayedCall(1500, () => {
                this.playerTurn = true;
                this.enableButtons();
            });
        }
    }

    usePotion() {
        if (gameState.usePotion()) {
            this.playerTurn = false;
            this.disableButtons();

            this.addBattleMessage(`${gameState.player.name} used a potion! Restored 50 HP.`);
            this.updateHPDisplay();
            this.potionButton.setText(`POTION (${gameState.inventory.potions})`);

            this.time.delayedCall(1500, () => this.enemyAttack());
        } else {
            this.addBattleMessage('No potions left!');
        }
    }

    runAway() {
        this.addBattleMessage('Got away safely!');
        this.battleEnded = true;
        this.disableButtons();

        // Add continue button with brand styling
        this.time.delayedCall(1000, () => {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;

            const continueBtn = this.add.text(width / 2, height / 2 + 100, 'Return to World', {
                fontSize: '24px',
                fontFamily: "'Verdana', 'Tahoma', sans-serif",
                color: BrandColors.UTILITY.PURE_WHITE_HEX,
                backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
                padding: { x: 32, y: 16 },
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();

            continueBtn.on('pointerover', () => {
                continueBtn.setStyle({ backgroundColor: '#5A8FEA' }); // Brightened blue
                continueBtn.setScale(1.05);
            });

            continueBtn.on('pointerout', () => {
                continueBtn.setStyle({ backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX });
                continueBtn.setScale(1);
            });

            continueBtn.on('pointerdown', () => {
                // Clear the encountered flag if sprite exists
                if (this.wildPetSprite && this.wildPetSprite.setData) {
                    this.wildPetSprite.setData('encountered', false);
                }
                this.scene.stop();
                this.scene.resume('WorldScene');
            });
        });
    }

    checkVictoryCondition() {
        if (this.battleMode === 'calm') {
            return this.enemyStats.agitation <= 0;
        } else if (this.battleMode === 'cure') {
            return this.enemyStats.sickness <= 0;
        } else {
            return this.enemyStats.hp <= 0;
        }
    }

    playerWin() {
        this.battleEnded = true;
        this.disableButtons();

        // For calm/cure modes, transition to befriend scene
        if (this.battleMode === 'calm' || this.battleMode === 'cure') {
            const message = this.battleMode === 'calm' ?
                `The ${this.wildPetSpecies} has calmed down!` :
                `The ${this.wildPetSpecies} feels much better!`;

            this.addBattleMessage(message);

            this.time.delayedCall(2000, () => {
                this.scene.start('BefriendScene', {
                    wildPetSpecies: this.wildPetSpecies,
                    wildPetIndex: this.wildPetIndex,
                    wildPetLevel: this.wildPetLevel,
                    moodData: { mood: 'neutral', icon: '⭐', color: '#FFCC00', description: 'Curious' },
                    location: this.location
                });
            });
            return;
        }

        // Calculate exp based on enemy level and strength
        const baseExp = 20 + (this.enemyStats.level * 8);
        const strengthBonus = Math.floor((this.enemyStats.attack + this.enemyStats.defense) / 2);
        const expGained = baseExp + strengthBonus;

        const oldLevel = gameState.petStats.level;
        const oldAttack = Math.floor(gameState.petStats.attack);
        const oldDefense = Math.floor(gameState.petStats.defense);

        const leveledUp = gameState.winBattle(expGained, this.enemyStats.level);

        const newAttack = Math.floor(gameState.petStats.attack);
        const newDefense = Math.floor(gameState.petStats.defense);

        let message = `VICTORY!\nGained ${expGained} EXP!`;

        if (leveledUp) {
            message += `\n${gameState.player.name} leveled up to ${gameState.petStats.level}!`;
            message += `\nATK: ${oldAttack} → ${newAttack} | DEF: ${oldDefense} → ${newDefense}`;
        } else if (newAttack > oldAttack || newDefense > oldDefense) {
            message += `\nGetting stronger through battle!`;
            if (newAttack > oldAttack) message += ` ATK +${newAttack - oldAttack}`;
            if (newDefense > oldDefense) message += ` DEF +${newDefense - oldDefense}`;
        }

        const rewardMultiplier = Math.max(1, Math.floor(this.enemyStats.level / 3));
        message += `\nReceived ${1 + rewardMultiplier} Food!`;

        this.addBattleMessage(message);

        // Victory animation
        this.tweens.add({
            targets: this.enemyPet,
            alpha: 0,
            duration: 500
        });

        // Increment battle count for special move cooldown
        gameState.incrementBattleCount();

        // Add continue button with brand styling
        this.time.delayedCall(1000, () => {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;

            const continueBtn = this.add.text(width / 2, height / 2 + 100, 'Continue', {
                fontSize: '24px',
                fontFamily: "'Verdana', 'Tahoma', sans-serif",
                color: BrandColors.UTILITY.PURE_WHITE_HEX,
                backgroundColor: BrandColors.PRIMARY.GRASSY_GREEN_HEX,
                padding: { x: 32, y: 16 },
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();

            continueBtn.on('pointerover', () => {
                continueBtn.setStyle({ backgroundColor: '#7BCB6A' }); // Brightened green
                continueBtn.setScale(1.05);
            });

            continueBtn.on('pointerout', () => {
                continueBtn.setStyle({ backgroundColor: BrandColors.PRIMARY.GRASSY_GREEN_HEX });
                continueBtn.setScale(1);
            });

            continueBtn.on('pointerdown', () => {
                if (this.wildPetSprite && this.wildPetSprite.destroy) {
                    this.wildPetSprite.destroy();
                }
                this.scene.stop();
                this.scene.resume('WorldScene');
                const worldScene = this.scene.get('WorldScene');
                worldScene.updateExternalUI();
            });
        });
    }

    playerLose() {
        this.battleEnded = true;
        this.disableButtons();

        // Increment battle count even on loss
        gameState.incrementBattleCount();

        gameState.petStats.hp = gameState.petStats.maxHp / 2;
        gameState.loseBattle();

        this.addBattleMessage(`${gameState.player.name} fainted!\nReturning home to rest...`);

        // Add continue button with brand styling
        this.time.delayedCall(1000, () => {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;

            const continueBtn = this.add.text(width / 2, height / 2 + 100, 'Continue', {
                fontSize: '24px',
                fontFamily: "'Verdana', 'Tahoma', sans-serif",
                color: BrandColors.UTILITY.PURE_WHITE_HEX,
                backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX,
                padding: { x: 32, y: 16 },
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();

            continueBtn.on('pointerover', () => {
                continueBtn.setStyle({ backgroundColor: '#F04F4F' }); // Brightened red
                continueBtn.setScale(1.05);
            });

            continueBtn.on('pointerout', () => {
                continueBtn.setStyle({ backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX });
                continueBtn.setScale(1);
            });

            continueBtn.on('pointerdown', () => {
                if (this.wildPetSprite && this.wildPetSprite.setData) {
                    this.wildPetSprite.setData('encountered', false);
                }
                this.scene.stop();
                this.scene.resume('WorldScene');
                const worldScene = this.scene.get('WorldScene');
                worldScene.updateExternalUI();
            });
        });
    }

    addBattleMessage(text) {
        this.battleLog.setText(text);
    }

    disableButtons() {
        this.quickButton.setAlpha(0.5);
        this.attackButton.setAlpha(0.5);
        this.specialButton.setAlpha(0.5);
        this.potionButton.setAlpha(0.5);
        this.runButton.setAlpha(0.5);
    }

    enableButtons() {
        this.quickButton.setAlpha(1);
        this.attackButton.setAlpha(1);
        this.specialButton.setAlpha(1);
        this.potionButton.setAlpha(1);
        this.runButton.setAlpha(1);
    }
}
