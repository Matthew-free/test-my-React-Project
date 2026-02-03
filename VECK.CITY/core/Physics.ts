
import * as CANNON from 'cannon-es';

export default class Physics {
  world: CANNON.World;
  groundMaterial: CANNON.Material;
  wheelMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -30, 0); 
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    // 재질 및 마찰력 설정
    this.groundMaterial = new CANNON.Material('ground');
    this.wheelMaterial = new CANNON.Material('wheel');

    // 바퀴와 바닥 사이의 마찰력을 높여 미끄러짐 방지
    const contactMaterial = new CANNON.ContactMaterial(
      this.wheelMaterial,
      this.groundMaterial,
      {
        friction: 0.8,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
      }
    );
    this.world.addContactMaterial(contactMaterial);
    this.world.defaultContactMaterial.friction = 0.1;
  }

  update(delta: number) {
    this.world.step(1 / 60, delta, 3);
  }
}
