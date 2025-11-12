# Neopetmon - Virtual Pet Battle Game

A Phaser-based game inspired by Pokemon and Neopets, where you can choose a pet, care for it, and battle other creatures!

## Features

- **Pet Selection**: Choose from 56 unique Neopet sprites and give your pet a name
- **Pet Care System**: Keep your pet happy, fed, and rested
  - Hunger: Feed your pet to maintain hunger levels
  - Happiness: Keep your pet happy through care and successful battles
  - Energy: Let your pet rest to restore energy
- **Battle System**: Turn-based combat similar to Pokemon
  - Attack wild pets
  - Use potions to heal
  - Gain experience and level up
  - Earn rewards (food and potions) from victories
- **Progression**: Level up your pet to increase stats (HP, Attack, Defense)
- **Movement**: Explore the world with arrow keys or WASD
- **Persistence**: Your game progress is automatically saved to browser localStorage

## How to Play

1. **Start the game**: Run `npm start` and open http://localhost:8080 in your browser

2. **Select your pet**: Click on any Neopet sprite, enter a name, and start your adventure

3. **Movement**: Use arrow keys or WASD to move around the world

4. **Battle**: Walk into wild pets to start a battle
   - Click "ATTACK" to deal damage
   - Click "POTION" to heal (uses inventory)
   - Click "RUN" to escape the battle

5. **Pet Care**: Press 'C' or click "Care Menu" to access the care center
   - Feed your pet when hungry
   - Let your pet rest when tired
   - Use potions to restore HP
   - Keep stats high to battle effectively!

6. **Win battles** to gain experience, level up, and earn rewards

## Game Mechanics

- Your pet needs to be happy, fed, and energized to battle effectively
- Stats decrease over time, requiring regular care
- Winning battles earns EXP, food, and potions
- Losing battles decreases happiness and energy
- Level up to increase HP, Attack, and Defense
- Each battle consumes energy and hunger

## Controls

- **Arrow Keys / WASD**: Move your pet
- **C**: Open Care Menu
- **Mouse**: Click buttons and interact with UI
- **ESC**: Close Care Menu

## Requirements

- Node.js and npm
- Modern web browser with localStorage support

## Installation

```bash
npm install
npm start
```

Then open http://localhost:8080 in your browser.

## File Structure

```
neopetmon/
├── index.html              # Main HTML entry point
├── neopets.png            # Sprite sheet (56 pets)
├── package.json           # Dependencies
└── js/
    ├── main.js            # Phaser config
    ├── GameState.js       # Global state management
    └── scenes/
        ├── BootScene.js      # Loading screen
        ├── SelectionScene.js # Pet selection
        ├── WorldScene.js     # Main game world
        ├── BattleScene.js    # Turn-based combat
        └── CareScene.js      # Pet care menu
```

## Technologies Used

- **Phaser 3**: HTML5 game framework
- **JavaScript**: Game logic
- **LocalStorage**: Save game persistence

Enjoy playing Neopetmon! 🎮
