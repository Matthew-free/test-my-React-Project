
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import RemotePlayer from './RemotePlayer';
import { WEAPONS } from '../config/Weapons';
import { WeaponConfig } from '../types';

export default class Weapon {
  mesh: THREE.Group;
  currentWeaponModel: THREE.Object3D | null = null;
  raycaster: THREE.Raycaster;
  camera: THREE.Camera;
  private loader: GLTFLoader;
  
  private muzzleFlashLight: THREE.PointLight;
  private flashIntensity = 0;
  private audioCtx: AudioContext | null = null;
  
  currentConfig: WeaponConfig;
  ammo: number;
  isReloading = false;
  lastFireTime = 0;
  
  private time = 0;
  private recoilZ = 0;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mesh = new THREE.Group();
    this.loader = new GLTFLoader();
    
    this.muzzleFlashLight = new THREE.PointLight(0xffaa00, 0, 10);
    this.mesh.add(this.muzzleFlashLight);
    
    // Hidden initially
    this.mesh.visible = false;
    
    // Attach to camera for FPS feel
    this.camera.add(this.mesh);
    
    this.currentConfig = WEAPONS.RIFLE;
    this.ammo = this.currentConfig.ammoMax;
    this.loadWeaponModel();
  }

  public weaponVisible(visible: boolean) {
    this.mesh.visible = visible;
  }

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createFallbackWeapon() {
    const group = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.22, 0.7);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    
    const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.1 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.4;
    group.add(barrel);
    
    group.position.set(0.35, -0.35, -0.6);
    group.rotation.y = Math.PI;
    return group;
  }

  private loadWeaponModel() {
    if (this.currentWeaponModel) this.mesh.remove(this.currentWeaponModel);
    
    const weaponId = this.currentConfig.id.toLowerCase();
    const modelPath = `assets/models/${weaponId}.glb`;
    
    this.loader.load(modelPath, 
      (gltf) => {
        this.currentWeaponModel = gltf.scene;
        this.currentWeaponModel.scale.set(0.4, 0.4, 0.4); 
        this.currentWeaponModel.position.set(0.35, -0.35, -0.6);
        this.currentWeaponModel.rotation.y = Math.PI;
        this.mesh.add(this.currentWeaponModel);
      }, 
      undefined, 
      () => {
        this.currentWeaponModel = this.createFallbackWeapon();
        this.mesh.add(this.currentWeaponModel);
      }
    );
  }

  private playGunshotSound() {
    this.initAudio();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const g = ctx.createGain();
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(150, now);
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.1);
  }

  public fire(targets: Map<string, RemotePlayer>): string[] {
    const now = performance.now();
    if (this.isReloading || this.ammo <= 0 || now - this.lastFireTime < this.currentConfig.fireRate) return [];
    
    this.lastFireTime = now;
    this.ammo--;
    this.recoilZ = 0.2; 
    this.flashIntensity = 1.0;
    this.playGunshotSound();
    
    return [];
  }

  public update(delta: number, isWalking: boolean) {
    if (!this.mesh.visible) return;

    this.time += delta;
    this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, 10 * delta);
    
    const swaySpeed = isWalking ? 10 : 2;
    const swayAmt = isWalking ? 0.05 : 0.008;
    const swayX = Math.sin(this.time * swaySpeed) * swayAmt;
    const swayY = Math.cos(this.time * swaySpeed * 1.5) * swayAmt;

    if (this.currentWeaponModel) {
      this.currentWeaponModel.position.x = 0.35 + swayX;
      this.currentWeaponModel.position.y = -0.35 + swayY;
      this.currentWeaponModel.position.z = -0.6 + this.recoilZ;
    }

    if (this.flashIntensity > 0) {
      this.flashIntensity -= delta * 25;
      this.muzzleFlashLight.intensity = Math.max(0, this.flashIntensity * 18);
    }
  }
}
