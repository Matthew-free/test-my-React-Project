
import * as THREE from 'three';

export default class World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    
    // 1. Atmosphere: Cyberpunk Fog & Sky
    const bgColor = 0x050508;
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(bgColor, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      80, 
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 2. High-end Graphics Settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    container.appendChild(this.renderer.domElement);

    this.initLights();
    this.initProceduralGround();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private createGridTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Dark base
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, size, size);
    
    // Grid lines
    ctx.strokeStyle = '#1a1a25';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);
    
    // Inner details
    ctx.strokeStyle = '#252535';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size/2, 0); ctx.lineTo(size/2, size);
    ctx.moveTo(0, size/2); ctx.lineTo(size, size/2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);
    texture.anisotropy = 16;
    return texture;
  }

  private initProceduralGround() {
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      map: this.createGridTexture(),
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private initLights() {
    // Soft ambient
    const ambient = new THREE.AmbientLight(0x4040ff, 0.2);
    this.scene.add(ambient);

    // Main Sunlight (Shadow Caster)
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.radius = 4;
    this.scene.add(sun);

    // Accent Rim Light
    const rim = new THREE.PointLight(0xff00ff, 50, 200);
    rim.position.set(-30, 20, -30);
    this.scene.add(rim);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
