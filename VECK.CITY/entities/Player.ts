
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Player {
  body: CANNON.Body;
  camera: THREE.PerspectiveCamera;
  input = { forward: false, backward: false, left: false, right: false, jump: false };
  
  moveSpeed = 15;
  jumpForce = 12;
  health = 100;
  maxHealth = 100;
  xp = 0;
  level = 1;
  nickname: string;
  
  isWalking = false;
  private lastDamageTime = 0;
  pitch = new THREE.Object3D();
  yaw = new THREE.Object3D();

  constructor(camera: THREE.PerspectiveCamera, world: CANNON.World, nickname: string) {
    this.camera = camera;
    this.nickname = nickname;
    
    const shape = new CANNON.Sphere(0.8);
    this.body = new CANNON.Body({
      mass: 70,
      shape: shape,
      position: new CANNON.Vec3((Math.random()-0.5)*10, 5, (Math.random()-0.5)*10),
      fixedRotation: true,
      linearDamping: 0.9,
    });
    
    world.addBody(this.body);
    this.initListeners();
  }

  private initListeners() {
    const onKey = (e: KeyboardEvent, isPressed: boolean) => {
      // 대문자/소문자 모두 대응
      const code = e.code;
      if (code === 'KeyW' || e.key === 'w' || e.key === 'W') this.input.forward = isPressed;
      if (code === 'KeyS' || e.key === 's' || e.key === 'S') this.input.backward = isPressed;
      if (code === 'KeyA' || e.key === 'a' || e.key === 'A') this.input.left = isPressed;
      if (code === 'KeyD' || e.key === 'd' || e.key === 'D') this.input.right = isPressed;
      if (code === 'Space') this.input.jump = isPressed;
    };

    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onMouseMove(e: MouseEvent) {
    if (document.pointerLockElement !== document.body) return;
    const sensitivity = 0.002;
    this.yaw.rotation.y -= e.movementX * sensitivity;
    this.pitch.rotation.x -= e.movementY * sensitivity;
    this.pitch.rotation.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch.rotation.x));
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.lastDamageTime = performance.now();
    if (this.health <= 0) {
      this.health = 100;
      this.body.position.set((Math.random()-0.5)*50, 10, (Math.random()-0.5)*50);
      this.body.velocity.set(0, 0, 0);
    }
  }

  update(delta: number) {
    // 시점 동기화
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch.rotation.x, this.yaw.rotation.y, 0, 'YXZ'));

    // 이동 처리
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw.rotation.y, 0));
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw.rotation.y, 0));
    const moveDir = new THREE.Vector3(0, 0, 0);

    if (this.input.forward) moveDir.add(forward);
    if (this.input.backward) moveDir.sub(forward);
    if (this.input.left) moveDir.sub(right);
    if (this.input.right) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.body.velocity.x = moveDir.x * this.moveSpeed;
      this.body.velocity.z = moveDir.z * this.moveSpeed;
      this.isWalking = true;
    } else {
      this.body.velocity.x *= 0.8;
      this.body.velocity.z *= 0.8;
      this.isWalking = false;
    }

    // 점프
    const onGround = Math.abs(this.body.velocity.y) < 0.1;
    if (this.input.jump && onGround) {
      this.body.velocity.y = this.jumpForce;
    }

    // 자가 회복
    if (this.health < this.maxHealth && performance.now() - this.lastDamageTime > 5000) {
      this.health = Math.min(this.maxHealth, this.health + delta * 5);
    }

    this.camera.position.set(this.body.position.x, this.body.position.y + 0.7, this.body.position.z);
  }
}
