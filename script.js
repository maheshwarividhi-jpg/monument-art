let scene, camera, renderer, monumentLeft, monumentCenter, monumentRight, lineGroup, particles;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();

    const isMobile = window.innerWidth < 768;
    const aspect = window.innerWidth / window.innerHeight;
    const d = isMobile ? 6 : 5; 
    
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(10, 10, 20); 
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // --- CHANGE 1: CALM BACKGROUND ---
    // Swapping black for a soft "Monument Valley" cream
    renderer.setClearColor(0xfaf9f6, 1); 
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    const pillarWidth = isMobile ? 1.1 : 1.2;
    const pillarHeight = isMobile ? 3.5 : 4.5;
    const geo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth);
    
    // --- CHANGE 2: DEFINING YOUR 3 SHADES ---
    const matMint = new THREE.MeshPhongMaterial({ color: 0xb2d8d8, shininess: 30 });
    const matPink = new THREE.MeshPhongMaterial({ color: 0xffccbb, shininess: 30 });
    const matOrange = new THREE.MeshPhongMaterial({ color: 0xffbd59, shininess: 30 });

    const spacing = isMobile ? 2.0 : 2.5;
    
    // --- CHANGE 3: THE TRIPLE MONUMENTS ---
    monumentLeft = new THREE.Mesh(geo, matMint);
    monumentLeft.position.x = -spacing;
    scene.add(monumentLeft);

    monumentCenter = new THREE.Mesh(geo, matPink);
    monumentCenter.position.x = 0;
    monumentCenter.position.y = -0.5; // Slight stagger for geometry
    scene.add(monumentCenter);

    monumentRight = new THREE.Mesh(geo, matOrange);
    monumentRight.position.x = spacing;
    scene.add(monumentRight);

    // 4. SILK WAVES (Updated color to match your palette)
    lineGroup = new THREE.Group();
    for (let j = 0; j < 40; j++) {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            points.push(new THREE.Vector3((i / 100 - 0.5) * 60, 0, 0));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x8a00c2, // Using your deep violet for the lines
            transparent: true, 
            opacity: 0.15 
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.y = (j / 40 - 0.5) * 15;
        line.userData.offset = j * 0.2;
        lineGroup.add(line);
    }
    lineGroup.position.z = -5;
    scene.add(lineGroup);

    // 5. PARTICLES (Made them look like floating dust)
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i = 0; i < pCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 40; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x8a00c2, size: 0.05, transparent: true, opacity: 0.4 });
    particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 6. LIGHTING (Warmer for ASMR vibe)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(fillLight);

    animate();
}

function handleInput(x, y) {
    targetX = (x / window.innerWidth) * 2 - 1;
    targetY = (y / window.innerHeight) * 2 - 1;
}

window.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // --- CHANGE 4: DIFFERENT MOTIONS FOR EACH PILLAR ---
    // Left tilts left, Center spins, Right tilts right
    monumentLeft.rotation.y = currentX * 2;
    monumentLeft.rotation.z = Math.sin(time * 0.5) * 0.1;

    monumentCenter.rotation.x = currentY * 2;
    monumentCenter.rotation.y = time * 0.2; // Slow constant spin

    monumentRight.rotation.y = -currentX * 2;
    monumentRight.rotation.z = -Math.sin(time * 0.5) * 0.1;

    lineGroup.children.forEach((line) => {
        const pos = line.geometry.attributes.position.array;
        for (let j = 0; j < pos.length; j += 3) {
            pos[j + 1] = Math.sin(pos[j] * 0.1 + time + line.userData.offset) * 1.2;
        }
        line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

// ... Keep your resize listener from the original script ...
init();