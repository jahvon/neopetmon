// GalleryScene.js
// Scene for viewing the Neopian Gallery (collection of befriended pets)

class GalleryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GalleryScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xCDE8F6, 0xCDE8F6, 0xFFFFFF, 0xFFFFFF, 1);
        graphics.fillRect(0, 0, width, height);

        // Title bar
        const titleBar = this.add.rectangle(width / 2, 40, width, 80, 0x3E77E4);
        const title = this.add.text(width / 2, 40, '📖 Neopian Gallery', {
            fontSize: '36px',
            fontFamily: 'Fredoka One, sans-serif',
            color: '#FFFFFF',
            stroke: '#003366',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Get gallery data
        this.gallery = gameState.gallery;
        const allSpecies = Object.keys(window.SPECIES_PREFERENCES);
        const befriendedSpecies = this.gallery.getBefriendedSpecies();
        const completionPercent = this.gallery.getCompletionPercentage();

        // Debug logging
        console.log('Gallery befriended species:', befriendedSpecies);
        console.log('Total species count:', allSpecies.length);

        // Progress bar
        const progressY = 100;
        const progressText = this.add.text(width / 2, progressY, `Collection: ${befriendedSpecies.length} / ${allSpecies.length} (${completionPercent}%)`, {
            fontSize: '18px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#003366',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const progressBarBg = this.add.rectangle(width / 2, progressY + 30, 500, 20, 0x003366).setOrigin(0.5);
        const progressBarFill = this.add.rectangle(width / 2 - 250, progressY + 30, 500 * (completionPercent / 100), 20, 0x5FBB4E).setOrigin(0, 0.5);

        // Battles Won counter
        const battlesWonText = this.add.text(width / 2, progressY + 60, `Battles Won: ${gameState.battlesWon}`, {
            fontSize: '16px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#003366',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Species grid
        this.createSpeciesGrid(allSpecies, befriendedSpecies);

        // Back button
        this.createBackButton();
    }

    createSpeciesGrid(allSpecies, befriendedSpecies) {
        const { width, height } = this.cameras.main;
        const startY = 180;
        const gridWidth = width - 80;
        const columns = 10;
        const rowHeight = 60;
        const columnWidth = gridWidth / columns;

        // Scrollable container
        const gridContainer = this.add.container(50, startY);

        let row = 0;
        let col = 0;

        allSpecies.forEach((species, index) => {
            const entry = this.gallery.getEntry(species);
            const isBefriended = befriendedSpecies.includes(species);

            // Debug first few befriended pets
            if (isBefriended && index < 5) {
                console.log(`Species ${species}: befriended=${isBefriended}, entry=`, entry);
            }

            const x = col * columnWidth + columnWidth / 2;
            const y = row * rowHeight + rowHeight / 2;

            // Species card
            const card = this.add.container(x, y);

            // Card background
            const cardBg = this.add.rectangle(0, 0, columnWidth - 10, rowHeight - 10, isBefriended ? 0xFFFFFF : 0xCCCCCC);
            cardBg.setStrokeStyle(2, isBefriended ? 0x3E77E4 : 0x999999);
            card.add(cardBg);

            if (isBefriended && entry) {
                // Show species name (truncated if too long)
                const displayName = species.length > 10 ? species.substring(0, 9) + '.' : species;
                const nameText = this.add.text(0, -20, displayName, {
                    fontSize: '9px',
                    fontFamily: 'Verdana, Tahoma, sans-serif',
                    color: '#003366',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                card.add(nameText);

                // Show neopet sprite instead of checkmark
                const spriteIndex = window.NEOPET_SPECIES ? window.NEOPET_SPECIES.indexOf(species) : NEOPET_SPECIES.indexOf(species);
                if (spriteIndex >= 0) {
                    const petSprite = this.add.sprite(0, 3, 'neopets', spriteIndex);
                    petSprite.setScale(0.15);
                    card.add(petSprite);
                }

                // Show "Click for details" hint
                const hintText = this.add.text(0, 20, 'Click', {
                    fontSize: '7px',
                    fontFamily: 'Verdana, Tahoma, sans-serif',
                    color: '#666666'
                }).setOrigin(0.5);
                card.add(hintText);

                // Make card interactive for details
                cardBg.setInteractive({ useHandCursor: true });
                cardBg.on('pointerover', () => {
                    cardBg.setStrokeStyle(3, 0xFFCC00);
                });
                cardBg.on('pointerout', () => {
                    cardBg.setStrokeStyle(2, 0x3E77E4);
                });
                cardBg.on('pointerdown', () => {
                    this.showSpeciesDetails(species, entry);
                });
            } else {
                // Show as ???
                const unknownText = this.add.text(0, 0, '???', {
                    fontSize: '20px',
                    fontFamily: 'Verdana, Tahoma, sans-serif',
                    color: '#999999',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                card.add(unknownText);
            }

            gridContainer.add(card);

            col++;
            if (col >= columns) {
                col = 0;
                row++;
            }
        });

        // Enable scrolling if content is too tall
        const totalHeight = Math.ceil(allSpecies.length / columns) * rowHeight;
        const availableHeight = height - startY - 80;

        if (totalHeight > availableHeight) {
            // Add scroll instructions
            const scrollHint = this.add.text(width / 2, height - 60, '↑ Scroll with Mouse Wheel ↓', {
                fontSize: '14px',
                fontFamily: 'Verdana, Tahoma, sans-serif',
                color: '#666666',
                fontStyle: 'italic'
            }).setOrigin(0.5);

            // Mouse wheel scrolling
            this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
                const scrollSpeed = 20;
                const minY = startY - totalHeight + availableHeight;
                const maxY = startY;

                gridContainer.y = Phaser.Math.Clamp(
                    gridContainer.y - (deltaY * scrollSpeed / 100),
                    minY,
                    maxY
                );
            });

            // Also enable drag scrolling
            let isDragging = false;
            let dragStartY = 0;
            let containerStartY = 0;

            this.input.on('pointerdown', (pointer) => {
                if (pointer.y > startY && pointer.y < height - 80) {
                    isDragging = true;
                    dragStartY = pointer.y;
                    containerStartY = gridContainer.y;
                }
            });

            this.input.on('pointermove', (pointer) => {
                if (isDragging) {
                    const dragDistance = pointer.y - dragStartY;
                    const minY = startY - totalHeight + availableHeight;
                    const maxY = startY;

                    gridContainer.y = Phaser.Math.Clamp(
                        containerStartY + dragDistance,
                        minY,
                        maxY
                    );
                }
            });

            this.input.on('pointerup', () => {
                isDragging = false;
            });
        }
    }

    showSpeciesDetails(species, entry) {
        const { width, height } = this.cameras.main;

        // Create modal overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);
        overlay.setInteractive();
        overlay.setDepth(1000);

        // Modal panel
        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(1001);

        const panelBg = this.add.rectangle(0, 0, 500, 400, 0xFFFFFF);
        panelBg.setStrokeStyle(4, 0x3E77E4);
        panel.add(panelBg);

        // Title
        const titleBar = this.add.rectangle(0, -200 + 25, 500, 50, 0x3E77E4);
        const titleText = this.add.text(0, -200 + 25, species, {
            fontSize: '24px',
            fontFamily: 'Fredoka One, sans-serif',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        panel.add([titleBar, titleText]);

        // Details
        let detailsText = `Befriended: ${entry.befriendCount || 1} time(s)\n\n`;
        detailsText += `First seen: ${entry.firstSeen || 'Unknown'}\n`;
        detailsText += `Location: ${entry.lastLocation || 'Unknown'}\n\n`;

        detailsText += `Preferences:\n`;
        if (entry.preferences.favoriteFood) {
            const foodItem = window.getItem('food', entry.preferences.favoriteFood);
            detailsText += `  Favorite Food: ${foodItem ? foodItem.name : '???'}\n`;
        } else {
            detailsText += `  Favorite Food: Unknown\n`;
        }
        if (entry.preferences.lovedToy) {
            const toyItem = window.getItem('toys', entry.preferences.lovedToy);
            detailsText += `  Loved Toy: ${toyItem ? toyItem.name : '???'}\n`;
        } else {
            detailsText += `  Loved Toy: Unknown\n`;
        }

        const details = this.add.text(0, 0, detailsText, {
            fontSize: '14px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#003366',
            align: 'left',
            lineSpacing: 5
        }).setOrigin(0.5);
        panel.add(details);

        // Close button
        const closeBtn = this.createButton(0, 150, 'Close', () => {
            overlay.destroy();
            panel.destroy();
        });
        panel.add(closeBtn);
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 150, 40, 0x3E77E4);
        bg.setStrokeStyle(2, 0x003366);
        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
            fontFamily: 'Verdana, Tahoma, sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);
        button.setSize(150, 40);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.setFillStyle(0x5A9AFF);
        });
        button.on('pointerout', () => {
            bg.setFillStyle(0x3E77E4);
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

    createBackButton() {
        const backBtn = this.createButton(100, this.cameras.main.height - 40, '← Back to World', () => {
            this.scene.start('WorldScene');
        });
    }
}
