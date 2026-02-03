
import * as THREE from 'three';
import { PlayerData } from '../types';

export default class RemotePlayer {
  mesh: THREE.Group;
  bodyMesh: THREE.Mesh;
  id: string;
  nickname: string;
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;

  constructor(scene: THREE.Scene, data: PlayerData) {
    this.id = data.id;
    this.nickname = data.nickname || "Unknown";
    this.mesh = new THREE.Group();
    
    // 1. 바디 모델링 (캡슐)
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 0.2
    });
    this.bodyMesh = new THREE.Mesh(geometry, material);
    this.mesh.add(this.bodyMesh);

    // 2. 닉네임 태그 (Canvas Texture 사용)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(this.nickname, 128, 45);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.y = 1.8;
    sprite.scale.set(2, 0.5, 1);
    this.mesh.add(sprite);
    
    this.mesh.position.set(data.position.x, data.position.y, data.position.z);
    this.targetPosition = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
    this.targetRotation = new THREE.Euler(data.rotation.x, data.rotation.y, data.rotation.z);
    
    scene.add(this.mesh);
  }

  updateData(data: PlayerData) {
    this.targetPosition.set(data.position.x, data.position.y, data.position.z);
    this.targetRotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
  }

  update(delta: number) {
    this.mesh.position.lerp(this.targetPosition, 0.2);
    this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.2;
  }

  remove(scene: THREE.Scene) {
    scene.remove(this.mesh);
  }
}
