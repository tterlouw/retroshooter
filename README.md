# RetroShooter

A retro-style vertical scrolling shooter game inspired by River Raid from the 1980s, built with JavaScript and HTML5 Canvas.

## Game Overview

RetroShooter is a classic-style vertical scrolling shooter where players control an aircraft flying up a river, avoiding obstacles, shooting enemies, and collecting fuel to stay alive. The game features increasing difficulty across multiple sections divided by bridges.

## Gameplay Features

- **Player Controls**: Arrow keys for movement, space to shoot
- **Mobile Controls**: Touch-based directional controls for mobile devices
- **Fuel Management**: Decreases over time, replenished by collecting fuel items
- **Multiple Enemy Types**:
  - Regular boats (basic enemies)
  - Helicopters (move in sine wave patterns)
  - Fast boats (quicker and harder to hit)
  - Heavy boats (require multiple hits to destroy)
  - Shooter boats (fire back at player)
- **Section Progression**: Bridges divide the game into sections, with increasing difficulty
- **Scoring System**: Points earned by destroying enemies and completing sections

## Technical Architecture

The game is built with a component-based, modular architecture using JavaScript ES modules:

### Core Modules

- **main.js**: Entry point, canvas setup, game loop implementation
- **game.js**: Core game logic, entity management, and state handling
- **entities.js**: Entity classes (Player, Enemy, Bullet, FuelItem, Bridge)
- **renderer.js**: Rendering system for terrain, entities, and effects
- **input.js**: Input handling with key events and touch controls
- **collision.js**: Optimized collision detection and effects
- **ui.js**: User interface rendering (menus, HUD, transitions)
- **pool.js**: Object pooling for improved performance
- **assets.js**: Asset loading and management

### Key Technical Features

1. **Entity Component System**: Base Entity class with specialized subclasses
2. **Object Pooling**: Efficient reuse of bullets and enemies to improve performance
3. **State Management**: Clear separation between menu, playing, and game over states
4. **Collision Detection**: Optimized AABB (Axis-Aligned Bounding Box) collision system
5. **Visual Effects**: Explosion and impact visual feedback
6. **Section Progression**: Difficulty scaling with section transitions
7. **Responsive Design**: Canvas scaling based on window size
8. **Sound Management**: Background music and sound effects
9. **Mobile Support**: Touch controls for playing on mobile devices

## Enemy Types and Mechanics

The game features progressive enemy introduction across sections:

- **Section 1**: Basic boats only
- **Section 2**: Introduces helicopters
- **Section 3**: Introduces fast boats
- **Section 4**: Introduces heavy boats
- **Section 5+**: Introduces shooter boats and features all enemy types

Each enemy has unique characteristics:
- Different movement patterns (straight, sine wave)
- Varying health points and speed
- Different point values
- Some enemies can fire back at the player

## Debugging Features

- Press 'D' key to toggle collision boundary visualization
- Visual representation of hitboxes and terrain boundaries

## Future Development Opportunities

Areas for potential expansion:
- Local storage for high scores (not yet implemented)
- Additional enemy types and behaviors
- Power-ups and weapon upgrades
- More varied terrain features
- Enhanced mobile controls with customizable layout

## Assets

The game uses SVG assets for entities and WAV/MP3 files for sound effects:
- Player helicopter sprite
- Enemy boat sprites
- Fuel item sprites
- Sound effects and background music

## How to Play

### Desktop Controls
1. Open index.html in a web browser
2. Press ENTER or SPACE to start the game
3. Use arrow keys to navigate the river and avoid obstacles
4. Press SPACE to shoot enemies
5. Collect fuel items to maintain your fuel supply
6. Try to progress through as many sections as possible

### Mobile Controls
1. Open index.html in a mobile browser
2. Tap the screen to start the game
3. Use the on-screen directional controls to navigate:
   - Bottom left: Left/Right movement controls
   - Bottom right: Up/Down movement controls
4. Shooting is automatic on mobile devices
5. Collect fuel items to maintain your fuel supply
6. Tap the screen to restart after game over

### Mobile Tips
- For best experience, play in landscape orientation
- The game prevents scrolling and zooming for better gameplay
- Touch controls are sized proportionally to your screen
- If performance issues occur, try closing other browser tabs

## Original Development Prompt

> "Please help me create a retro-style vertical scrolling shooter game inspired by River Raid from the 1980s. I'd like you to provide:
> 
> Core gameplay features:
> 
> A player-controlled aircraft flying up a scrolling river/terrain
> Limited fuel that can be replenished by collecting items
> Various enemy units to avoid or shoot down (boats, helicopters, etc.)
> Bridges or obstacles that divide sections of the map
> Increasing difficulty as the player progresses
> Simple collision mechanics where hitting terrain or enemies ends the game
> 
> Implementation using JavaScript and HTML5 Canvas with:
> 
> A component-based, modular architecture for easier maintenance and expansion
> Efficient object pooling for bullets and enemies to improve performance
> A simple asset management system for sprites and sounds
> State management (menu, playing, game over states)
> UI elements showing score, fuel level, and lives
> Responsive design that scales to different screen sizes
> Sprite sheet handling for animations
> 
> Additional features:
> 
> Local storage for saving high scores
> Sound effects and background music implementation
> Optimized collision detection for smooth gameplay
> 
> Development guidance:
> 
> Well-commented code explaining key concepts and implementations
> A suggested development roadmap breaking the project into manageable phases
> Extensibility points for adding new features later
> 
> Please structure the code in a way that makes it easy to understand and modify, with separate concerns for game logic, rendering, input handling, and state management."