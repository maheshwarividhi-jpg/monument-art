let scene, camera, renderer, monument, ribbon, particles = [];
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;

function init() {
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020205, 1); 
    document.body.appendChild(renderer.domElement);

    // 1. THE MONUMENT (Lilac with Neon Pink Highlights)
    const geo = new THREE.BoxGeometry(1.8, 4.5, 1.8);
    const mat = new THREE.MeshPhongMaterial({
        color: 0xc8a2c8,    // Lilac
        emissive: 0xff00ff, // Hot Pink glow
        emissiveIntensity: 0.4,
        shininess: 100,
        specular: 0xffffff
    });
    monument = new THREE.Mesh(geo, mat);
    scene.add(monument);

    // 2. THE BACKGROUND WAVES (Cyan Ribbons)
    const ribbonGeo = new THREE.PlaneGeometry(40, 15, 40, 40);
    const ribbonMat = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.15,
        wireframe: true,
        side: THREE.DoubleSide
    });
    ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.rotation.x = Math.PI / 2.5;
    ribbon.position.z = -8;
    ribbon.position.y = -2;
    scene.add(ribbon);

    // 3. THE PARTICLES (Floating Dust)
    const pGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    for(let i = 0; i < 120; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set((Math.random()-0.5)*30, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
        scene.add(p);
        particles.push(p);
    }

    // 4. THE LIGHTING
    const pinkLight = new THREE.PointLight(0xff00ff, 4, 60);
    pinkLight.position.set(10, 10, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 2, 60);
    cyanLight.position.set(-10, -5, 10);
    scene.add(cyanLight);

    scene.add(new THREE.AmbientLight(0x151515));

    animate();
}

function handleInput(x, y) {
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = -(y / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0008;

    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // Monument Rotation
    monument.rotation.y = currentX * 3.5;
    monument.rotation.x = currentY * 0.8;

    // Wave Motion
    const pos = ribbon.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
        // Creates a fluid ripple across the wireframe
        pos[i + 2] = Math.sin(pos[i] * 0.4 + time * 2) * 1.8;
    }
    ribbon.geometry.attributes.position.needsUpdate = true;

    // Particle Drift
    particles.forEach((p, i) => {
        p.position.y += Math.sin(time + i) * 0.004;
        p.position.x += Math.cos(time + i) * 0.002;
    });

    renderer.render(scene, camera);
}

// Ensure the scene stays centered on resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();