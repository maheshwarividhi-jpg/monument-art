let scene, camera, renderer, monument, ribbon;
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
let particles = [];

function init() {
    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 5;
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(20, 20, 20); 
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050510, 1); 
    document.body.appendChild(renderer.domElement);

    // 1. THE METALLIC MONUMENT (The Centerpiece)
    const geo = new THREE.BoxGeometry(1.5, 4, 1.5);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x220033
    });
    monument = new THREE.Mesh(geo, mat);
    scene.add(monument);

    // 2. THE FLUID GROUND (The Ripple)
    const ribbonGeo = new THREE.PlaneGeometry(30, 30, 64, 64);
    const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0x4400ff,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
    });
    ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.rotation.x = -Math.PI / 2;
    ribbon.position.y = -4;
    scene.add(ribbon);

    // Lights for Neon Glow
    const p1 = new THREE.PointLight(0xff00ff, 2);
    p1.position.set(10, 10, 10);
    scene.add(p1);

    const p2 = new THREE.PointLight(0x00ffff, 2);
    p2.position.set(-10, 5, 10);
    scene.add(p2);

    animate();
}

function createParticle(x, y) {
    // Converts mouse screen position to 3D world position
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    const pGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xe6d2ff, transparent: true });
    const particle = new THREE.Mesh(pGeo, pMat);
    
    particle.position.set(pos.x, pos.y, pos.z);
    scene.add(particle);
    particles.push({ mesh: particle, life: 1.0 });
}

function animate() {
    requestAnimationFrame(animate);

    // Fluid Easing
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // Monument Movement
    monument.rotation.y = currentX * 4;
    monument.rotation.x = currentY * 2;

    // Ground Ripple
    const time = Date.now() * 0.001;
    const positions = ribbon.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = Math.sin(positions[i] * 0.3 + time) * 0.7;
    }
    ribbon.geometry.attributes.position.needsUpdate = true;

    // Starburst Cursor Logic
    createParticle(targetX * 2, -targetY * 2);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life -= 0.02;
        particles[i].mesh.scale.set(particles[i].life, particles[i].life, particles[i].life);
        particles[i].mesh.material.opacity = particles[i].life;
        if (particles[i].life <= 0) {
            scene.remove(particles[i].mesh);
            particles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

init();