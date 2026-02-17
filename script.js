let scene, camera, renderer, monumentLeft, monumentRight, lineGroup, particles;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();

    const isMobile = window.innerWidth < 768;
    const aspect = window.innerWidth / window.innerHeight;
    // Adjusted zoom for better mobile presence
    const d = isMobile ? 5.5 : 5; 
    
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(10, 10, 20); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    // 1. UPDATED PILLAR GEOMETRY & MATERIAL
    const pillarWidth = isMobile ? 1.3 : 1.4;
    const pillarHeight = isMobile ? 3.8 : 4.2;
    const geo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth);
    
    const mat = new THREE.MeshPhongMaterial({
        color: 0xffbd59,      
        specular: 0x222222,   
        shininess: 40,
        emissive: 0x110022,   
    });

    // 2. TWIN PILLARS
    const spacing = isMobile ? 1.8 : 2.2;
    
    monumentLeft = new THREE.Mesh(geo, mat);
    monumentLeft.position.x = -spacing;
    scene.add(monumentLeft);

    monumentRight = new THREE.Mesh(geo, mat);
    monumentRight.position.x = spacing;
    scene.add(monumentRight);

    // 3. EDGE-TO-EDGE SILK WAVES
    lineGroup = new THREE.Group();
    for (let j = 0; j < 55; j++) {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            points.push(new THREE.Vector3((i / 100 - 0.5) * 60, 0, 0));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: new THREE.Color().setHSL(0.75, 0.8, 0.4), 
            transparent: true, 
            opacity: 0.35 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = (j / 55 - 0.5) * 12;
        line.userData.offset = j * 0.2;
        lineGroup.add(line);
    }
    lineGroup.position.z = -5;
    scene.add(lineGroup);

    // 4. CLEAR PARTICLES
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i = 0; i < pCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 50; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.9 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 5. ADJUSTED LIGHTING
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); 
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(fillLight);

    const sideLight = new THREE.PointLight(0xbe2ed6, 2, 20); 
    sideLight.position.set(-10, 0, 5);
    scene.add(sideLight);

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

    monumentLeft.rotation.y = currentX * Math.PI;
    monumentLeft.rotation.x = currentY * Math.PI;

    monumentRight.rotation.y = -currentX * Math.PI;
    monumentRight.rotation.x = -currentY * Math.PI;

    lineGroup.children.forEach((line) => {
        const pos = line.geometry.attributes.position.array;
        for (let j = 0; j < pos.length; j += 3) {
            pos[j + 1] = Math.sin(pos[j] * 0.2 + time * 1.5 + line.userData.offset) * 1.8;
        }
        line.geometry.attributes.position.needsUpdate = true;
    });

    particles.position.x += 0.02;
    if (particles.position.x > 10) particles.position.x = -10;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const isMobile = window.innerWidth < 768;
    const aspect = window.innerWidth / window.innerHeight;
    const d = isMobile ? 5.5 : 5;
    camera.left = -d * aspect; camera.right = d * aspect;
    camera.top = d; camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();