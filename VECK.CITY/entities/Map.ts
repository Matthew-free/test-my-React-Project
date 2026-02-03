
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameEntity } from '../types';

export class GameMap implements GameEntity {
  mesh: THREE.Group;
  body: CANNON.Body;

  constructor() {
    this.mesh = new THREE.Group();

    // 1. Grid Visual
    const gridHelper = new THREE.GridHelper(200, 50, 0x00ffff, 0x222222);
    this.mesh.add(gridHelper);

    // 2. Ground Visual
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x050505, 
      roughness: 0.8 
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.01;
    this.mesh.add(groundMesh);

    // 3. Physics Ground
    const groundShape = new CANNON.Plane();
    this.body = new CANNON.Body({ mass: 0 });
    this.body.addShape(groundShape);
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

    // 4. Add some neon obstacles
    for (let i = 0; i < 20; i++) {
      const size = 2 + Math.random() * 5;
      const boxGeo = new THREE.BoxGeometry(size, size, size);
      const boxMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        emissive: 0x00ffff, 
        emissiveIntensity: 0.5 
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      boxMesh.position.set(x, size/2, z);
      this.mesh.add(boxMesh);
    }
  }

  update() {}
}
