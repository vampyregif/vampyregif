import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Base URL resolution for assets
const rawBaseUrl = import.meta.env.BASE_URL || './';
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

// ==========================================
// 1. PROJECT EXHIBIT CAROUSEL DATA
// ==========================================
// Edit your descriptions and project details here!
// This object controls what appears in the popup modal.
const floorProjectsData = {
    '1': {
        floorBadge: 'FLOOR 01',
        wingName: 'WEST WING',
        title: 'Laptop Repair & Delivery System',
        category: 'SOFTWARE DEVELOPMENT & DATABASE VISUALIZATION',
        repoUrl: 'https://github.com/vampyregif/MC-TechLink',
        description: 'I developed an efficient database visualization application using Java and JavaFX to allow students to request repairs and manage laptop deliveries. Working closely with a client to define exact success criteria—such as creating a form system, handling over one hundred data entries, and implementing full CRUD capabilities—provided me with invaluable real-world coding experience. This project also taught me the importance of methodic AI usage over unstructured "vibe coding," allowing me to methodically build and debug algorithms to clean data, remove duplicates, and automate emails. The final platform utilizes Firebase for real-time synchronization so multiple users can access information simultaneously, all running smoothly on a cross-platform JVM.',
        techStack: ['Java', 'JavaFX', 'Firebase', 'Data Algorithms', 'Cross-Platform JVM'],
        slides: [
            {
                title: 'JavaFX Dashboard & Navigation UI',
                bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                img: '/javafx-dashboard.png'
            },
            {
                title: 'Repair Request Form & Data Validation',
                bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                img: '/repair-request-img.png'
            },
            {
                title: 'Database Architecture & Search Algorithm Flow',
                bg: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                img: '/search-algo-img.png'
            }
        ]
    },
    '2': {
        floorBadge: 'FLOOR 02',
        wingName: 'EAST WING',
        title: 'TBD',
        category: 'TBD',
        description: 'TBD',
        techStack: ['None Yet!'],
        slides: [
            {
                title: 'TBD',
                bg: 'linear-gradient(135deg, #1a0c02 0%, #ff7700 100%)',
                img: `${baseUrl}{1374FDDD-C45C-48DC-89CB-0A1EBD9EF7DB}.png`
            },
            {
                title: 'TBD',
                bg: 'linear-gradient(135deg, #2a0800 0%, #b33600 100%)',
                img: ''
            },
            {
                title: 'TBD',
                bg: 'linear-gradient(135deg, #1f0500 0%, #3d1c06 100%)',
                img: ''
            }
        ]
    },
    '3': {
        floorBadge: 'FLOOR 03',
        wingName: 'TBD',
        title: 'TBD',
        category: 'TBD',
        description: 'TBD',
        techStack: ['None Yet!'],
        slides: [
            {
                title: 'TBD',
                bg: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
                img: ''
            },
            {
                title: 'TBD',
                bg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                img: ''
            }
        ]
    }
};

let currentFloorKey = 'G';
let currentSlideIndex = 0;

// ==========================================
// 2. SCENE & CAMERA SETUP
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0c02);

const BASE_FOG_DENSITY = 0.0022;
const MAX_FOG_DENSITY = 0.085;
scene.fog = new THREE.FogExp2(0x1a0c02, BASE_FOG_DENSITY);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const waypoints = {
    'G': { pos: new THREE.Vector3(0, 0, 0), target: new THREE.Vector3(-250, 0, 10000) },
    '1': { pos: new THREE.Vector3(-15, -10, 160), target: new THREE.Vector3(-160, -10, 90) },
    '2': { pos: new THREE.Vector3(-120, 20, -50), target: new THREE.Vector3(-220, 30, 0) },
    '3': { pos: new THREE.Vector3(-70, 20, 90), target: new THREE.Vector3(-200, 0, -70) },
    'room-1': { pos: new THREE.Vector3(0, 0, 0), target: new THREE.Vector3(-250, 0, 10000) },
    'room-3': { pos: new THREE.Vector3(-15, -10, 160), target: new THREE.Vector3(-160, -10, 90) },
    'room-2': { pos: new THREE.Vector3(-120, 20, -50), target: new THREE.Vector3(-220, 30, 0) },
    'room-4': { pos: new THREE.Vector3(-70, 20, 90), target: new THREE.Vector3(-200, 0, -70) }
};

