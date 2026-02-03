
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class City {
  group: THREE.Group;
  buildings: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.group = new THREE.Group();
    this.generate(scene, world);
    scene.add(this.group);
  }

  private createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#222225';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#4488ff';
    for (let y = 10; y < 120; y += 20) {
      for (let x = 10; x < 120; x += 25) {
        if (Math.random() > 0.2) {
          ctx.globalAlpha = Math.random() * 0.5 + 0.5;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#4488ff';
          ctx.fillRect(x, y, 15, 12);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  generate(scene: THREE.Scene, world: CANNON.World) {
    const winTex = this.createWindowTexture();
    const count = 35;
    const spread = 120;

    for (let i = 0; i < count; i++) {
      const w = 5 + Math.random() * 10;
      const h = 15 + Math.random() * 40;
      const d = 5 + Math.random() * 10;
      const x = (Math.random() - 0.5) * spread * 2;
      const z = (Math.random() - 0.5) * spread * 2;
      if (Math.sqrt(x*x + z*z) < 20) continue;

      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.4, metalness: 0.1 });
      const uvAttribute = geo.attributes.uv;
      for (let j = 0; j < uvAttribute.count; j++) {
        uvAttribute.setXY(j, uvAttribute.getX(j) * (w/5), uvAttribute.getY(j) * (h/5));
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h/2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "BUILDING"; // 건물 식별자
      mesh.userData = { size: { w, h, d } }; // 모서리 판정을 위한 사이즈 저장
      this.group.add(mesh);
      this.buildings.push(mesh);

      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)),
        position: new CANNON.Vec3(x, h/2, z)
      });
      world.addBody(body);
    }
  }
}
