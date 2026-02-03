
import React, { useRef, useEffect, useCallback, useState } from 'react';
/* Added Point to imports to fix the TS error */
import { 
  GameState, Player, Enemy, Entity, 
  KeyConfig, Point 
} from '../types';
import { 
  TILE_SIZE, MAP_LEVELS, MAP_WIDTH, MAP_HEIGHT,
  PLAYER_SIZE, ENEMY_SIZE, WALK_SPEED, RUN_SPEED, STEALTH_SPEED,
  ENEMY_SPEED_IDLE, ENEMY_SPEED_HUNT, ENEMY_SPEED_STALK,
  BATTERY_DECAY,
  NOISE_WALK, NOISE_RUN, NOISE_STEALTH, NOISE_DECAY, NOISE_THRESHOLD_DETECT,
  JUMP_SCARE_COOLDOWN, GHOST_STARE_THRESHOLD, GHOST_TELEPORT_MIN_DIST, GHOST_TELEPORT_MAX_DIST,
  BAT_COOLDOWN, BAT_RANGE, BAT_HIT_ARC, BATTERY_RECHARGE,
  FOV, NUM_RAYS, MAX_DEPTH
} from '../constants';
import { AudioEngine } from '../utils/AudioEngine';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onStatsUpdate: (stats: any) => void;
  keyBindings: KeyConfig;
}

const STORY_NOTES = [
    "NOTE: Bandages are scattered around. They are your only hope if caught.",
    "NOTE: Once a ghost touches you, your body will never fully heal. Max health remains 67.",
    "NOTE: If you are bleeding (health < 100), you must find a bandage quickly.",
    "NOTE: The ghost won't kill you instantly, it will pull you back into the nightmare."
];

