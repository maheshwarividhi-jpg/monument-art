let scene, camera, renderer, monumentLeft, monumentRight, lineGroup, particles;
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

    // 1. THE MATERIAL (Restored Bulb-Lit Lilac)
    const geo = new THREE.BoxGeometry(1.4, 4, 1.4);
    const mat = new THREE.MeshPhongMaterial({
        color: 0xc8a2c8,
        emissive: 0x440066,
        specular: 0xffffff, 
        shininess: 150
    });

    // 2. TWO PARALLEL PILLARS
    monumentLeft = new THREE.Mesh(geo, mat);
    monumentLeft.position.x = -2; // Shifted Left
    scene.add(monumentLeft);

    monumentRight = new THREE.Mesh(geo, mat);
    monumentRight.position.x = 2; // Shifted Right
    scene.add(monumentRight);

    // 3. EDGE-TO-EDGE SILK WAVES
    lineGroup = new THREE.Group();
    const lineCount = 55; 
    for (let j = 0; j < lineCount; j++) {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            points.push(new THREE.Vector3((i / 100 - 0.5) * 60, 0, 0));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: new THREE.Color().setHSL(0.5 + (j * 0.005), 0.8, 0.5), 
            transparent: true, 
            opacity: 0.45 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = (j / lineCount - 0.5) * 8; 
        line.userData.offset = j * 0.2;
        lineGroup.add(line);
    }
    lineGroup.position.z = -5;
    scene.add(lineGroup);

    // 4. HIGH VISIBILITY PARTICLES
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i = 0; i < pCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 50; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 1.0 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 5. THE "BULB" LIGHTING
    const bulbLight = new THREE.SpotLight(0xffffff, 6);
    bulbLight.position.set(0, 15, 15); // Centered to hit both pillars
    scene.add(bulbLight);

    const pinkFill = new THREE.PointLight(0xff00ff, 4, 50);
    pinkFill.position.set(-10, 5, 5);
    scene.add(pinkFill);

    scene.add(new THREE.AmbientLight(0x222222));

    animate();
}

function handleInput(x, y) {
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = (y / window.innerHeight) * 2 - 1;
}

window.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // LEFT PILLAR (Normal Rotation)
    monumentLeft.rotation.y = currentX * Math.PI * 2;
    monumentLeft.rotation.x = currentY * Math.PI * 2;

    // RIGHT PILLAR (OPPOSITE ROTATION)
    monumentRight.rotation.y = -currentX * Math.PI * 2;
    monumentRight.rotation.x = -currentY * Math.PI * 2;

    // Silk Wave Motion
    lineGroup.children.forEach((line, i) => {
        const pos = line.geometry.attributes.position.array;
        const offset = line.userData.offset;
        for (let j = 0; j < pos.length; j += 3) {
            const x = pos[j];
            pos[j + 1] = Math.sin(x * 0.2 + time * 2 + offset) * 1.5;
        }
        line.geometry.attributes.position.needsUpdate = true;
    });

    particles.position.x += 0.02;
    if (particles.position.x > 10) particles.position.x = -10;

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