const floorToRoomMap = { 'G': 'room-1', '1': 'room-3', '2': 'room-2', '3': 'room-4' };
const roomToFloorMap = { 'room-1': 'G', 'room-3': '1', 'room-2': '2', 'room-4': '3' };

let currentCamPos = waypoints['G'].pos.clone();
let currentCamTarget = waypoints['G'].target.clone();
const targetCamPos = waypoints['G'].pos.clone();
const targetCamLook = waypoints['G'].target.clone();

camera.position.copy(currentCamPos);
camera.lookAt(currentCamTarget);

let isTransitioning = false;
let transitionProgress = 0;
let transitionStartPos = currentCamPos.clone();
let transitionStartTarget = currentCamTarget.clone();

let targetGroundFactor = 1.0;
let currentGroundFactor = 1.0;

// ==========================================
// 3. UI CAROUSEL & EXHIBIT CONTROLLER
// ==========================================
function updateUIElements(destinationKey) {
    const directoryWidget = document.getElementById('ground-directory-widget');
    const exhibitModal = document.getElementById('exhibit-modal');
    const floorKey = roomToFloorMap[destinationKey] || destinationKey;
    currentFloorKey = floorKey;

    if (floorKey === 'G') {
        if (directoryWidget) directoryWidget.classList.remove('hidden');
        if (exhibitModal) exhibitModal.classList.add('hidden');
    } else {
        if (directoryWidget) directoryWidget.classList.add('hidden');
        if (exhibitModal) {
            renderExhibitModal(floorKey);
            exhibitModal.classList.remove('hidden');
        }
    }
}

function renderExhibitModal(floorKey) {
    const data = floorProjectsData[floorKey];
    if (!data) return;

    document.getElementById('exhibit-badge-floor').textContent = data.floorBadge;
    document.getElementById('exhibit-badge-wing').textContent = data.wingName;
    document.getElementById('project-title').textContent = data.title;
    document.getElementById('project-category').textContent = data.category;
    document.getElementById('project-description').textContent = data.description;

    const techContainer = document.getElementById('project-tech-tags');
    techContainer.innerHTML = data.techStack.map(tag => `<span class="tech-tag">${tag}</span>`).join('');

    // --- NEW LOGIC: Dynamic GitHub Repo Button ---
    const repoButton = document.getElementById('github-link');
    if (data.repoUrl) {
        repoButton.href = data.repoUrl;
        repoButton.style.display = 'inline-block';
    } else {
        repoButton.style.display = 'none';
    }
    // ---------------------------------------------

    const tabsContainer = document.getElementById('carousel-slide-tabs');
    tabsContainer.innerHTML = data.slides.map((_, idx) => `<button class="btn-carousel-tab ${idx === 0 ? 'active' : ''}" data-index="${idx}">${String(idx + 1).padStart(2, '0')}</button>`).join('');

    tabsContainer.querySelectorAll('.btn-carousel-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            goToSlide(idx);
        });
    });

    const track = document.getElementById('carousel-track');
    track.innerHTML = data.slides.map(slide => {
        const bgStyle = slide.img ? `background-image: url('${slide.img}');` : `background: ${slide.bg};`;
        return `
            <div class="carousel-slide" style="${bgStyle}">
                <div class="carousel-slide-title">${slide.title}</div>
            </div>
        `;
    }).join('');

    currentSlideIndex = 0;
    updateCarouselTrackPosition();
}

