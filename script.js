let scene, camera, renderer, monument, lineGroup, particles;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(10, 10, 20); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    // 1. RESTORED LILAC MONUMENT (Identical to previous code)
    const geo = new THREE.BoxGeometry(1.6, 4, 1.6);
    const mat = new THREE.MeshPhongMaterial({
        color: 0xc8a2c8,    // ORIGINAL LILAC
        emissive: 0xff00ff, // HOT PINK GLOW
        emissiveIntensity: 0.4,
        shininess: 100,
        specular: 0xffffff
    });
    monument = new THREE.Mesh(geo, mat);
    scene.add(monument);

    // 2. EDGE-TO-EDGE SILK WAVES (Horizontal stretch)
    lineGroup = new THREE.Group();
    const lineCount = 60; 
    for (let j = 0; j < lineCount; j++) {
        const points = [];
        // Stretched to 40 units to ensure it hits edges on all screens
        for (let i = 0; i <= 100; i++) {
            points.push(new THREE.Vector3((i / 100 - 0.5) * 40, 0, 0));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: new THREE.Color().setHSL(0.5 + (j * 0.005), 0.8, 0.5), 
            transparent: true, 
            opacity: 0.4 // INCREASED VISIBILITY
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = (j / lineCount - 0.5) * 6; 
        line.userData.offset = j * 0.15;
        lineGroup.add(line);
    }
    lineGroup.position.z = -6;
    scene.add(lineGroup);

    // 3. BRIGHTER & LARGER PARTICLES
    const pCount = 250;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i = 0; i < pCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 40; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    // Size increased to 0.08 for clear visibility
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.9 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 4. THE LIGHTING
    const pinkLight = new THREE.PointLight(0xff00ff, 5, 50);
    pinkLight.position.set(5, 5, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 4, 50);
    cyanLight.position.set(-10, -2, 5);
    scene.add(cyanLight);

    scene.add(new THREE.AmbientLight(0x222222));

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

    monument.rotation.y = currentX * 3.5;
    monument.rotation.x = currentY * 0.5;

    // Silk Line Flow
    lineGroup.children.forEach((line, i) => {
        const pos = line.geometry.attributes.position.array;
        const offset = line.userData.offset;
        for (let j = 0; j < pos.length; j += 3) {
            const x = pos[j];
            pos[j + 1] = Math.sin(x * 0.3 + time * 1.5 + offset) * 1.2;
        }
        line.geometry.attributes.position.needsUpdate = true;
    });

    // Visible Particle Motion
    particles.position.x += 0.01;
    if (particles.position.x > 5) particles.position.x = -5;

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