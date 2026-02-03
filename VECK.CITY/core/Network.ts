
import { io, Socket } from 'socket.io-client';
import * as THREE from 'three';
import RemotePlayer from '../entities/RemotePlayer';
import { PlayerData, HitData } from '../types';

export default class Network {
  socket: Socket | null = null;
  remotePlayers: Map<string, RemotePlayer> = new Map();
  scene: THREE.Scene;
  onHitReceived?: (damage: number) => void;
  // Fix: Added missing onKillSuccess callback property to resolve Engine.ts error
  onKillSuccess?: (xpGained: number) => void;
  onKillLog?: (data: any) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  connect(nickname: string, color: string) {
    const url = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/';
    this.socket = io(url);

    this.socket.on('connect', () => {
      this.socket?.emit('joinGame', { nickname, color });
    });

    this.initHandlers();
  }

  private initHandlers() {
    if (!this.socket) return;

    this.socket.on('currentPlayers', (players: { [id: string]: PlayerData }) => {
      Object.keys(players).forEach((id) => {
        if (id !== this.socket?.id) this.addRemotePlayer(players[id]);
      });
    });

    this.socket.on('newPlayer', (data: PlayerData) => {
      this.addRemotePlayer(data);
    });

    this.socket.on('playerMoved', (data: PlayerData) => {
      const remote = this.remotePlayers.get(data.id);
      if (remote) remote.updateData(data);
    });

    this.socket.on('playerHit', (hitData: any) => {
      if (hitData.targetId === this.socket?.id) {
        this.onHitReceived?.(hitData.damage);
      }
      // Handle when the local player scores a kill to update local XP/Level
      if (hitData.attackerId === this.socket?.id && hitData.isKill) {
        this.onKillSuccess?.(100);
      }
    });

    this.socket.on('killLog', (data: any) => {
      this.onKillLog?.(data);
    });

    this.socket.on('playerDisconnected', (id: string) => {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.remove(this.scene);
        this.remotePlayers.delete(id);
      }
    });
  }

  private addRemotePlayer(data: PlayerData) {
    if (!this.remotePlayers.has(data.id)) {
      const player = new RemotePlayer(this.scene, data);
      this.remotePlayers.set(data.id, player);
    }
  }

  sendUpdate(position: THREE.Vector3, rotation: THREE.Euler) {
    if (this.socket?.connected) {
      this.socket.emit('playerMoved', {
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: rotation.x, y: rotation.y, z: rotation.z }
      });
    }
  }

  sendHit(targetId: string, damage: number, weaponId: string) {
    this.socket?.emit('playerHit', { targetId, damage, attackerId: this.socket.id, weaponId });
  }

  update(delta: number) {
    this.remotePlayers.forEach((p) => p.update(delta));
  }
}
