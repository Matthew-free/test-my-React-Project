
import { WeaponConfig } from '../types';

export const WEAPONS: Record<string, WeaponConfig> = {
  RIFLE: { 
    id: 'RIFLE', 
    name: 'AK-47', 
    damage: 22, 
    fireRate: 110, 
    range: 120, 
    ammoMax: 30, 
    reloadTime: 1800, 
    spread: 0.04, 
    color: 0x555555 
  },
  SNIPER: { 
    id: 'SNIPER', 
    name: 'AWP', 
    damage: 100, 
    fireRate: 1400, 
    range: 400, 
    ammoMax: 5, 
    reloadTime: 2800, 
    spread: 0.001, 
    color: 0x224422 
  },
  SHOTGUN: { 
    id: 'SHOTGUN', 
    name: 'M870', 
    damage: 12, 
    fireRate: 850, 
    range: 35, 
    ammoMax: 7, 
    reloadTime: 2200, 
    spread: 0.18, 
    rayCount: 8, 
    color: 0x442222 
  }
};
