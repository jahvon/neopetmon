/**
 * Brand Color Palette
 * Based on BRAND.md specifications
 * All colors maintain the whimsical, cheerful Neopets aesthetic
 */

const BrandColors = {
    // PRIMARY COLORS
    PRIMARY: {
        NEOPIAN_BLUE: 0x3E77E4,      // Main UI, nav bars, window frames, buttons, logos
        NEOPIAN_BLUE_HEX: '#3E77E4',

        GOLDEN_YELLOW: 0xFFCC00,      // Currency (Neopoints), stars, highlights, special items
        GOLDEN_YELLOW_HEX: '#FFCC00',

        GRASSY_GREEN: 0x5FBB4E,       // Nature backgrounds, success messages, positive UI
        GRASSY_GREEN_HEX: '#5FBB4E'
    },

    // SECONDARY COLORS
    SECONDARY: {
        BRIGHT_RED: 0xE63939,         // Close buttons, errors, health bars, warnings
        BRIGHT_RED_HEX: '#E63939',

        FAERIELAND_PURPLE: 0x964ED4,  // Magic, special effects, secondary UI theme
        FAERIELAND_PURPLE_HEX: '#964ED4',

        CHEERY_ORANGE: 0xFF9900,      // Secondary buttons, alerts, warm accents
        CHEERY_ORANGE_HEX: '#FF9900'
    },

    // UTILITY COLORS
    UTILITY: {
        DARK_BLUE: 0x003366,          // Critical for outlines, primary text
        DARK_BLUE_HEX: '#003366',

        SIMPLE_BLACK: 0x000000,        // Secondary choice for body text and details
        SIMPLE_BLACK_HEX: '#000000',

        PURE_WHITE: 0xFFFFFF,          // Default background for all content windows
        PURE_WHITE_HEX: '#FFFFFF',

        SKY_BLUE: 0xCDE8F6,           // Simple background sky gradients (fades to white)
        SKY_BLUE_HEX: '#CDE8F6'
    },

    // GRADIENTS (for Phaser scenes)
    GRADIENTS: {
        SKY: {
            top: 0xCDE8F6,
            bottom: 0xFFFFFF
        }
    },

    // HELPER FUNCTIONS
    toRGBA: function(hex, alpha = 1) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    toRGB: function(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgb(${r}, ${g}, ${b})`;
    }
};

/**
 * Brand Typography
 * Font specifications from BRAND.md
 */
const BrandFonts = {
    // LOGO & HEADLINES
    TITLE: {
        family: 'Fredoka One',        // Bold, rounded, cartoonish font
        fallback: 'Bangers',          // Alternative title font
        outlineColor: '#003366',      // Dark Blue outline (2-4px thick)
        outlineWidth: 3,              // Recommended outline thickness
        shadowOffsetX: 3,             // Drop shadow offset (bottom-right)
        shadowOffsetY: 3,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
    },

    // UI & BODY TEXT
    BODY: {
        family: 'Verdana',            // Classic Neopets font
        fallback: 'Tahoma',           // Fallback font
        size: 14,                     // Standard size (12-14pt)
        color: '#000000'              // Simple Black for body text
    },

    // HELPER FUNCTIONS
    getTitleStyle: function(fontSize = 48) {
        return {
            fontFamily: `'${this.TITLE.family}', '${this.TITLE.fallback}', sans-serif`,
            fontSize: `${fontSize}px`,
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            stroke: this.TITLE.outlineColor,
            strokeThickness: this.TITLE.outlineWidth,
            shadow: {
                offsetX: this.TITLE.shadowOffsetX,
                offsetY: this.TITLE.shadowOffsetY,
                color: this.TITLE.shadowColor,
                blur: 2,
                fill: true
            }
        };
    },

    getBodyStyle: function(fontSize = 14, color = null) {
        return {
            fontFamily: `'${this.BODY.family}', '${this.BODY.fallback}', sans-serif`,
            fontSize: `${fontSize}px`,
            color: color || this.BODY.color
        };
    },

    // For Phaser text objects
    getPhaserTitleStyle: function(fontSize = 48) {
        return {
            fontFamily: `'${this.TITLE.family}', '${this.TITLE.fallback}', sans-serif`,
            fontSize: fontSize,
            color: BrandColors.UTILITY.DARK_BLUE_HEX,
            stroke: this.TITLE.outlineColor,
            strokeThickness: this.TITLE.outlineWidth
        };
    },

    getPhaserBodyStyle: function(fontSize = 14, color = null) {
        return {
            fontFamily: `'${this.BODY.family}', '${this.BODY.fallback}', sans-serif`,
            fontSize: fontSize,
            color: color || this.BODY.color
        };
    }
};

/**
 * Button Style Specifications
 * Based on BRAND.md requirements for "aqua" or "gel" button effect
 */
const BrandButtons = {
    // Primary button style (Neopian Blue)
    PRIMARY: {
        baseColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
        hoverColor: '#5A8FEA',        // Brightened blue for hover
        textColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.UTILITY.DARK_BLUE_HEX,
        borderWidth: 2,
        borderRadius: 15,             // Highly rounded
        padding: '10px 20px'
    },

    // Success button style (Grassy Green)
    SUCCESS: {
        baseColor: BrandColors.PRIMARY.GRASSY_GREEN_HEX,
        hoverColor: '#7BCB6A',
        textColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.UTILITY.DARK_BLUE_HEX,
        borderWidth: 2,
        borderRadius: 15,
        padding: '10px 20px'
    },

    // Danger button style (Bright Red)
    DANGER: {
        baseColor: BrandColors.SECONDARY.BRIGHT_RED_HEX,
        hoverColor: '#F04F4F',
        textColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.UTILITY.DARK_BLUE_HEX,
        borderWidth: 2,
        borderRadius: 15,
        padding: '10px 20px'
    },

    // Special button style (Faerieland Purple)
    SPECIAL: {
        baseColor: BrandColors.SECONDARY.FAERIELAND_PURPLE_HEX,
        hoverColor: '#AB6FE8',
        textColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.UTILITY.DARK_BLUE_HEX,
        borderWidth: 2,
        borderRadius: 15,
        padding: '10px 20px'
    },

    // Warning button style (Cheery Orange)
    WARNING: {
        baseColor: BrandColors.SECONDARY.CHEERY_ORANGE_HEX,
        hoverColor: '#FFB033',
        textColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.UTILITY.DARK_BLUE_HEX,
        borderWidth: 2,
        borderRadius: 15,
        padding: '10px 20px'
    },

    // Helper to get CSS style string
    getCSSStyle: function(type = 'PRIMARY') {
        const style = this[type];
        return `
            background: ${style.baseColor};
            color: ${style.textColor};
            border: ${style.borderWidth}px solid ${style.borderColor};
            border-radius: ${style.borderRadius}px;
            padding: ${style.padding};
            font-family: 'Verdana', 'Tahoma', sans-serif;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
    }
};

/**
 * Window/Panel Specifications
 * Based on BRAND.md requirements
 */
const BrandWindows = {
    FRAME: {
        backgroundColor: BrandColors.UTILITY.PURE_WHITE_HEX,
        borderColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
        borderWidth: 3,
        borderRadius: 12,

        // Title bar styling
        titleBarColor: BrandColors.PRIMARY.NEOPIAN_BLUE_HEX,
        titleTextColor: BrandColors.PRIMARY.GOLDEN_YELLOW_HEX,
        titleFontFamily: 'Verdana, Tahoma, sans-serif',
        titleFontSize: 16,
        titleFontWeight: 'bold'
    }
};
