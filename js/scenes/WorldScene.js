class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldScene' });
        this.wildPets = [];
        this.specialItems = [];
        this.collisionAreas = []; // Track non-walkable areas (kept for reference)
        this.grassAreas = []; // Track grass-only areas for animal spawning (kept for reference)
        this.collisionCanvas = null; // Canvas for pixel-based collision
        this.collisionContext = null; // Canvas context for pixel reading
        this.collisionImageData = null; // Pixel data for fast collision checks
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add the static world map as background
        const map = this.add.image(0, 0, 'worldMap');
        map.setOrigin(0, 0);
        map.setDepth(0);

        // Scale the map to fit the game dimensions (1280x1024 -> game canvas)
        const scaleX = width / map.width;
        const scaleY = height / map.height;
        map.setScale(scaleX, scaleY);

        // Initialize pixel-based collision detection using map-mask.png
        this.initializeCollisionMask();

        // Optional: Draw collision areas for debugging (set to false to hide)
        const debugCollision = false;
        if (debugCollision) {
            this.drawCollisionMaskOverlay();
        }

        // Debug graphics for showing collision points (always created, toggled with D key)
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.setDepth(2000);
        this.showDebugCollision = false;

        // Player pet - spawn at saved position or default to bottom-right castle area
        const savedPos = gameState.getPlayerPosition();
        this.playerPet = this.add.sprite(savedPos.x, savedPos.y, 'neopets', gameState.player.spriteIndex);
        this.playerPet.setScale(0.25); // Much smaller to fit the tile scale
        this.playerPet.setDepth(100); // Above ground, below UI

        // Idle animation - store reference so we can pause during movement
        this.idleTween = this.tweens.add({
            targets: this.playerPet,
            y: this.playerPet.y - 5,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            paused: false
        });

        // Spawn wild pets
        this.spawnWildPets();

        // Spawn special items
        this.spawnSpecialItems();

        // Movement controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };

        // 'C' key for care menu
        this.input.keyboard.on('keydown-C', () => {
            this.scene.pause();
            this.scene.launch('CareScene');
        });

        // 'G' key to open Gallery
        this.input.keyboard.on('keydown-G', () => {
            this.scene.pause();
            this.scene.launch('GalleryScene');
        });

        // 'N' key for New Game
        this.input.keyboard.on('keydown-N', () => {
            if (confirm('Are you sure you want to start a new game? All progress will be lost!')) {
                localStorage.removeItem('neopetmonSave');
                localStorage.removeItem('neopetGallery');
                window.location.reload();
            }
        });

        // 'B' key to toggle debug collision visualization
        this.input.keyboard.on('keydown-B', () => {
            this.showDebugCollision = !this.showDebugCollision;
            console.log(`Debug collision overlay: ${this.showDebugCollision ? 'ON' : 'OFF'}`);

            // Clear debug graphics
            this.debugGraphics.clear();

            // Remove existing overlay if present
            if (this.collisionMaskOverlay) {
                this.collisionMaskOverlay.destroy();
                this.collisionMaskOverlay = null;
            }

            // Add overlay if toggled on
            if (this.showDebugCollision) {
                this.collisionMaskOverlay = this.add.image(0, 0, 'collisionMask');
                this.collisionMaskOverlay.setOrigin(0, 0);
                this.collisionMaskOverlay.setAlpha(0.5);
                this.collisionMaskOverlay.setDepth(1000);

                // Scale to match game canvas
                const width = this.cameras.main.width;
                const height = this.cameras.main.height;
                const scaleX = width / this.collisionMaskOverlay.width;
                const scaleY = height / this.collisionMaskOverlay.height;
                this.collisionMaskOverlay.setScale(scaleX, scaleY);
            }
        });

        // Show the game footer
        this.showGameFooter();

        // Update external UI
        this.updateExternalUI();
        this.updateTitleOverlay();
    }

    showGameFooter() {
        const footer = document.getElementById('game-footer');
        if (footer) {
            footer.style.display = 'flex';
        }
    }

    initializeCollisionMask() {
        // Get the collision mask texture
        const maskTexture = this.textures.get('collisionMask').getSourceImage();

        // Create a canvas to read pixel data
        this.collisionCanvas = document.createElement('canvas');
        this.collisionCanvas.width = maskTexture.width;
        this.collisionCanvas.height = maskTexture.height;

        // Get context and draw the mask image
        this.collisionContext = this.collisionCanvas.getContext('2d', { willReadFrequently: true });
        this.collisionContext.drawImage(maskTexture, 0, 0);

        // Store the pixel data for fast access
        this.collisionImageData = this.collisionContext.getImageData(
            0, 0,
            this.collisionCanvas.width,
            this.collisionCanvas.height
        );

        console.log(`Collision mask initialized: ${this.collisionCanvas.width}x${this.collisionCanvas.height}`);

        // Debug: Check spawn position pixel color
        const spawnX = 920;
        const spawnY = 550;
        const scaleX = this.collisionCanvas.width / 1200;
        const scaleY = this.collisionCanvas.height / 800;
        const maskX = Math.floor(spawnX * scaleX);
        const maskY = Math.floor(spawnY * scaleY);

        const index = (maskY * this.collisionCanvas.width + maskX) * 4;
        const r = this.collisionImageData.data[index];
        const g = this.collisionImageData.data[index + 1];
        const b = this.collisionImageData.data[index + 2];

        console.log(`Spawn position (${spawnX}, ${spawnY}) maps to mask (${maskX}, ${maskY})`);
        console.log(`Pixel color at spawn: RGB(${r}, ${g}, ${b}) - ${r < 50 ? 'BLACK (blocked)' : 'WHITE (walkable)'}`);
    }

    drawCollisionMaskOverlay() {
        // Draw the collision mask as a semi-transparent overlay for debugging
        const maskSprite = this.add.image(0, 0, 'collisionMask');
        maskSprite.setOrigin(0, 0);
        maskSprite.setAlpha(0.5);
        maskSprite.setDepth(1000);

        // Scale to match game canvas
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scaleX = width / maskSprite.width;
        const scaleY = height / maskSprite.height;
        maskSprite.setScale(scaleX, scaleY);
    }

    spawnWildPets() {
        // Clear existing wild pets
        this.wildPets.forEach(pet => pet.destroy());
        this.wildPets = [];

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Load saved wild pets
        const savedWildPets = gameState.getWildPets();

        // Restore existing wild pets with slight position variation
        savedWildPets.forEach(savedPet => {
            const x = savedPet.x + Phaser.Math.Between(-20, 20);
            const y = savedPet.y + Phaser.Math.Between(-20, 20);

            const wildPet = this.add.sprite(x, y, 'neopets', savedPet.spriteIndex);
            wildPet.setScale(savedPet.scale || 0.2);
            wildPet.setDepth(y);

            wildPet.setData('index', savedPet.spriteIndex);
            wildPet.setData('level', savedPet.level);
            wildPet.setData('species', savedPet.species);
            wildPet.setData('encountered', false);

            // Idle animation
            const animDuration = savedPet.animDuration || 800;
            this.tweens.add({
                targets: wildPet,
                y: y - 8,
                duration: animDuration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.wildPets.push(wildPet);
        });

        // Only spawn new pets if we have fewer than 4 (spawn 2-3 at a time)
        const currentCount = this.wildPets.length;
        const numToSpawn = currentCount < 4 ? Phaser.Math.Between(2, 3) : 0;

        for (let i = 0; i < numToSpawn; i++) {
            let x, y;
            let attempts = 0;

            // Find a valid spawn position on walkable areas (white pixels in mask)
            do {
                attempts++;

                // Try grass areas first for better distribution
                if (this.grassAreas.length > 0 && Math.random() < 0.7) {
                    // 70% chance to spawn in defined grass areas
                    const grassArea = this.grassAreas[Phaser.Math.Between(0, this.grassAreas.length - 1)];
                    x = Phaser.Math.Between(grassArea.x + 30, grassArea.x + grassArea.width - 30);
                    y = Phaser.Math.Between(grassArea.y + 30, grassArea.y + grassArea.height - 30);
                } else {
                    // 30% chance to spawn anywhere on walkable areas
                    x = Phaser.Math.Between(50, width - 50);
                    y = Phaser.Math.Between(50, height - 50);
                }

                // Check if position is walkable (not on black pixels)
                if (this.checkCollision(x, y, 40)) {
                    continue; // Skip this position if it's on a black pixel
                }

                // Check distance from player
                const tooCloseToPlayer = Phaser.Math.Distance.Between(x, y, this.playerPet.x, this.playerPet.y) < 150;

                // Check distance from other wild pets
                let tooCloseToOthers = false;
                for (let pet of this.wildPets) {
                    if (Phaser.Math.Distance.Between(x, y, pet.x, pet.y) < 120) {
                        tooCloseToOthers = true;
                        break;
                    }
                }

                if (!tooCloseToPlayer && !tooCloseToOthers) break;
            } while (attempts < 150);

            // Random pet from spritesheet
            const randomIndex = Phaser.Math.Between(0, 55);
            const wildPet = this.add.sprite(x, y, 'neopets', randomIndex);

            // Get species name from index
            const wildPetSpecies = NEOPET_SPECIES[randomIndex] || 'Unknown';

            // Assign random level based on player level
            const playerLevel = gameState.petStats.level;
            const levelVariance = Phaser.Math.Between(-2, 3);
            const wildPetLevel = Math.max(1, playerLevel + levelVariance);

            // Scale based on level - higher level = slightly larger
            const baseScale = 0.2; // Smaller to match tile scale
            const levelScaleBonus = Math.min(wildPetLevel * 0.003, 0.05); // Max +0.05 scale
            wildPet.setScale(baseScale + levelScaleBonus);
            wildPet.setDepth(y); // Y-sorting

            wildPet.setData('index', randomIndex);
            wildPet.setData('level', wildPetLevel);
            wildPet.setData('species', wildPetSpecies);
            wildPet.setData('encountered', false);

            // Idle animation - faster movement for higher level pets
            const baseDuration = 1000;
            const levelSpeedBonus = Math.max(wildPetLevel * 20, 0); // Higher level = faster
            const animDuration = Math.max(baseDuration - levelSpeedBonus, 400); // Min 400ms

            this.tweens.add({
                targets: wildPet,
                y: y - 8,
                duration: animDuration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.wildPets.push(wildPet);
        }

        // Save wild pets data to gameState
        this.saveWildPetsData();
    }

    saveWildPetsData() {
        const wildPetsData = this.wildPets.map(pet => ({
            x: pet.x,
            y: pet.y,
            spriteIndex: pet.getData('index'),
            level: pet.getData('level'),
            species: pet.getData('species'),
            scale: pet.scaleX,
            animDuration: 800
        }));
        gameState.updateWildPets(wildPetsData);
    }

    spawnSpecialItems() {
        // Clear existing special items
        this.specialItems.forEach(item => item.destroy());
        this.specialItems = [];

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Load saved special items
        const savedItems = gameState.getSpecialItems();

        // Restore existing items
        savedItems.forEach(savedItem => {
            this.createSpecialItem(savedItem);
        });

        // Only spawn new items if we have fewer than 2
        const numToSpawn = Math.max(0, 2 - this.specialItems.length);

        // Define possible item types (using brand colors)
        const itemTypes = [
            { type: 'potion', emoji: '💊', color: BrandColors.SECONDARY.FAERIELAND_PURPLE },
            { type: 'food', data: 'apple', emoji: '🍎', color: BrandColors.SECONDARY.BRIGHT_RED },
            { type: 'food', data: 'choc_donut', emoji: '🍩', color: BrandColors.SECONDARY.CHEERY_ORANGE },
            { type: 'food', data: 'pizza_slice', emoji: '🍕', color: BrandColors.PRIMARY.GOLDEN_YELLOW },
            { type: 'toy', data: 'bouncy_ball', emoji: '⚽', color: BrandColors.PRIMARY.NEOPIAN_BLUE },
            { type: 'toy', data: 'plushie', emoji: '🧸', color: BrandColors.PRIMARY.GRASSY_GREEN }
        ];

        for (let i = 0; i < numToSpawn; i++) {
            let x, y;
            let attempts = 0;

            // Find a valid spawn position
            do {
                attempts++;
                x = Phaser.Math.Between(100, width - 100);
                y = Phaser.Math.Between(100, height - 100);

                // Check if position is walkable
                if (this.checkCollision(x, y, 30)) {
                    continue;
                }

                // Check distance from player
                const tooCloseToPlayer = Phaser.Math.Distance.Between(x, y, this.playerPet.x, this.playerPet.y) < 150;

                // Check distance from other items
                let tooCloseToOthers = false;
                for (let item of this.specialItems) {
                    if (Phaser.Math.Distance.Between(x, y, item.x, item.y) < 150) {
                        tooCloseToOthers = true;
                        break;
                    }
                }

                if (!tooCloseToPlayer && !tooCloseToOthers) break;
            } while (attempts < 100);

            if (attempts >= 100) continue; // Skip if couldn't find valid position

            // Random item type
            const itemConfig = Phaser.Utils.Array.GetRandom(itemTypes);
            const itemId = `item_${Date.now()}_${i}`;

            const itemData = {
                id: itemId,
                x: x,
                y: y,
                type: itemConfig.type,
                data: itemConfig.data || null,
                emoji: itemConfig.emoji,
                color: itemConfig.color
            };

            this.createSpecialItem(itemData);
        }

        // Save items data
        this.saveSpecialItemsData();
    }

    createSpecialItem(itemData) {
        // Create item icon - use sprite for potion (species 55), emoji for others
        let itemIcon;
        if (itemData.type === 'potion') {
            // Use species 55 (Bottled Faerie) sprite for potion
            itemIcon = this.add.sprite(itemData.x, itemData.y, 'neopets', 55);
            itemIcon.setScale(0.15);
            itemIcon.setOrigin(0.5);
        } else {
            // Use emoji for other items
            itemIcon = this.add.text(itemData.x, itemData.y, itemData.emoji, {
                fontSize: '32px',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        itemIcon.setData('id', itemData.id);
        itemIcon.setData('type', itemData.type);
        itemIcon.setData('data', itemData.data);
        itemIcon.setDepth(50);

        // Bobbing animation
        this.tweens.add({
            targets: itemIcon,
            y: itemData.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.specialItems.push(itemIcon);
    }

    saveSpecialItemsData() {
        const itemsData = this.specialItems.map(item => {
            const itemType = item.getData('type');

            return {
                id: item.getData('id'),
                x: item.x,
                y: item.y,
                type: itemType,
                data: item.getData('data'),
                emoji: itemType === 'potion' ? '💊' : (item.text || ''),
                color: 0xFFFFFF // Color no longer used, but kept for compatibility
            };
        });
        gameState.updateSpecialItems(itemsData);
    }

    checkCollision(x, y, radius = 0) {
        // Convert game coordinates to mask coordinates
        // Game canvas: 1200x800, Mask: 1800x1200
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const scaleX = this.collisionCanvas.width / width;
        const scaleY = this.collisionCanvas.height / height;

        const maskX = Math.floor(x * scaleX);
        const maskY = Math.floor(y * scaleY);
        const maskRadius = Math.ceil(radius * Math.max(scaleX, scaleY));

        // Check multiple points around the radius for better collision detection
        const checkPoints = [];

        if (maskRadius === 0) {
            // Single point check
            checkPoints.push({ x: maskX, y: maskY });
        } else {
            // Check center and cardinal directions
            checkPoints.push({ x: maskX, y: maskY }); // Center
            checkPoints.push({ x: maskX + maskRadius, y: maskY }); // Right
            checkPoints.push({ x: maskX - maskRadius, y: maskY }); // Left
            checkPoints.push({ x: maskX, y: maskY + maskRadius }); // Down
            checkPoints.push({ x: maskX, y: maskY - maskRadius }); // Up
        }

        // Check each point
        for (let point of checkPoints) {
            if (this.isPixelBlack(point.x, point.y)) {
                return true; // Collision detected
            }
        }

        return false; // No collision
    }

    isPixelBlack(x, y) {
        // Boundary check
        if (x < 0 || x >= this.collisionCanvas.width || y < 0 || y >= this.collisionCanvas.height) {
            return true; // Treat out-of-bounds as collision
        }

        // Calculate pixel index in the image data array
        const index = (Math.floor(y) * this.collisionCanvas.width + Math.floor(x)) * 4;

        // Get RGB values (we check if the pixel is dark/black)
        const r = this.collisionImageData.data[index];
        const g = this.collisionImageData.data[index + 1];
        const b = this.collisionImageData.data[index + 2];

        // Check if pixel is black (or very dark - threshold of 50)
        // Black pixels = non-walkable areas
        return (r < 50 && g < 50 && b < 50);
    }

    update() {
        if (!this.playerPet || !this.cameras.main) return;

        const speed = 3;
        let moving = false;
        let newX = this.playerPet.x;
        let newY = this.playerPet.y;

        // Check input
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            newX -= speed;
            moving = true;
            if (this.showDebugCollision) console.log('LEFT pressed');
        }
        if (this.cursors.right.isDown || this.wasd.right.isDown) {
            newX += speed;
            moving = true;
            if (this.showDebugCollision) console.log('RIGHT pressed');
        }
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            newY -= speed;
            moving = true;
            if (this.showDebugCollision) console.log('UP pressed');
        }
        if (this.cursors.down.isDown || this.wasd.down.isDown) {
            newY += speed;
            moving = true;
            if (this.showDebugCollision) console.log('DOWN pressed');
        }

        // Keep within map bounds (small margin for sprite size)
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        newX = Phaser.Math.Clamp(newX, 20, width - 20);
        newY = Phaser.Math.Clamp(newY, 20, height - 20);

        // Check collision with non-walkable areas before moving
        // Reduced radius to 20 for better movement (was 30)
        const canMove = !this.checkCollision(newX, newY, 20);

        // Debug logging
        if (this.showDebugCollision && moving) {
            console.log(`Trying to move to (${newX.toFixed(1)}, ${newY.toFixed(1)}) - canMove: ${canMove}`);
        }

        // Debug visualization
        if (this.showDebugCollision) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(2, canMove ? 0x00ff00 : 0xff0000, 1);
            this.debugGraphics.strokeCircle(this.playerPet.x, this.playerPet.y, 20);

            // Draw check points
            const scaleX = this.collisionCanvas.width / width;
            const scaleY = this.collisionCanvas.height / height;
            const maskRadius = Math.ceil(20 * Math.max(scaleX, scaleY));

            const checkPoints = [
                { x: this.playerPet.x, y: this.playerPet.y, label: 'C' },
                { x: this.playerPet.x + 20, y: this.playerPet.y, label: 'R' },
                { x: this.playerPet.x - 20, y: this.playerPet.y, label: 'L' },
                { x: this.playerPet.x, y: this.playerPet.y + 20, label: 'D' },
                { x: this.playerPet.x, y: this.playerPet.y - 20, label: 'U' }
            ];

            for (let point of checkPoints) {
                const maskX = Math.floor(point.x * scaleX);
                const maskY = Math.floor(point.y * scaleY);
                const isBlack = this.isPixelBlack(maskX, maskY);

                this.debugGraphics.fillStyle(isBlack ? 0xff0000 : 0x00ff00, 0.7);
                this.debugGraphics.fillCircle(point.x, point.y, 5);
            }
        }

        // Update position if no collision
        if (canMove && moving) {
            // Pause idle animation during movement
            if (this.idleTween && this.idleTween.isPlaying()) {
                this.idleTween.pause();
            }

            this.playerPet.x = newX;
            this.playerPet.y = newY;
            this.playerPet.setDepth(this.playerPet.y); // Update depth for y-sorting

            // Save position periodically (throttled to avoid excessive saves)
            if (!this.lastPositionSave || Date.now() - this.lastPositionSave > 500) {
                gameState.updatePlayerPosition(newX, newY);
                this.lastPositionSave = Date.now();
            }
        } else if (moving) {
            // Pause idle animation during movement
            if (this.idleTween && this.idleTween.isPlaying()) {
                this.idleTween.pause();
            }

            // Try moving in just X or Y direction if diagonal fails
            const canMoveX = !this.checkCollision(newX, this.playerPet.y, 20);
            const canMoveY = !this.checkCollision(this.playerPet.x, newY, 20);

            if (canMoveX) {
                this.playerPet.x = newX;
                this.playerPet.setDepth(this.playerPet.y);
            }
            if (canMoveY) {
                this.playerPet.y = newY;
                this.playerPet.setDepth(this.playerPet.y);
            }

            // Save position periodically (throttled to avoid excessive saves)
            if ((canMoveX || canMoveY) && (!this.lastPositionSave || Date.now() - this.lastPositionSave > 500)) {
                gameState.updatePlayerPosition(this.playerPet.x, this.playerPet.y);
                this.lastPositionSave = Date.now();
            }
        } else {
            // Restart idle animation at current position when stopped
            if (this.idleTween && this.idleTween.isPaused()) {
                // Stop the old tween and create a new one at current position
                this.idleTween.stop();
                this.idleTween = this.tweens.add({
                    targets: this.playerPet,
                    y: this.playerPet.y - 5,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    paused: false
                });
            }
        }

        // Check for wild pet encounters
        for (let wildPet of this.wildPets) {
            if (wildPet.getData('encountered')) continue;

            const distance = Phaser.Math.Distance.Between(
                this.playerPet.x, this.playerPet.y,
                wildPet.x, wildPet.y
            );

            if (distance < 50) {
                this.encounterWildPet(wildPet);
                break;
            }
        }

        // Check for special item pickups
        for (let item of this.specialItems) {
            const distance = Phaser.Math.Distance.Between(
                this.playerPet.x, this.playerPet.y,
                item.x, item.y
            );

            if (distance < 40) {
                this.pickupItem(item);
                break;
            }
        }

        // Reduce hunger and energy over time
        gameState.updateStats();
    }

    pickupItem(item) {
        const itemId = item.getData('id');
        const itemType = item.getData('type');
        const itemData = item.getData('data');

        // Add item to inventory
        gameState.pickupSpecialItem(itemId, itemType, itemData);

        // Remove from scene
        const itemIndex = this.specialItems.indexOf(item);
        if (itemIndex > -1) {
            this.specialItems.splice(itemIndex, 1);
        }
        item.destroy();

        // Show pickup message
        let itemName = '';
        if (itemType === 'potion') {
            itemName = 'Potion';
        } else if (itemType === 'food') {
            const foodItem = getItem('food', itemData);
            itemName = foodItem ? foodItem.name : 'Food';
        } else if (itemType === 'toy') {
            const toyItem = getItem('toys', itemData);
            itemName = toyItem ? toyItem.name : 'Toy';
        }

        const pickupText = this.add.text(this.playerPet.x, this.playerPet.y - 50, `+${itemName}!`, {
            fontSize: '18px',
            fontFamily: "'Verdana', 'Tahoma', sans-serif",
            color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX,
            backgroundColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
            padding: { x: 12, y: 6 },
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Fade out pickup text
        this.tweens.add({
            targets: pickupText,
            alpha: 0,
            y: pickupText.y - 30,
            duration: 1500,
            onComplete: () => pickupText.destroy()
        });

        // Update UI
        this.updateExternalUI();

        // Spawn a new item if we now have less than 2
        if (this.specialItems.length < 2) {
            this.time.delayedCall(2000, () => {
                this.spawnSpecialItems();
            });
        }
    }

    encounterWildPet(wildPet) {
        wildPet.setData('encountered', true);

        // Check if pet can battle
        if (!gameState.canBattle()) {
            const warningText = this.add.text(wildPet.x, wildPet.y - 100, 'Too tired to encounter pets!', {
                fontSize: '18px',
                fontFamily: "'Verdana', 'Tahoma', sans-serif",
                color: BrandColors.UTILITY.PURE_WHITE_HEX,
                backgroundColor: BrandColors.SECONDARY.BRIGHT_RED_HEX,
                padding: { x: 12, y: 6 },
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Fade out warning
            this.tweens.add({
                targets: warningText,
                alpha: 0,
                duration: 1500,
                delay: 500,
                onComplete: () => warningText.destroy()
            });

            // Reset encountered flag after showing message
            this.time.delayedCall(2000, () => {
                wildPet.setData('encountered', false);
            });
            return;
        }

        // Initialize encounter manager
        if (!this.encounterManager) {
            this.encounterManager = new EncounterManager(gameState);
        }

        // Determine mood for this encounter
        const wildPetSpecies = wildPet.getData('species');
        const wildPetLevel = wildPet.getData('level');
        const playerPartyHappiness = gameState.petStats.happiness;

        const moodData = this.encounterManager.determineMood(wildPetSpecies, wildPetLevel, playerPartyHappiness);

        // Remove the pet from the world and save
        const petIndex = this.wildPets.indexOf(wildPet);
        if (petIndex > -1) {
            this.wildPets.splice(petIndex, 1);
        }
        gameState.removeWildPet(wildPet.getData('index'));

        // Route to appropriate scene based on mood
        if (moodData.mood === 'grumpy' || moodData.mood === 'sick') {
            // Battle required first (calm or cure mode)
            const battleMode = moodData.mood === 'grumpy' ? 'calm' : 'cure';
            this.scene.start('BattleScene', {
                wildPetIndex: wildPet.getData('index'),
                wildPetSprite: wildPet,
                wildPetLevel: wildPetLevel,
                wildPetSpecies: wildPetSpecies,
                battleMode: battleMode,
                moodData: moodData,
                location: 'Neopia Central'
            });
        } else {
            // Direct to befriend scene (friendly or neutral)
            this.scene.start('BefriendScene', {
                wildPetSpecies: wildPetSpecies,
                wildPetIndex: wildPet.getData('index'),
                wildPetLevel: wildPetLevel,
                moodData: moodData,
                location: 'Neopia Central'
            });
        }
    }

    updateExternalUI() {
        const s = gameState.petStats;
        const inv = gameState.inventory;

        const statsPanel = document.getElementById('stats-panel');
        if (statsPanel) {
            // Keep the title, update the rest
            const titleBar = statsPanel.querySelector('div:first-child');
            const existingTitle = titleBar ? titleBar.outerHTML : '';

            statsPanel.innerHTML = existingTitle + `
                <div style="color: ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};">
                    <strong>${gameState.player.name}</strong> (${gameState.player.species})
                </div>
                <div><strong>Lv ${s.level}</strong> | Exp: ${s.exp}/${s.expToLevel}</div>
                <div style="margin-top: 4px;">HP: ${Math.ceil(s.hp)}/${s.maxHp}</div>
                <div>ATK: ${Math.floor(s.attack)} | DEF: ${Math.floor(s.defense)}</div>
                <div style="margin-top: 6px;">Hunger: ${Math.ceil(s.hunger)}/100</div>
                <div>Happy: ${Math.ceil(s.happiness)}/100</div>
                <div>Energy: ${Math.ceil(s.energy)}/100</div>
                <div style="margin-top: 6px; font-size: 12px; color: ${BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX};">
                    Special: ${gameState.canUseSpecialMove() ? '✨ Ready!' : `⏳ ${3 - gameState.battlesSinceSpecial} more`}
                </div>
            `;
        }

        // Update inventory section
        const invContent = document.getElementById('inventory-content');
        if (invContent) {
            // Count total items
            const totalFood = gameState.getTotalFoodCount();
            const totalToys = Object.values(inv.toys || {}).reduce((sum, count) => sum + count, 0);
            const totalGrooming = Object.values(inv.grooming || {}).reduce((sum, count) => sum + count, 0);

            invContent.innerHTML = `
                <div>🍎 Food: <strong>${totalFood}</strong></div>
                <div>🎾 Toys: <strong>${totalToys}</strong></div>
                <div>💊 Potions: <strong>${inv.potions}</strong></div>
                <div>✨ Grooming: <strong>${totalGrooming}</strong></div>
            `;
        }

        const buttonsPanel = document.getElementById('buttons-panel');
        if (buttonsPanel && buttonsPanel.children.length === 0) {
            // Care button with brand styling
            const careButton = document.createElement('button');
            careButton.textContent = 'Care Menu (C)';
            careButton.style.cssText = `
                background: ${BrandColors.PRIMARY.GRASSY_GREEN_HEX};
                color: ${BrandColors.UTILITY.PURE_WHITE_HEX};
                border: 2px solid ${BrandColors.UTILITY.DARK_BLUE_HEX};
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 15px;
                cursor: pointer;
                font-family: 'Verdana', 'Tahoma', sans-serif;
                box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            `;
            careButton.onmouseover = () => {
                careButton.style.background = '#7BCB6A'; // Brightened green
                careButton.style.transform = 'scale(1.05)';
            };
            careButton.onmouseout = () => {
                careButton.style.background = BrandColors.PRIMARY.GRASSY_GREEN_HEX;
                careButton.style.transform = 'scale(1)';
            };
            careButton.onclick = () => {
                this.scene.pause();
                this.scene.launch('CareScene');
            };
            buttonsPanel.appendChild(careButton);

            // Gallery button with brand styling
            const galleryButton = document.createElement('button');
            galleryButton.textContent = 'Gallery (G)';
            galleryButton.style.cssText = `
                background: ${BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX};
                color: ${BrandColors.UTILITY.PURE_WHITE_HEX};
                border: 2px solid ${BrandColors.UTILITY.DARK_BLUE_HEX};
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 15px;
                cursor: pointer;
                font-family: 'Verdana', 'Tahoma', sans-serif;
                box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            `;
            galleryButton.onmouseover = () => {
                galleryButton.style.background = '#B06FE4'; // Brightened purple
                galleryButton.style.transform = 'scale(1.05)';
            };
            galleryButton.onmouseout = () => {
                galleryButton.style.background = BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX;
                galleryButton.style.transform = 'scale(1)';
            };
            galleryButton.onclick = () => {
                this.scene.pause();
                this.scene.launch('GalleryScene');
            };
            buttonsPanel.appendChild(galleryButton);

            // New Game button with brand styling
            const newGameButton = document.createElement('button');
            newGameButton.textContent = 'New Game (N)';
            newGameButton.style.cssText = `
                background: ${BrandColors.SECONDARY.BRIGHT_RED_HEX};
                color: ${BrandColors.UTILITY.PURE_WHITE_HEX};
                border: 2px solid ${BrandColors.UTILITY.DARK_BLUE_HEX};
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 15px;
                cursor: pointer;
                font-family: 'Verdana', 'Tahoma', sans-serif;
                box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            `;
            newGameButton.onmouseover = () => {
                newGameButton.style.background = '#FF5555'; // Brightened red
                newGameButton.style.transform = 'scale(1.05)';
            };
            newGameButton.onmouseout = () => {
                newGameButton.style.background = BrandColors.SECONDARY.BRIGHT_RED_HEX;
                newGameButton.style.transform = 'scale(1)';
            };
            newGameButton.onclick = () => {
                if (confirm('Are you sure you want to start a new game? All progress will be lost!')) {
                    // Clear all saved data
                    localStorage.removeItem('neopetmonSave');
                    localStorage.removeItem('neopetGallery');
                    // Reload the page to restart
                    window.location.reload();
                }
            };
            buttonsPanel.appendChild(newGameButton);
        }
    }

    updateTitleOverlay() {
        let titleOverlay = document.getElementById('title-overlay');
        if (!titleOverlay) {
            titleOverlay = document.createElement('div');
            titleOverlay.id = 'title-overlay';
            titleOverlay.style.cssText = `
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 36px;
                font-weight: bold;
                color: ${BrandColors.PRIMARY.GOLDEN_YELLOW_HEX};
                text-shadow:
                    -3px -3px 0 ${BrandColors.UTILITY.DARK_BLUE_HEX},
                    3px -3px 0 ${BrandColors.UTILITY.DARK_BLUE_HEX},
                    -3px 3px 0 ${BrandColors.UTILITY.DARK_BLUE_HEX},
                    3px 3px 0 ${BrandColors.UTILITY.DARK_BLUE_HEX},
                    3px 3px 6px rgba(0,0,0,0.3);
                z-index: 5;
                font-family: 'Fredoka One', 'Bangers', sans-serif;
            `;
            document.getElementById('game-container').appendChild(titleOverlay);
        }
        titleOverlay.textContent = 'Neopia';
    }
}
