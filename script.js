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
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    // 1. THE PREMIUM MONUMENT (Metallic Lilac with Sharp Depth)
    const geo = new THREE.BoxGeometry(1.6, 4, 1.6);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x9370DB,
        metalness: 1.0,
        roughness: 0.05,
        emissive: 0xff00ff,
        emissiveIntensity: 0.2
    });
    monument = new THREE.Mesh(geo, mat);
    scene.add(monument);

    // 2. THE ABSTRACT SILK WAVES (Freepik Reference Style)
    lineGroup = new THREE.Group();
    const lineCount = 50; // High density for the silk look
    for (let j = 0; j < lineCount; j++) {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            points.push(new THREE.Vector3((i / 100 - 0.5) * 20, 0, 0));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: new THREE.Color().setHSL(0.5 + (j * 0.01), 0.8, 0.5), 
            transparent: true, 
            opacity: 0.15 + (Math.random() * 0.2)
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = (j / lineCount - 0.5) * 4; // Spread across height
        line.userData.offset = j * 0.1; // Unique movement offset
        lineGroup.add(line);
    }
    lineGroup.position.z = -5;
    scene.add(lineGroup);

    // 3. CLEAR BACKGROUND PARTICLES (Star Dust)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i = 0; i < pCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 30; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.8 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 4. THE LIGHTING (The "Premium" Secret)
    const pinkLight = new THREE.PointLight(0xff00ff, 10, 50);
    pinkLight.position.set(5, 5, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 8, 50);
    cyanLight.position.set(-10, -2, 5);
    scene.add(cyanLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
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

    monument.rotation.y = currentX * 3.5;
    monument.rotation.z = currentY * 0.5;

    // SILK LINE MOTION (Multi-frequency waves)
    lineGroup.children.forEach((line, i) => {
        const pos = line.geometry.attributes.position.array;
        const offset = line.userData.offset;
        for (let j = 0; j < pos.length; j += 3) {
            const x = pos[j];
            // Three layers of sine waves for natural "flow"
            pos[j + 1] = Math.sin(x * 0.4 + time + offset) * 0.8 + 
                         Math.cos(x * 0.8 + time * 0.5) * 0.3;
        }
        line.geometry.attributes.position.needsUpdate = true;
    });

    particles.rotation.y += 0.001;

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