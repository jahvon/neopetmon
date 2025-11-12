class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Whimsical loading screen - Brand Guide compliant
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

        // Animated sparkle stars (using Golden Yellow for stars)
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                '⭐',
                {
                    fontSize: '20px',
                    color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX
                }
            );
            this.tweens.add({
                targets: star,
                alpha: 0.4,
                duration: Phaser.Math.Between(800, 1500),
                yoyo: true,
                repeat: -1
            });
        }

        // Title with brand font (Fredoka One) and Dark Blue outline
        const title = this.add.text(width / 2, height / 2 - 100, 'Neopet Adventures', {
            fontSize: '64px',
            fontFamily: "'Fredoka One', 'Bangers', sans-serif",
            color: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX,
            stroke: BrandColors.UTILITY.DARK_BLUE_HEX,
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add drop shadow effect
        title.setShadow(3, 3, 'rgba(0, 0, 0, 0.3)', 2);

        this.tweens.add({
            targets: title,
            y: height / 2 - 110,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Progress box with Neopian Blue border
        const progressBox = this.add.graphics();
        progressBox.fillStyle(BrandColors.UTILITY.PURE_WHITE, 0.95);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 15);
        progressBox.lineStyle(3, BrandColors.PRIMARY.NEOPIAN_BLUE, 1);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 15);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading your magical adventure!',
            style: {
                fontFamily: "'Verdana', 'Tahoma', sans-serif",
                fontSize: '16px',
                color: BrandColors.UTILITY.DARK_BLUE_HEX,
                fontStyle: 'bold'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const progressBar = this.add.graphics();

        this.load.on('progress', (value) => {
            progressBar.clear();
            // Green to blue gradient for progress (Grassy Green to Neopian Blue)
            progressBar.fillGradientStyle(
                BrandColors.PRIMARY.GRASSY_GREEN,
                BrandColors.PRIMARY.NEOPIAN_BLUE,
                BrandColors.PRIMARY.GRASSY_GREEN,
                BrandColors.PRIMARY.NEOPIAN_BLUE,
                1
            );
            progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 10);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load the spritesheet - image is 2304x2016, 8 columns x 7 rows = 288x288 per sprite
        this.load.spritesheet('neopets', 'neopets.png', {
            frameWidth: 288,
            frameHeight: 288
        });

        // Load the static world map
        this.load.image('worldMap', 'map.png');

        // Load the collision mask (black = non-walkable, white = walkable)
        this.load.image('collisionMask', 'map-mask.png');
    }

    create() {
        // Check if player already exists
        if (gameState.player) {
            this.scene.start('WorldScene');
        } else {
            this.scene.start('SelectionScene');
        }
    }
}
