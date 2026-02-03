
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import World from './World';
import Physics from './Physics';
import Player from '../entities/Player';
import Network from './Network';
import Weapon from '../entities/Weapon';
import Bot from '../entities/Bot';
import Car from '../entities/Car';
import { City } from './City';
import { ParticleManager } from './Particles';

export class GameEngine {
  public world: World;
  public physics: Physics;
  public player: Player;
  public network: Network;
  public weapon: Weapon;
  public particles: ParticleManager;
  public city: City;
  public car: Car;
  public bots: Bot[] = [];
  
  public gameStarted = false;
  public isDriving = false;
  private clock = new THREE.Clock();

  constructor(container: HTMLElement, nickname: string, color: string) {
    this.world = new World(container);
    this.physics = new Physics();
    this.player = new Player(this.world.camera, this.physics.world, nickname);
    this.network = new Network(this.world.scene);
    this.weapon = new Weapon(this.world.camera);
    this.particles = new ParticleManager(this.world.scene);
    
    this.initMap();
    this.city = new City(this.world.scene, this.physics.world);
    
    const carPos = new THREE.Vector3(15, 2, 15);
    this.car = new Car(this.world.scene, this.physics.world, carPos);

    this.initControls();
    this.spawnBots(12);
  }

  private initMap() {
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: this.physics.groundMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.physics.world.addBody(groundBody);
  }

  private spawnBots(count: number) {
    for (let i = 0; i < count; i++) {
      const bot = new Bot(
        this.world.scene, 
        this.physics.world, 
        { x: (Math.random()-0.5)*180, z: (Math.random()-0.5)*180 }
      );
      this.bots.push(bot);
    }
  }

  private initControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.gameStarted) return;
      if (e.code === 'KeyE') {
        const dist = this.player.camera.position.distanceTo(this.car.mesh.position);
        if (!this.isDriving && dist < 10) this.enterCar();
        else if (this.isDriving) this.exitCar();
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.gameStarted || this.isDriving || document.pointerLockElement !== document.body) return;
      if (e.button === 0) this.handleShooting();
    });
  }

  public enterGame() {
    this.gameStarted = true;
    this.weapon.weaponVisible(true);
  }

  private enterCar() {
    this.isDriving = true;
    this.weapon.weaponVisible(false);
    this.physics.world.removeBody(this.player.body);
  }

  private exitCar() {
    this.isDriving = false;
    this.weapon.weaponVisible(true);
    const carPos = this.car.mesh.position;
    this.player.body.position.set(carPos.x + 4, carPos.y + 2, carPos.z);
    this.player.body.velocity.set(0, 0, 0);
    this.physics.world.addBody(this.player.body);
  }

  private handleShooting() {
    if (this.weapon.ammo <= 0) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0,0), this.world.camera);
    raycaster.far = this.weapon.currentConfig.range;
    
    const targets = [...this.bots.map(b => b.mesh), ...this.city.buildings];
    const intersects = raycaster.intersectObjects(targets, true);
    
    if (intersects.length > 0) {
      const hit = intersects[0];
      if (this.city.buildings.includes(hit.object as THREE.Mesh)) {
        if (hit.face) this.particles.createBulletHole(hit.point, hit.face.normal, hit.object);
      } else {
        const bot = this.bots.find(b => b.mesh.getObjectById(hit.object.id) || b.mesh === hit.object);
        if (bot) {
          this.particles.createHitEffect(bot.mesh.position, 0xff0000);
          if (bot.takeDamage(this.weapon.currentConfig.damage)) this.onBotDeath(bot);
        }
      }
    }
    this.weapon.fire(new Map());
  }

  private onBotDeath(bot: Bot) {
    bot.remove(this.world.scene, this.physics.world);
    this.bots = this.bots.filter(b => b !== bot);
    this.player.xp += 100;
    setTimeout(() => this.spawnBots(1), 5000);
  }

  public start() { this.animate(); }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = Math.min(this.clock.getDelta(), 0.1);
    
    if (this.gameStarted) {
      this.physics.update(delta);
      this.particles.update(delta);

      if (this.isDriving) {
        // 차량 업데이트 (입력 전달)
        this.car.update(this.player.input);
        
        // 카메라 팔로우
        const carPos = this.car.mesh.position;
        const offset = new THREE.Vector3(0, 8, 18).applyQuaternion(this.car.mesh.quaternion);
        const targetCamPos = carPos.clone().add(offset);
        this.world.camera.position.lerp(targetCamPos, 0.1);
        this.world.camera.lookAt(carPos.x, carPos.y + 1, carPos.z);

        // 충돌 데미지
        this.bots.forEach(bot => {
          if (this.car.mesh.position.distanceToSquared(bot.mesh.position) < 25) {
            if (bot.takeDamage(50 * delta)) this.onBotDeath(bot);
            this.particles.createHitEffect(bot.mesh.position, 0xff4400);
          }
        });
      } else {
        this.player.update(delta);
        this.weapon.update(delta, this.player.isWalking);
      }

      this.bots.forEach(bot => bot.update(delta, this.world.camera.position, () => {
        this.player.takeDamage(4);
        this.particles.createHitEffect(this.world.camera.position, 0xff0000);
      }));
    }
    this.world.render();
  }
}
