
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Car {
  mesh: THREE.Group;
  vehicle: CANNON.RaycastVehicle;
  wheelMeshes: THREE.Mesh[] = [];
  world: CANNON.World;
  scene: THREE.Scene;
  
  maxEngineForce = 8000; // 힘 상향
  maxSteerVal = 0.5;
  brakeForce = 150;

  constructor(scene: THREE.Scene, world: CANNON.World, position: THREE.Vector3) {
    this.scene = scene;
    this.world = world;
    this.mesh = new THREE.Group();

    // 1. Chassis Body (차체 물리)
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1.2, 0.6, 2.2));
    const chassisBody = new CANNON.Body({ 
      mass: 1200, // 무게감 있는 설정
      allowSleep: false // 잠들지 않게 설정
    });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(position.x, position.y + 1, position.z);
    chassisBody.angularDamping = 0.5;
    
    // 핵심: 물리 세계에 바디를 직접 추가해야 시뮬레이션이 작동함
    this.world.addBody(chassisBody);

    // 2. Chassis Visual (차체 외관)
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 4.4),
      new THREE.MeshStandardMaterial({ 
        color: 0xff1144, 
        metalness: 0.8, 
        roughness: 0.2,
        emissive: 0xff0000,
        emissiveIntensity: 0.1
      })
    );
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh);
    scene.add(this.mesh);

    // 3. Vehicle Setup
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2
    });

    // 4. Wheel Settings
    const wheelOptions = {
      radius: 0.6,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 40,
      suspensionRestLength: 0.4,
      frictionSlip: 8, 
      dampingRelaxation: 2.5,
      dampingCompression: 4.5,
      maxSuspensionForce: 150000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.4,
      customSlidingFrictionWheelCoefficient: 0.7,
      useCustomSlidingFriction: true
    };

    const wheelPos = [
      new CANNON.Vec3(1.1, -0.2, 1.6),  // Front Left
      new CANNON.Vec3(-1.1, -0.2, 1.6), // Front Right
      new CANNON.Vec3(1.1, -0.2, -1.6), // Rear Left
      new CANNON.Vec3(-1.1, -0.2, -1.6) // Rear Right
    ];

    wheelPos.forEach((pos, idx) => {
      wheelOptions.chassisConnectionPointLocal.copy(pos);
      this.vehicle.addWheel(wheelOptions);
      
      const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 24);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });
      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      this.wheelMeshes.push(wheelMesh);
      scene.add(wheelMesh);
    });

    this.vehicle.addToWorld(this.world);
  }

  update(input: { forward: boolean, backward: boolean, left: boolean, right: boolean, jump: boolean }) {
    // WASD 매핑
    const engineForce = input.forward ? this.maxEngineForce : (input.backward ? -this.maxEngineForce : 0);
    const steeringValue = input.left ? this.maxSteerVal : (input.right ? -this.maxSteerVal : 0);
    const brakeValue = input.jump ? this.brakeForce : 0; // Space = Brake

    // 전륜 조향
    this.vehicle.setSteeringValue(steeringValue, 0);
    this.vehicle.setSteeringValue(steeringValue, 1);
    
    // 후륜 구동
    this.vehicle.applyEngineForce(engineForce, 2);
    this.vehicle.applyEngineForce(engineForce, 3);
    
    // 브레이크 적용
    for(let i=0; i<4; i++) {
      this.vehicle.setBrake(brakeValue, i);
    }

    // 메쉬 동기화
    this.mesh.position.copy(this.vehicle.chassisBody.position as any);
    this.mesh.quaternion.copy(this.vehicle.chassisBody.quaternion as any);

    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
      const t = this.vehicle.wheelInfos[i].worldTransform;
      this.wheelMeshes[i].position.copy(t.position as any);
      this.wheelMeshes[i].quaternion.copy(t.quaternion as any);
    }
  }
}
