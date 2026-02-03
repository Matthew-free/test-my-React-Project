
export type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export type EntityType = 'PLAYER' | 'ENEMY' | 'KEY' | 'BATTERY' | 'DOOR' | 'CAR' | 'LOCKER' | 'BED' | 'SHADOW' | 'NOTE' | 'BAT' | 'BANDAGE';

export interface KeyConfig {
  MOVE_FORWARD: string;
  MOVE_BACKWARD: string;
  MOVE_LEFT: string;
  MOVE_RIGHT: string;
  RUN: string;
  SNEAK: string; 
  INTERACT: string;
  FLASHLIGHT: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  level?: number; 
  isOpen?: boolean;
  content?: 'BATTERY' | 'KEY' | 'BAT' | 'EMPTY' | 'BANDAGE';
  text?: string;
}

export interface Player extends Entity {
  speed: number;
  battery: number;
  keys: number;
  noise: number;
  health: number;
  maxHealth: number;
  lastDamageTime: number;
  isInjured: boolean;
  flashlightOn: boolean;
  hasFlashlight: boolean;
  direction: Point;
  isFlickering: boolean;
  isCrouching: boolean;
  currentLevel: number; 
  
  isHidden: boolean;
  hidingType?: 'LOCKER' | 'BED';
  hasBat: boolean;
  attackTimer: number;
  lastAttackTime: number;

  yaw: number;
  pitch: number;
  
  lastJumpScareTime: number;
  sanity: number;
  isBeingDragged: boolean;
}

export interface Enemy extends Entity {
  state: 'IDLE' | 'HUNTING' | 'SEARCHING' | 'PATROL' | 'STALKING';
  speed: number;
  lastKnownPlayerPos: Point | null;
  patrolPoints: Point[];
  currentPatrolIndex: number;
  invisible: boolean;
  
  stareTimer: number;
  footstepTimer: number;
  teleportCooldown: number;
}

export type TileMap = number[][];