function updateCarouselTrackPosition() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    const tabs = document.querySelectorAll('.btn-carousel-tab');
    tabs.forEach((tab, idx) => {
        if (idx === currentSlideIndex) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

function goToSlide(index) {
    const data = floorProjectsData[currentFloorKey];
    if (!data) return;
    if (index < 0) currentSlideIndex = data.slides.length - 1;
    else if (index >= data.slides.length) currentSlideIndex = 0;
    else currentSlideIndex = index;
    updateCarouselTrackPosition();
}

document.getElementById('carousel-btn-prev')?.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
document.getElementById('carousel-btn-next')?.addEventListener('click', () => goToSlide(currentSlideIndex + 1));

function triggerTransition(destinationKey) {
    if (!waypoints[destinationKey]) return;
    transitionStartPos.copy(camera.position);
    transitionStartTarget.copy(currentCamTarget);
    targetCamPos.copy(waypoints[destinationKey].pos);
    targetCamLook.copy(waypoints[destinationKey].target);
    targetGroundFactor = (destinationKey === 'G' || destinationKey === 'room-1') ? 1.0 : 0.0;
    updateUIElements(destinationKey);
    isTransitioning = true;
    transitionProgress = 0;
}

// ==========================================
// 4. RENDERER SETUP (Fixed Pixel Ratio)
// ==========================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Resolves blurriness
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;

const canvas = renderer.domElement;
canvas.id = 'three-canvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '0';
canvas.style.filter = 'blur(1.5px)';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

// ==========================================
// 5. LIGHTING & ENVIRONMENT
// ==========================================
const ambientLight = new THREE.AmbientLight(0xff8c42, 1.25);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xff7700, 0x3d1c06, 1.5);
hemiLight.position.set(0, 100, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xff8800, 4.5);
sunLight.position.set(-100, 80, 300);
sunLight.target.position.set(-150, 0, 100);
scene.add(sunLight);
scene.add(sunLight.target);

const groundPointLight1 = new THREE.PointLight(0xff7711, 8.5, 600, 0.8);
groundPointLight1.position.set(-30, 10, 150);
scene.add(groundPointLight1);

const groundPointLight2 = new THREE.PointLight(0xffbb55, 6.5, 500, 0.8);
groundPointLight2.position.set(-120, -5, 80);
scene.add(groundPointLight2);

const groundFloorBrightener = new THREE.PointLight(0xff9933, 7.0, 500, 0.7);
groundFloorBrightener.position.set(0, 0, 0);
scene.add(groundFloorBrightener);

function createWarmWindowBackdropTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 1024; cvs.height = 1024;
    const ctx = cvs.getContext('2d');
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGradient.addColorStop(0.0, '#1a0c02');
    skyGradient.addColorStop(0.35, '#b33600');
    skyGradient.addColorStop(0.65, '#ff7700');
    skyGradient.addColorStop(0.82, '#ffcc66');
    skyGradient.addColorStop(1.0, '#3d1c06');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = '#210b02';
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 30; i++) {
        const x = (i / 30) * 1024;
        const w = 20 + Math.random() * 35;
        const h = 50 + Math.random() * 120;
        ctx.fillRect(x, 720 - h, w, h + 300);
    }
    const texture = new THREE.CanvasTexture(cvs);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const windowBackdropGeo = new THREE.PlaneGeometry(1200, 700);
const windowBackdropMat = new THREE.MeshBasicMaterial({
    map: createWarmWindowBackdropTexture(),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
    fog: false
});
const windowBackdrop = new THREE.Mesh(windowBackdropGeo, windowBackdropMat);
windowBackdrop.position.set(-280, 20, 120);
windowBackdrop.rotation.y = 50;
scene.add(windowBackdrop);

