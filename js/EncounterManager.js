// EncounterManager.js
// Manages encounter moods, determines befriend vs battle flow

class EncounterManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    // Determine mood for a wild pet encounter
    determineMood(wildPetSpecies, wildPetLevel, playerPartyHappiness) {
        // Base probabilities
        let friendlyChance = 0.60;
        let neutralChance = 0.25;
        let grumpyChance = 0.10;
        let sickChance = 0.05;

        // Modify based on player's party happiness average
        const happinessMod = (playerPartyHappiness - 50) / 100; // -0.5 to +0.5
        friendlyChance += happinessMod * 0.15;
        grumpyChance -= happinessMod * 0.08;

        // Normalize probabilities
        const total = friendlyChance + neutralChance + grumpyChance + sickChance;
        friendlyChance /= total;
        neutralChance /= total;
        grumpyChance /= total;
        sickChance /= total;

        // Roll for mood
        const roll = Math.random();
        if (roll < friendlyChance) {
            return { mood: 'friendly', icon: '💚', color: '#5FBB4E', description: 'Friendly' };
        } else if (roll < friendlyChance + neutralChance) {
            return { mood: 'neutral', icon: '⭐', color: '#FFCC00', description: 'Curious' };
        } else if (roll < friendlyChance + neutralChance + grumpyChance) {
            return { mood: 'grumpy', icon: '💢', color: '#E63939', description: 'Grumpy' };
        } else {
            return { mood: 'sick', icon: '💜', color: '#964ED4', description: 'Sick' };
        }
    }

    // Determine initial trust based on mood
    getInitialTrust(mood) {
        switch(mood) {
            case 'friendly':
                return 40 + Math.floor(Math.random() * 20); // 40-60
            case 'neutral':
                return 20 + Math.floor(Math.random() * 10); // 20-30
            case 'grumpy':
                return 30; // After calming
            case 'sick':
                return 30; // After curing
            default:
                return 25;
        }
    }

    // Calculate trust gain from offering an item
    calculateTrustGain(wildPetSpecies, itemId, itemCategory, gallery) {
        // Check if we know this species' preferences from gallery
        const galleryEntry = gallery.getEntry(wildPetSpecies);
        const knownFavorite = galleryEntry?.preferences?.favoriteFood;
        const knownToy = galleryEntry?.preferences?.lovedToy;

        // Check actual species preference
        const reaction = checkIfItemLiked(wildPetSpecies, itemId);

        let trustGain = 0;
        let reactionText = '';
        let reactionType = 'neutral';

        if (reaction === 'loved') {
            // Perfect match
            if (knownFavorite === itemId || knownToy === itemId) {
                trustGain = 30 + Math.floor(Math.random() * 5); // 30-35 (known preference)
                reactionText = 'It LOVES it! ❤️';
            } else {
                trustGain = 20 + Math.floor(Math.random() * 5); // 20-25 (discovered preference)
                reactionText = 'It absolutely loves it! ❤️';
            }
            reactionType = 'loved';
        } else if (reaction === 'disliked') {
            trustGain = Math.random() < 0.5 ? 5 : -5;
            reactionText = 'It doesn\'t seem to like that...';
            reactionType = 'disliked';
        } else {
            // Neutral reaction - check category match
            const item = getItem(itemCategory, itemId);
            if (item) {
                trustGain = 10 + Math.floor(Math.random() * 5); // 10-15
                reactionText = 'It appreciates the gesture.';
                reactionType = 'liked';
            } else {
                trustGain = 2;
                reactionText = 'It looks at you curiously.';
                reactionType = 'neutral';
            }
        }

        return { trustGain, reactionText, reactionType };
    }

    // Calculate trust gain from using a party pet
    calculatePartyPetBonus(partyPetHappiness, partyPetSpecies, wildPetSpecies) {
        let bonus = 0;
        let message = '';

        if (partyPetHappiness >= 80) {
            bonus = 20;
            message = 'Your happy pet makes a great impression!';
        } else if (partyPetHappiness >= 60) {
            bonus = 15;
            message = 'Your pet seems friendly.';
        } else if (partyPetHappiness >= 40) {
            bonus = 10;
            message = 'Your pet approaches cautiously.';
        } else {
            bonus = 5;
            message = 'Your pet seems a bit nervous...';
        }

        // Species matching bonus
        if (partyPetSpecies === wildPetSpecies) {
            bonus += 10;
            message += ' They seem to relate!';
        }

        return { bonus, message };
    }

    // Calculate trust gain from Talk/Play interactions
    calculateInteractionTrust() {
        return 8 + Math.floor(Math.random() * 7); // 8-15
    }

    // Determine if befriend attempt succeeds
    checkBefriendSuccess(trustLevel) {
        return trustLevel >= 80;
    }

    // Determine flee threshold (pet gets bored)
    shouldPetFlee(turnCount, trustLevel) {
        if (turnCount >= 6) return true;
        if (turnCount >= 4 && trustLevel < 20) return true;
        return false;
    }
}

// Make available globally
window.EncounterManager = EncounterManager;
