
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Bot {
  mesh: THREE.Group;
  body: CANNON.Body;
  id: string;
  health = 100;
  maxHealth = 100;
  
  private gunMesh: THREE.Group;
  private muzzleFlash: THREE.PointLight;
  private lastShootTime = 0;
  private shootInterval = 1500;
  
  constructor(scene: THREE.Scene, world: CANNON.World, position: {x: number, z: number}) {
    this.id = 'bot_' + Math.random().toString(36).substr(2, 9);
    this.mesh = new THREE.Group();
    
    // 1. Visual Body
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh);

    // 2. Simple Armed Weapon (Fallback style but attached to AI)
    this.gunMesh = new THREE.Group();
    const barrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    barrel.position.set(0.4, 0.2, -0.3);
    this.gunMesh.add(barrel);
    this.mesh.add(this.gunMesh);

    // 3. Muzzle Flash
    this.muzzleFlash = new THREE.PointLight(0xffaa00, 0, 5);
    this.muzzleFlash.position.set(0.4, 0.2, -0.6);
    this.mesh.add(this.muzzleFlash);

    // 4. Physics
    this.body = new CANNON.Body({
      mass: 50,
      shape: new CANNON.Sphere(0.8),
      position: new CANNON.Vec3(position.x, 5, position.z),
      linearDamping: 0.9,
      fixedRotation: true
    });
    world.addBody(this.body);
    scene.add(this.mesh);
  }

  takeDamage(amount: number) {
    this.health -= amount;
    return this.health <= 0;
  }

  update(delta: number, playerPos: THREE.Vector3, onBotShoot: (bot: Bot) => void) {
    const dist = playerPos.distanceTo(this.mesh.position);
    
    // Look at player logic
    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
    this.mesh.rotation.y = Math.atan2(dir.x, dir.z);

    if (dist < 30) {
      if (dist > 8) {
        this.body.velocity.x = dir.x * 5;
        this.body.velocity.z = dir.z * 5;
      } else {
        this.body.velocity.x *= 0.8;
        this.body.velocity.z *= 0.8;
      }

      // Shoot
      const now = performance.now();
      if (now - this.lastShootTime > this.shootInterval) {
        this.lastShootTime = now;
        this.muzzleFlash.intensity = 10;
        setTimeout(() => this.muzzleFlash.intensity = 0, 50);
        onBotShoot(this);
      }
    }

    this.mesh.position.copy(this.body.position as any);
  }

  remove(scene: THREE.Scene, world: CANNON.World) {
    scene.remove(this.mesh);
    world.removeBody(this.body);
  }
}