const lightRaysGroup = new THREE.Group();
function createRayTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = 128; cvs.height = 512;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, 'rgba(255, 160, 20, 0.90)');
    grad.addColorStop(0.25, 'rgba(255, 120, 0, 0.45)');
    grad.addColorStop(0.7, 'rgba(255, 80, 0, 0.15)');
    grad.addColorStop(1.0, 'rgba(200, 50, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);
    return new THREE.CanvasTexture(cvs);
}
const rayMaterial = new THREE.MeshBasicMaterial({
    map: createRayTexture(),
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false
});
const mainRayGeo = new THREE.CylinderGeometry(20, 130, 380, 32, 1, true);
mainRayGeo.translate(0, -190, 0);
const mainRayMesh = new THREE.Mesh(mainRayGeo, rayMaterial);
mainRayMesh.position.set(-170, 45, 140);
mainRayMesh.rotation.set(0.15, 0, -Math.PI / 3.2);
lightRaysGroup.add(mainRayMesh);
scene.add(lightRaysGroup);

const particleCount = 750;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleData = [];
const particleMat = new THREE.PointsMaterial({
    color: 0xffb74d,
    size: 2.5,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
});
const lightParticles = new THREE.Points(particleGeo, particleMat);
scene.add(lightParticles);

function setupCameraFacingParticles() {
    const minX = -180, maxX = 50, minY = -30, maxY = 60, minZ = -50, maxZ = 350;
    for (let i = 0; i < particleCount; i++) {
        const anchorX = THREE.MathUtils.lerp(minX, maxX, Math.random());
        const anchorY = THREE.MathUtils.lerp(minY, maxY, Math.random());
        const anchorZ = THREE.MathUtils.lerp(minZ, maxZ, Math.random());
        particlePositions[i * 3] = anchorX;
        particlePositions[i * 3 + 1] = anchorY;
        particlePositions[i * 3 + 2] = anchorZ;
        particleData.push({
            anchorX, anchorY, anchorZ,
            freqX: 0.3 + Math.random() * 0.7,
            freqY: 0.2 + Math.random() * 0.5,
            freqZ: 0.25 + Math.random() * 0.6,
            ampX: 2 + Math.random() * 5,
            ampY: 3 + Math.random() * 6,
            ampZ: 2 + Math.random() * 5,
            phase: Math.random() * Math.PI * 2
        });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
}
setupCameraFacingParticles();

// ==========================================
// 6. GLTF MODEL LOADER
// ==========================================
const textureLoader = new THREE.TextureLoader();
const externalTexture = textureLoader.load(`${baseUrl}gothic_room_texture.png`);
externalTexture.colorSpace = THREE.SRGBColorSpace;
externalTexture.flipY = false;

const gltfLoader = new GLTFLoader();
gltfLoader.setPath(baseUrl);
gltfLoader.load('gothic_room.glb', (gltf) => {
    const roomModel = gltf.scene;
    roomModel.scale.set(8, 8, 8);
    roomModel.rotation.y = Math.PI / 2;
    const box = new THREE.Box3().setFromObject(roomModel);
    const center = box.getCenter(new THREE.Vector3());
    roomModel.position.sub(center);
    roomModel.traverse((child) => {
        if (child.isMesh) {
            const mapToUse = (child.material && child.material.map) ? child.material.map : externalTexture;
            if (mapToUse) mapToUse.colorSpace = THREE.SRGBColorSpace;
            child.material = new THREE.MeshStandardMaterial({
                map: mapToUse,
                roughness: 0.65,
                metalness: 0.05,
                side: THREE.DoubleSide
            });
            child.material.needsUpdate = true;
        }
    });
    scene.add(roomModel);
});

// ==========================================
// 7. MAP & ELEVATOR SYNC
// ==========================================
function updateActiveMapRoom(roomId) {
    const brochureRooms = document.querySelectorAll('.brochure-room');
    brochureRooms.forEach(room => room.classList.remove('active'));
    const targetRoom = document.getElementById(roomId);
    if (targetRoom) {
        targetRoom.classList.add('active');
        document.getElementById('selected-room-title')?.replaceChildren(`${targetRoom.dataset.title}:`);
        document.getElementById('selected-room-desc')?.replaceChildren(targetRoom.dataset.desc);
    }
}

function updateActiveElevatorFloor(floorKey) {
    const elevatorBtns = document.querySelectorAll('.btn-elevator-line');
    elevatorBtns.forEach(btn => {
        if (btn.dataset.floor === floorKey) {
            btn.classList.add('active');
            const num = document.getElementById('current-floor-num');
            const wing = document.getElementById('wing-indicator');
            if (num) num.textContent = btn.dataset.display || floorKey;
            if (wing) wing.textContent = btn.dataset.wing || 'Gallery';
        } else {
            btn.classList.remove('active');
        }
    });
}

function initNavigationUI() {
    document.querySelectorAll('.btn-elevator-line').forEach(btn => {
        btn.addEventListener('click', () => {
            const floor = btn.dataset.floor;
            updateActiveElevatorFloor(floor);
            const rm = floorToRoomMap[floor];
            if (rm) updateActiveMapRoom(rm);
            triggerTransition(floor);
        });
    });
    document.querySelectorAll('.brochure-room').forEach(room => {
        room.addEventListener('click', (e) => {
            const roomId = e.currentTarget.id;
            updateActiveMapRoom(roomId);
            const fl = roomToFloorMap[roomId];
            if (fl) updateActiveElevatorFloor(fl);
            triggerTransition(roomId);
        });
    });
}
document.addEventListener('DOMContentLoaded', initNavigationUI);

function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

// ==========================================
// 8. ANIMATION LOOP
// ==========================================
function animate(time) {
    requestAnimationFrame(animate);
    const t = time * 0.001;

    currentGroundFactor += (targetGroundFactor - currentGroundFactor) * 0.05;
    const isGroundVisible = currentGroundFactor > 0.01;
    lightRaysGroup.visible = isGroundVisible;
    windowBackdrop.visible = isGroundVisible;
    lightParticles.visible = isGroundVisible;

    rayMaterial.opacity = 0.75 * currentGroundFactor;
    windowBackdropMat.opacity = currentGroundFactor;
    particleMat.opacity = 0.85 * currentGroundFactor;
    groundPointLight1.intensity = 8.5 * currentGroundFactor;
    groundPointLight2.intensity = 6.5 * currentGroundFactor;
    groundFloorBrightener.intensity = 7.0 * currentGroundFactor;

    if (isTransitioning) {
        transitionProgress += 0.016;
        const easedProgress = easeInOutCubic(Math.min(transitionProgress, 1.0));
        currentCamPos.lerpVectors(transitionStartPos, targetCamPos, easedProgress);
        currentCamTarget.lerpVectors(transitionStartTarget, targetCamLook, easedProgress);
        camera.position.copy(currentCamPos);
        camera.position.y += Math.sin(easedProgress * Math.PI) * 1.5;
        camera.lookAt(currentCamTarget);
        scene.fog.density = THREE.MathUtils.lerp(BASE_FOG_DENSITY, MAX_FOG_DENSITY, Math.sin(easedProgress * Math.PI));
        if (transitionProgress >= 1.0) {
            isTransitioning = false;
            scene.fog.density = BASE_FOG_DENSITY;
        }
    } else {
        currentCamPos.lerp(targetCamPos, 0.05);
        currentCamTarget.lerp(targetCamLook, 0.05);
        camera.position.copy(currentCamPos);
        camera.lookAt(currentCamTarget);
    }

    if (particleData.length > 0 && isGroundVisible) {
        const positions = lightParticles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const p = particleData[i];
            positions[i * 3]     = p.anchorX + Math.sin(t * p.freqX + p.phase) * p.ampX;
            positions[i * 3 + 1] = p.anchorY + Math.cos(t * p.freqY + p.phase) * p.ampY;
            positions[i * 3 + 2] = p.anchorZ + Math.sin(t * p.freqZ + p.phase) * p.ampZ;
        }
        lightParticles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}
animate(0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});