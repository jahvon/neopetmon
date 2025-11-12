// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 720, // Slightly reduced to fit with footer
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scene: [
        BootScene,
        SelectionScene,
        WorldScene,
        BattleScene,
        BefriendScene,
        CareScene,
        GalleryScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Create UI overlay outside Phaser canvas
function createUIOverlay() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('Game container not found!');
        return;
    }

    // Create footer bar below game canvas
    const footer = document.createElement('div');
    footer.id = 'game-footer';
    footer.style.cssText = `
        width: 1200px;
        background: ${BrandColors.UTILITY.PURE_WHITE_HEX};
        border: ${BrandWindows.FRAME.borderWidth}px solid ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        border-top: none;
        border-radius: 0 0 ${BrandWindows.FRAME.borderRadius}px ${BrandWindows.FRAME.borderRadius}px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        display: none;
        flex-direction: row;
        gap: 20px;
        padding: 15px 20px;
        font-family: ${BrandFonts.BODY.family}, ${BrandFonts.BODY.fallback}, sans-serif;
        font-size: ${BrandFonts.BODY.size}px;
        box-sizing: border-box;
    `;

    // Pet Stats Section
    const statsSection = document.createElement('div');
    statsSection.id = 'stats-panel';
    statsSection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: ${BrandColors.UTILITY.DARK_BLUE_HEX};
        font-weight: bold;
        font-size: 13px;
        min-width: 280px;
    `;

    const statsTitle = document.createElement('div');
    statsTitle.style.cssText = `
        color: ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        font-size: 16px;
        margin-bottom: 5px;
        font-family: 'Fredoka One', sans-serif;
    `;
    statsTitle.textContent = '⭐ Your Pet';
    statsSection.appendChild(statsTitle);

    // Inventory Section
    const inventorySection = document.createElement('div');
    inventorySection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: ${BrandColors.UTILITY.DARK_BLUE_HEX};
        font-weight: bold;
        font-size: 13px;
        border-left: 2px solid ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        padding-left: 20px;
        min-width: 200px;
    `;

    const invTitle = document.createElement('div');
    invTitle.style.cssText = `
        color: ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        font-size: 16px;
        margin-bottom: 5px;
        font-family: 'Fredoka One', sans-serif;
    `;
    invTitle.textContent = '🎒 Inventory';
    inventorySection.appendChild(invTitle);

    const invContent = document.createElement('div');
    invContent.id = 'inventory-content';
    invContent.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        font-size: 12px;
    `;
    inventorySection.appendChild(invContent);

    // Actions Section
    const actionsSection = document.createElement('div');
    actionsSection.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        justify-content: center;
        border-left: 2px solid ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        padding-left: 20px;
    `;

    const actionsTitle = document.createElement('div');
    actionsTitle.style.cssText = `
        color: ${BrandColors.PRIMARY.NEOPIAN_BLUE_HEX};
        font-size: 16px;
        font-family: 'Fredoka One', sans-serif;
        text-align: center;
        margin-bottom: 5px;
    `;
    actionsTitle.textContent = '⚡ Actions';
    actionsSection.appendChild(actionsTitle);

    const buttonsPanel = document.createElement('div');
    buttonsPanel.id = 'buttons-panel';
    buttonsPanel.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    actionsSection.appendChild(buttonsPanel);

    // Controls hint
    const controlsHint = document.createElement('div');
    controlsHint.style.cssText = `
        font-size: 11px;
        color: ${BrandColors.UTILITY.DARK_BLUE_HEX};
        text-align: center;
        opacity: 0.8;
    `;
    controlsHint.innerHTML = 'Arrow Keys/WASD: Move';
    actionsSection.appendChild(controlsHint);

    // Assemble footer
    footer.appendChild(statsSection);
    footer.appendChild(inventorySection);
    footer.appendChild(actionsSection);

    // Insert footer after game container
    gameContainer.parentElement.insertBefore(footer, gameContainer.nextSibling);
}

// Initialize UI when page loads
window.addEventListener('load', createUIOverlay);
