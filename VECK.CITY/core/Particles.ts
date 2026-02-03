
import * as THREE from 'three';

export class ParticleManager {
  private particles: { mesh: THREE.Mesh, velocity: THREE.Vector3, life: number }[] = [];
  private holes: THREE.Mesh[] = [];
  private scene: THREE.Scene;
  private maxHoles = 100;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createHitEffect(position: THREE.Vector3, color: number = 0xffff00) {
    const count = 8;
    const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(position);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      
      this.scene.add(p);
      this.particles.push({ mesh: p, velocity, life: 1.0 });
    }
  }

  // 건물 벽면에 총알 자국 생성
  createBulletHole(position: THREE.Vector3, normal: THREE.Vector3, parent: THREE.Object3D) {
    const geo = new THREE.CircleGeometry(0.12, 8);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x111111, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const hole = new THREE.Mesh(geo, mat);
    
    // 법선 벡터(Normal)를 기준으로 구멍 회전
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    dummy.lookAt(position.clone().add(normal));
    hole.position.copy(position).add(normal.clone().multiplyScalar(0.01)); // Z-Fighting 방지
    hole.quaternion.copy(dummy.quaternion);

    this.scene.add(hole);
    this.holes.push(hole);

    // 구멍 개수 제한 (성능 최적화)
    if (this.holes.length > this.maxHoles) {
      const oldHole = this.holes.shift();
      if (oldHole) this.scene.remove(oldHole);
    }

    // 10초 후 자동 제거
    setTimeout(() => {
      this.scene.remove(hole);
      this.holes = this.holes.filter(h => h !== hole);
    }, 10000);
  }

  update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta * 2;
      p.velocity.y -= 0.5 * delta; 
      p.mesh.position.add(p.velocity);
      p.mesh.scale.setScalar(p.life);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }
}
