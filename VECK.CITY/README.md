# VECK.CITY - Urban Combat Simulator

A high-octane web-based FPS game featuring real-time multiplayer combat in an urban environment with vehicle mechanics and dynamic weapon systems.

## Features

🎮 **Core Gameplay**
- Real-time 3D combat in an urban environment
- Player vs Player (PvP) multiplayer
- Vehicle system (cars with physics-based driving)
- Advanced weapon mechanics with ammo management
- Dynamic health and damage system
- XP and leveling progression

🚗 **Vehicle Mechanics**
- Fully functional vehicle physics
- Smooth driving controls
- Vehicle-based combat
- Easy enter/exit system

⚔️ **Combat System**
- Multiple weapon types
- Raycast-based shooting mechanics
- Realistic bullet spread
- Ammo management and reloading
- Kill feedback and notifications

🌍 **Multiplayer**
- Real-time player synchronization
- Remote player rendering
- Network-based combat updates
- Chat and kill notifications

## Project Structure

```
VECK.CITY/
├── components/           # React UI components
│   ├── BattleArena.tsx
│   ├── BattleScene.tsx
│   ├── DiscoveryModal.tsx
│   ├── ElementCard.tsx
│   └── LootCard.tsx
├── config/              # Configuration files
│   └── Weapons.ts       # Weapon configurations
├── core/                # Game engine core
│   ├── Engine.ts        # Main game engine
│   ├── Physics.ts       # Physics system
│   ├── World.ts         # World management
│   ├── Network.ts       # Network communication
│   ├── City.ts          # City environment
│   └── Particles.ts     # Particle effects
├── entities/            # Game entities
│   ├── Player.ts        # Player entity
│   ├── RemotePlayer.ts  # Remote player
│   ├── Bot.ts           # AI bots
│   ├── Car.ts           # Vehicle entity
│   ├── Weapon.ts        # Weapon system
│   └── Map.ts           # Map data
├── services/            # Services
│   └── geminiService.ts # API services
├── App.tsx              # Main React component
├── types.ts             # TypeScript definitions
├── constants.ts         # Game constants
└── metadata.json        # App metadata
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

## Controls

### On Foot
- **WASD** - Move
- **Mouse** - Look around
- **Left Click** - Shoot
- **R** - Reload
- **E** - Board vehicle
- **ESC** - Pause/Menu

### Driving
- **WASD** - Drive
- **Space** - Handbrake
- **E** - Exit vehicle

## Game Mechanics

### Health System
- Players start with 100% health
- Take damage from weapon fire
- Damage indicators on screen
- Health below 40% shows warning effect

### Weapon System
- Multiple weapon types with different stats
- Limited ammunition
- Reload mechanics
- Weapon spread affects accuracy
- Fire rate determines attack speed

### Vehicle System
- Physics-based driving
- Vehicles can be used as cover
- Vehicle takes damage
- Can exit anytime during gameplay

## Networking

The game uses Socket.io for real-time multiplayer synchronization:
- Player position and rotation updates
- Combat hit notifications
- Kill/death tracking
- Real-time player list

## Technical Stack

- **Frontend**: React 19.x with TypeScript
- **3D Engine**: Three.js
- **Physics**: Cannon-es
- **Build Tool**: Vite
- **Networking**: Socket.io
- **Styling**: Tailwind CSS

## Performance

- Optimized raycasting for hit detection
- Efficient entity management
- Culled off-screen objects
- Optimized network updates (100ms interval)
- Smooth 60 FPS gameplay

## License

Proprietary - VECK.CITY

## Support

For issues and feature requests, please contact the development team.

---

**VECK.CITY** - Where Urban Combat Reaches New Heights