const TEXTURE_URLS = {
    ghost: "https://i.imgur.com/W2C2x2s.jpeg" 
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  onStatsUpdate,
  keyBindings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isLevelTransitioning, setIsLevelTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  
  const playerRef = useRef<Player>({
    id: 'player', type: 'PLAYER', x: 60, y: 60, width: PLAYER_SIZE, height: PLAYER_SIZE, active: true,
    speed: WALK_SPEED, battery: 100, keys: 0, noise: 0, health: 100, maxHealth: 100, 
    lastDamageTime: 0, isInjured: false, flashlightOn: true, hasFlashlight: true,
    direction: { x: 1, y: 0 }, isFlickering: false, isCrouching: false,
    yaw: -Math.PI / 2, pitch: 0, lastJumpScareTime: 0, sanity: 0,
    isHidden: false, hasBat: false, attackTimer: 0, lastAttackTime: 0,
    currentLevel: 0, isBeingDragged: false
  });
  
  const enemyRef = useRef<Enemy>({
    id: 'enemy', type: 'ENEMY', x: -1000, y: -1000, width: ENEMY_SIZE, height: ENEMY_SIZE, active: false,
    state: 'IDLE', speed: ENEMY_SPEED_IDLE, lastKnownPlayerPos: null,
    patrolPoints: [], currentPatrolIndex: 0, invisible: false,
    stareTimer: 0, footstepTimer: 0, teleportCooldown: 0
  });

  const entitiesRef = useRef<Entity[]>([]);
  const keysInput = useRef<{ [key: string]: boolean }>({});
  const stepTimer = useRef<number>(0); 
  const healCheckTimer = useRef<number>(0);
  const texturesRef = useRef<Record<string, HTMLImageElement>>({});
  const frameCountRef = useRef(0);
  const draggingTarget = useRef<Point | null>(null);
  const deathSequence = useRef<{active: boolean, startTime: number}>({active: false, startTime: 0});
  const escapeSequence = useRef<{active: boolean, startTime: number}>({active: false, startTime: 0});
  const zBuffer = useRef<number[]>(new Array(NUM_RAYS).fill(0));
  const currentMsgRef = useRef<string>("");

  const initGame = useCallback(() => {
    entitiesRef.current = [];
    const p = playerRef.current;
    p.battery = 100; p.currentLevel = 0; p.keys = 0; p.health = 100; p.maxHealth = 100;
    p.hasBat = false; p.isHidden = false; p.isBeingDragged = false; p.isInjured = false;
    p.x = 60; p.y = 60;
    
    deathSequence.current = { active: false, startTime: 0 };
    escapeSequence.current = { active: false, startTime: 0 };
    currentMsgRef.current = "";
    frameCountRef.current = 0;
    
    AudioEngine.getInstance().init();
    
    Object.entries(TEXTURE_URLS).forEach(([key, url]) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = url;
        texturesRef.current[key] = img;
    });

    MAP_LEVELS.forEach((layout, levelIdx) => {
      for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[0].length; c++) {
          const cell = layout[r][c];
          const cx = c * TILE_SIZE + TILE_SIZE / 2;
          const cy = r * TILE_SIZE + TILE_SIZE / 2;
          if (cell === 9 && levelIdx === 0) { p.x = cx; p.y = cy; }
          else if (cell === 2) entitiesRef.current.push({ id: `k${levelIdx}${r}${c}`, type: 'KEY', x: cx, y: cy, width: 20, height: 20, active: true, level: levelIdx });
          else if (cell === 14) entitiesRef.current.push({ id: `band${levelIdx}${r}${c}`, type: 'BANDAGE', x: cx, y: cy, width: 20, height: 20, active: true, level: levelIdx });
          else if (cell === 4) entitiesRef.current.push({ id: `c${levelIdx}${r}${c}`, type: 'CAR', x: cx, y: cy, width: 60, height: 40, active: true, level: levelIdx });
          else if (cell === 10) entitiesRef.current.push({ id: `b${levelIdx}${r}${c}`, type: 'BED', x: cx, y: cy, width: 32, height: 38, active: true, level: levelIdx });
          else if (cell === 6) entitiesRef.current.push({ id: `n${levelIdx}${r}${c}`, type: 'NOTE', x: cx, y: cy, width: 25, height: 25, active: true, level: levelIdx, text: STORY_NOTES[Math.floor(Math.random()*STORY_NOTES.length)] });
        }
      }
    });

    entitiesRef.current.push({ id: 'weapon_bat', type: 'BAT', x: 250, y: 150, width: 30, height: 8, active: true, level: 0 });
    enemyRef.current.active = false; 
    keysInput.current = {};
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') initGame();
  }, [gameState, initGame]);

  const showTempMessage = (msg: string, duration: number = 3000) => {
      currentMsgRef.current = msg;
      setTimeout(() => {
          if (currentMsgRef.current === msg) currentMsgRef.current = "";
      }, duration);
  };

  const toggleLevel = useCallback((targetLevel: number) => {
      const p = playerRef.current;
      if (targetLevel === 1 && p.keys < 12) {
          showTempMessage("NEED 12 KEYS TO UNLOCK STAIRS", 3000);
          return;
      }
      setIsLevelTransitioning(true);
      const text = targetLevel === 1 ? "SECOND FLOOR - RUN!" : "GROUND FLOOR";
      setTransitionText(text);
      showTempMessage(text, 3000); 
      AudioEngine.getInstance().playBell();
      const currentLayout = MAP_LEVELS[targetLevel];
      const targetStairs = targetLevel === 1 ? 11 : 12; 
      for(let r=0; r<currentLayout.length; r++) {
          for(let c=0; c<currentLayout[0].length; c++) {
              if (currentLayout[r][c] === targetStairs) {
                  p.x = c * TILE_SIZE + TILE_SIZE/2;
                  p.y = r * TILE_SIZE + TILE_SIZE/2;
                  p.currentLevel = targetLevel;
                  enemyRef.current.active = false;
                  if(targetLevel === 1) frameCountRef.current = 1100; 
                  break;
              }
          }
      }
      setTimeout(() => setIsLevelTransitioning(false), 3000);
  }, []);

  const checkCollision = (x: number, y: number, size: number, level: number, isEnemy: boolean = false): boolean => {
    const layout = MAP_LEVELS[level];
    const mapX = Math.floor(x / TILE_SIZE), mapY = Math.floor(y / TILE_SIZE);
    if (mapY < 0 || mapY >= layout.length || mapX < 0 || mapX >= layout[0].length) return true;
    const cell = layout[mapY][mapX];
    if (!isEnemy && !isLevelTransitioning) {
        if (cell === 11 && level === 0) { toggleLevel(1); return false; }
        if (cell === 12 && level === 1) { toggleLevel(0); return false; }
        if (cell === 13 && level === 1) {
            escapeSequence.current = { active: true, startTime: Date.now() };
            AudioEngine.getInstance().playHit();
            if (document.pointerLockElement) document.exitPointerLock();
            return true;
        }
    }
    if ([1, 7, 8].includes(cell)) return true;
    for (const ent of entitiesRef.current) {
        if (ent.active && ent.level === level && ['CAR', 'BED'].includes(ent.type)) {
            if (Math.hypot(x - ent.x, y - ent.y) < (size/2 + ent.width/2)) return true;
        }
    }
    return false;
  };

  const performAttack = () => {
    const p = playerRef.current;
    if (!p.hasBat || Date.now() - p.lastAttackTime < BAT_COOLDOWN) return;
    p.attackTimer = 250; p.lastAttackTime = Date.now();
    AudioEngine.getInstance().playSwing();
    const e = enemyRef.current;
    if (e.active && Math.hypot(e.x - p.x, e.y - p.y) < BAT_RANGE) {
        AudioEngine.getInstance().playHit(); e.active = false;
        showTempMessage("BANISHED!", 2000);
    }
  };

  const interact = () => {
      const p = playerRef.current;
      entitiesRef.current.forEach(ent => {
          if (ent.active && ent.level === p.currentLevel && Math.hypot(ent.x - p.x, ent.y - p.y) < 50) {
              if (ent.type === 'BANDAGE') {
                  ent.active = false;
                  p.health = p.maxHealth;
                  p.isInjured = false;
                  showTempMessage("WOUNDS TREATED", 3000);
                  AudioEngine.getInstance().playItemDrop();
              }
          }
      });
  };

  const updatePlayer = () => {
    const p = playerRef.current;
    if (isLevelTransitioning || p.isHidden || deathSequence.current.active || escapeSequence.current.active) return;
    
    // Dragging Logic
    if (p.isBeingDragged) {
        const dx = 60 - p.x, dy = 60 - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 10) { 
            p.isBeingDragged = false; 
            p.health = 20; p.maxHealth = 67; p.isInjured = true;
            p.lastDamageTime = Date.now();
            healCheckTimer.current = Date.now();
            showTempMessage("YOU WERE DRAGGED BACK. FIND BANDAGES!", 5000);
        } else {
            p.x += (dx / dist) * 12; p.y += (dy / dist) * 12;
            return; // Can't move while being dragged
        }
    }

    // Health Decay
    if (p.isInjured && Date.now() - healCheckTimer.current > 10000) {
        p.health -= 3;
        healCheckTimer.current = Date.now();
        showTempMessage("BLEEDING OUT...", 2000);
        if (p.health <= 0) setGameState('GAME_OVER');
    }

    const speed = keysInput.current[keyBindings.RUN] ? RUN_SPEED : (keysInput.current[keyBindings.SNEAK] ? STEALTH_SPEED : WALK_SPEED);
    let moveX = 0, moveY = 0;
    const dxF = Math.cos(p.yaw), dyF = Math.sin(p.yaw); 
    const dxR = Math.cos(p.yaw + Math.PI/2), dyR = Math.sin(p.yaw + Math.PI/2); 
    if (keysInput.current[keyBindings.MOVE_FORWARD]) { moveX += dxF * speed; moveY += dyF * speed; }
    if (keysInput.current[keyBindings.MOVE_BACKWARD]) { moveX -= dxF * speed; moveY -= dyF * speed; }
    if (keysInput.current[keyBindings.MOVE_LEFT]) { moveX -= dxR * speed; moveY -= dyR * speed; }
    if (keysInput.current[keyBindings.MOVE_RIGHT]) { moveX += dxR * speed; moveY += dyR * speed; }
    if (!checkCollision(p.x + moveX, p.y, p.width, p.currentLevel)) p.x += moveX;
    if (!checkCollision(p.x, p.y + moveY, p.width, p.currentLevel)) p.y += moveY;
    
    if (Math.abs(moveX) + Math.abs(moveY) > 0.1) {
        p.noise = keysInput.current[keyBindings.RUN] ? 1.0 : 0.4;
        if (Date.now() - stepTimer.current > (keysInput.current[keyBindings.RUN] ? 300 : 500)) {
            AudioEngine.getInstance().playFootstep('WOOD', 0.8); stepTimer.current = Date.now();
        }
    }

    entitiesRef.current.forEach(ent => {
        if (!ent.active || ent.level !== p.currentLevel) return;
        if (Math.hypot(ent.x - p.x, ent.y - p.y) < 40) {
            if (ent.type === 'KEY') { ent.active = false; p.keys++; AudioEngine.getInstance().playItemDrop(); }
            if (ent.type === 'BAT') { ent.active = false; p.hasBat = true; AudioEngine.getInstance().playItemDrop(); showTempMessage("BAT ACQUIRED", 3000); }
            if (ent.type === 'NOTE') { setActiveNote(ent.text || ""); ent.active = false; }
        }
    });
    if (p.attackTimer > 0) p.attackTimer -= 16;
  };

  const updateEnemy = () => {
    const e = enemyRef.current, p = playerRef.current;
    if (isLevelTransitioning || deathSequence.current.active || escapeSequence.current.active || p.isBeingDragged) return;
    
    const spawnChance = p.currentLevel === 1 ? 0.015 : 0.003;
    if (!e.active && frameCountRef.current > 600 && Math.random() < spawnChance) { 
        e.active = true; 
        const spawnDist = 450; const spawnAngle = Math.random() * Math.PI * 2;
        e.x = p.x + Math.cos(spawnAngle) * spawnDist; e.y = p.y + Math.sin(spawnAngle) * spawnDist; 
        if (p.currentLevel === 1 && p.hasBat) { p.hasBat = false; showTempMessage("YOU DROPPED YOUR BAT IN FEAR!", 4000); }
    }

    if (e.active) {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        const chaseSpeed = p.currentLevel === 1 ? ENEMY_SPEED_STALK * 1.5 : ENEMY_SPEED_STALK;
        e.x += Math.cos(angle) * chaseSpeed; e.y += Math.sin(angle) * chaseSpeed;
        
        if (dist < 30) { 
            e.active = false;
            p.isBeingDragged = true;
            AudioEngine.getInstance().playJumpScare();
        }
    }
  };

  const renderMinimap = (ctx: CanvasRenderingContext2D, p: Player) => {
      const size = 180, scale = 0.25, layout = MAP_LEVELS[p.currentLevel];
      ctx.save(); ctx.translate(30, 150);
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0,0,size,size);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.strokeRect(0,0,size,size);
      ctx.beginPath(); ctx.rect(2,2,size-4,size-4); ctx.clip();
      const cx = size/2, cy = size/2;
      for(let r=0; r<layout.length; r++) {
          for(let c=0; c<layout[0].length; c++) {
              const dx = cx + (c*TILE_SIZE - p.x)*scale, dy = cy + (r*TILE_SIZE - p.y)*scale;
              if ([1, 7, 8].includes(layout[r][c])) ctx.fillStyle = '#444'; 
              else if ([11, 12].includes(layout[r][c])) ctx.fillStyle = '#33f'; 
              else if (layout[r][c] === 2) ctx.fillStyle = '#fa0'; 
              else if (layout[r][c] === 14) ctx.fillStyle = '#f00'; 
              else if (layout[r][c] === 13) ctx.fillStyle = '#fff';
              else continue;
              ctx.fillRect(dx, dy, TILE_SIZE*scale + 0.5, TILE_SIZE*scale + 0.5);
          }
      }
      ctx.fillStyle = p.isBeingDragged ? '#f00' : '#0f0'; ctx.translate(cx, cy); ctx.rotate(p.yaw);
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-6,-6); ctx.lineTo(-6,6); ctx.fill();
      ctx.restore();
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas, p = playerRef.current;
    if (escapeSequence.current.active) {
        const elapsed = Date.now() - escapeSequence.current.startTime;
        ctx.fillStyle = `rgba(255,255,255, ${Math.min(1, elapsed/1000)})`;
        ctx.fillRect(0,0,width,height);
        if (elapsed > 2000) setGameState('VICTORY');
        return;
    }

    const layout = MAP_LEVELS[p.currentLevel];
    ctx.fillStyle = '#0f0f0f'; ctx.fillRect(0,0,width,height/2+p.pitch*height);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,height/2+p.pitch*height,width,height/2-p.pitch*height);

    for(let x=0; x<NUM_RAYS; x++) {
        const cameraX = 2*x/NUM_RAYS - 1;
        const rayDirX = Math.cos(p.yaw) + Math.cos(p.yaw + Math.PI/2)*Math.tan(FOV/2)*cameraX;
        const rayDirY = Math.sin(p.yaw) + Math.sin(p.yaw + Math.PI/2)*Math.tan(FOV/2)*cameraX;
        let mapX = Math.floor(p.x/TILE_SIZE), mapY = Math.floor(p.y/TILE_SIZE);
        let sdx, sdy; const ddx = Math.abs(1/rayDirX), ddy = Math.abs(1/rayDirY);
        let stepX, stepY, hit=0, side=0, hitType=0;
        if (rayDirX < 0) { stepX=-1; sdx = (p.x/TILE_SIZE - mapX)*ddx; }
        else { stepX=1; sdx = (mapX+1.0 - p.x/TILE_SIZE)*ddx; }
        if (rayDirY < 0) { stepY=-1; sdy = (p.y/TILE_SIZE - mapY)*ddy; }
        else { stepY=1; sdy = (mapY+1.0 - p.y/TILE_SIZE)*ddy; }
        while(hit===0) {
            if (sdx < sdy) { sdx+=ddx; mapX+=stepX; side=0; } else { sdy+=ddy; mapY+=stepY; side=1; }
            if (mapY<0 || mapY>=layout.length || mapX<0 || mapX>=layout[0].length) { hit=1; }
            else if ([1,7,8,11,12,13].includes(layout[mapY][mapX])) { hit=1; hitType=layout[mapY][mapX]; }
        }
        const dist = side===0 ? (mapX - p.x/TILE_SIZE + (1-stepX)/2)/rayDirX : (mapY - p.y/TILE_SIZE + (1-stepY)/2)/rayDirY;
        zBuffer.current[x] = dist;
        const hH = Math.floor((height*1.8)/dist), horizon = height/2 + p.pitch*height;
        let c = hitType === 13 ? 255 : ([11,12].includes(hitType) ? 120 : 180); if (side===1) c*=0.8;
        const br = Math.min(1, 8/dist); const fc = Math.floor(c*br);
        ctx.fillStyle = `rgb(${fc},${fc},${fc})`;
        ctx.fillRect(x*(width/NUM_RAYS), -hH/2+horizon, Math.ceil(width/NUM_RAYS), hH);
    }

    const visible = entitiesRef.current.filter(e=>e.active && e.level===p.currentLevel).map(e=>({...e, d:Math.hypot(p.x-e.x, p.y-e.y)}));
    if (enemyRef.current.active) visible.push({...enemyRef.current, d:Math.hypot(p.x-enemyRef.current.x, p.y-enemyRef.current.y)} as any);
    visible.sort((a,b)=>b.d - a.d).forEach(s=>{
        const sx = s.x-p.x, sy = s.y-p.y;
        const planeX = Math.cos(p.yaw+Math.PI/2)*Math.tan(FOV/2), planeY = Math.sin(p.yaw+Math.PI/2)*Math.tan(FOV/2);
        const det = 1/(planeX*Math.sin(p.yaw) - Math.cos(p.yaw)*planeY);
        const tx = det*(Math.sin(p.yaw)*sx - Math.cos(p.yaw)*sy), ty = det*(-planeY*sx + planeX*sy);
        if (ty <= 0) return;
        const scrX = Math.floor((width/2)*(1+tx/ty)), sh = Math.abs(Math.floor(height/(ty/TILE_SIZE))), sw = sh;
        const horizon = height/2 + p.pitch*height;
        const idx = Math.floor(scrX/(width/NUM_RAYS));
        if (idx>=0 && idx<NUM_RAYS && ty/TILE_SIZE < zBuffer.current[idx]) {
            const br = Math.min(1, 10/(ty/TILE_SIZE)); ctx.save(); ctx.globalAlpha = br;
            if (s.type==='ENEMY') { 
                const img = texturesRef.current['ghost']; if(img?.complete) ctx.drawImage(img, scrX-sw/2, -sh*0.85+horizon, sw, sh*1.7); 
            }
            else if (s.type==='KEY') { ctx.fillStyle='gold'; ctx.beginPath(); ctx.arc(scrX, horizon, sw/4, 0, 7); ctx.fill(); }
            else if (s.type==='BANDAGE') { ctx.fillStyle='white'; ctx.fillRect(scrX-sw/4, horizon, sw/2, sw/2); ctx.fillStyle='red'; ctx.fillRect(scrX-sw/10, horizon+sw/10, sw/5, sw/5); }
            else if (s.type==='BAT') { ctx.fillStyle='#864'; ctx.fillRect(scrX-sw/2, horizon, sw, sw/8); }
            else if (s.type==='NOTE') { ctx.fillStyle='#eee'; ctx.fillRect(scrX-sw/4, horizon, sw/2, sw/2); }
            else if (s.type==='CAR') { ctx.fillStyle='#444'; ctx.fillRect(scrX-sw, horizon-sh/2, sw*2, sh); }
            ctx.restore();
        }
    });

    // Health Vignette
    const injuryAlpha = 1 - (p.health / 100);
    const grad = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width/1.2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(150, 0, 0, ${0.2 * injuryAlpha})`);
    ctx.fillStyle = grad; ctx.fillRect(0,0,width,height);

    if (p.isBeingDragged) {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.random() * 0.2})`;
        ctx.fillRect(0,0,width,height);
    }

    if (p.hasBat && !p.isHidden) {
        ctx.save(); const swing = p.attackTimer > 0 ? Math.sin(p.attackTimer/250 * Math.PI)*150 : 0;
        ctx.translate(width*0.82 - swing, height + 50); ctx.rotate(-0.35);
        ctx.fillStyle='#543'; ctx.fillRect(-22, -160, 44, 160); ctx.fillStyle='#999'; ctx.fillRect(-35, -550, 70, 400); ctx.restore();
    }
    renderMinimap(ctx, p);
    if (isLevelTransitioning) {
        ctx.fillStyle='rgba(0,0,0,0.96)'; ctx.fillRect(0,0,width,height);
        ctx.fillStyle='red'; ctx.font='bold 110px Special Elite'; ctx.textAlign='center';
        ctx.shadowColor='black'; ctx.shadowBlur=25; ctx.fillText(transitionText, width/2, height/2); ctx.shadowBlur=0;
    }
    if (activeNote) {
        ctx.fillStyle='rgba(0,0,0,0.88)'; ctx.fillRect(0,0,width,height);
        ctx.fillStyle='white'; ctx.font='26px Special Elite'; ctx.textAlign='center';
        ctx.fillText(activeNote, width/2, height/2);
        ctx.font='18px monospace'; ctx.fillText("[CLICK TO CLOSE]", width/2, height/2 + 100);
    }
  };

  const tick = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    frameCountRef.current++; updatePlayer(); updateEnemy();
    const ctx = canvasRef.current?.getContext('2d'); if (ctx) render(ctx);
    onStatsUpdate({ 
        battery: playerRef.current.battery, 
        keysFound: playerRef.current.keys, 
        totalKeys: 12, 
        soundLevel: playerRef.current.noise, 
        health: playerRef.current.health,
        maxHealth: playerRef.current.maxHealth,
        message: currentMsgRef.current 
    });
    requestRef.current = requestAnimationFrame(tick);
  }, [gameState, isLevelTransitioning, activeNote]);

  useEffect(() => {
    if (gameState === 'PLAYING') requestRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestRef.current);
  }, [tick, gameState]);

  useEffect(() => {
    const kd = (e:KeyboardEvent) => { 
        keysInput.current[e.code] = true; 
        if(e.code === keyBindings.INTERACT) interact();
    };
    const ku = (e:KeyboardEvent) => { keysInput.current[e.code] = false; };
    const mm = (e:MouseEvent) => { 
        if (document.pointerLockElement === canvasRef.current && !deathSequence.current.active && !escapeSequence.current.active && !playerRef.current.isBeingDragged) { 
            playerRef.current.yaw += e.movementX*0.003; 
            playerRef.current.pitch = Math.max(-0.5, Math.min(0.5, playerRef.current.pitch - e.movementY*0.003)); 
        } 
    };
    const md = (e:MouseEvent) => {
        if (activeNote) { setActiveNote(null); return; }
        if (gameState==='PLAYING' && !isLevelTransitioning && !deathSequence.current.active && !escapeSequence.current.active && !playerRef.current.isBeingDragged) {
            if (document.pointerLockElement !== canvasRef.current) canvasRef.current?.requestPointerLock();
            else performAttack();
        }
    };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    document.addEventListener('mousemove', mm); document.addEventListener('mousedown', md);
    return () => {
        window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
        document.removeEventListener('mousemove', mm); document.removeEventListener('mousedown', md);
    };
  }, [gameState, isLevelTransitioning, activeNote]);

  return <canvas ref={canvasRef} width={1280} height={720} className="block w-full h-full bg-black cursor-none" />;
};
