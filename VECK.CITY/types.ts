
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface GameEntity {
  mesh: THREE.Object3D;
  body?: CANNON.Body;
  update: (delta: number) => void;
}

export interface PlayerData {
  id: string;
  nickname: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  color: string;
  health: number;
  xp: number;
  level: number;
  kills?: number;
  deaths?: number;
}

export interface HitData {
  targetId: string;
  damage: number;
  attackerId: string;
  weaponId: string;
  isKill?: boolean;
  newTargetHealth?: number;
}

export interface KillData {
  killerName: string;
  victimName: string;
  weaponName: string;
}

export interface WeaponConfig {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  range: number;
  ammoMax: number;
  reloadTime: number;
  spread: number;
  rayCount?: number;
  color: number;
}
