let scene, camera, renderer, monument, ribbons = [], particles = [];
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010103, 1);
    // Added for better color depth
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    // 1. THE PREMIUM MONUMENT (Metallic Lilac with Deep Shadows)
    const geo = new THREE.BoxGeometry(1.8, 4.5, 1.8);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x9370DB,    // Deep Lilac
        metalness: 0.9,     // High reflection
        roughness: 0.1,     // Smooth "Premium" finish
        emissive: 0xff00ff,
        emissiveIntensity: 0.1
    });
    monument = new THREE.Mesh(geo, mat);
    scene.add(monument);

    // 2. HORIZONTAL METALLIC RIBBONS (Abstract & Fluid)
    const ribbonCount = 3;
    for(let i = 0; i < ribbonCount; i++) {
        const rGeo = new THREE.PlaneGeometry(40, 0.5, 100, 1);
        const rMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            metalness: 1,
            roughness: 0.2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        const r = new THREE.Mesh(rGeo, rMat);
        r.position.set(0, (i - 1) * 2.5, -4); // Spread horizontally
        scene.add(r);
        ribbons.push(r);
    }

    // 3. SUBTLE PARTICLES
    const pGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    for(let i=0; i<80; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set((Math.random()-0.5)*25, (Math.random()-0.5)*15, (Math.random()-0.5)*10);
        scene.add(p);
        particles.push(p);
    }

    // 4. THE LIGHTING (Essential for Shadow Depth)
    // Key Light (Pink Glow)
    const pinkLight = new THREE.PointLight(0xff00ff, 8, 50);
    pinkLight.position.set(10, 10, 10);
    scene.add(pinkLight);

    // Back Light (Cyan Edge Highlight)
    const cyanLight = new THREE.PointLight(0x00ffff, 5, 50);
    cyanLight.position.set(-10, -5, -5);
    scene.add(cyanLight);

    // Subtle Top Light for Definition
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    animate();
}

function handleInput(x, y) {
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = -(y / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // Monument Animation
    monument.rotation.y = currentX * 3.5;
    monument.rotation.x = currentY * 0.8;

    // HORIZONTAL RIBBON WAVE MOTION
    ribbons.forEach((r, idx) => {
        const pos = r.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            // Complex wave for 'Silk' feel
            const x = pos[i];
            pos[i + 2] = Math.sin(x * 0.5 + time + idx) * 1.2;
        }
        r.geometry.attributes.position.needsUpdate = true;
    });

    // Particle Drift
    particles.forEach((p, i) => {
        p.position.x += 0.01;
        if (p.position.x > 15) p.position.x = -15;
    });

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera.left = -d * aspect; camera.right = d * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();