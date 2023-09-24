import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let rocket;
THREE.ColorManagement.enabled = false

const parameters = {
    materialColor: '#ffeded'
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl-rocket')
// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xf7d9aa, 300, 950);

let particleArray = [],
    slowMoFactor = 1;

//3D Objects
const gltfLoader = new GLTFLoader();

//Importing model
const textureLoader = new THREE.TextureLoader();

//Rocket 1
const colorTexture = textureLoader.load('/textures/rocket/Ship_BaseColor.png')
const heightTexture = textureLoader.load('/textures/rocket/Height.png')
const metallicTexture = textureLoader.load('/textures/rocket/Ship_BaseColor.png')
const roughnessTexture = textureLoader.load('/textures/rocket/Ship_Roughness.png')
const normalTexture = textureLoader.load('/textures/rocket/Ship_Normal.png')

//Adding rocket

gltfLoader.load('/models/Rocket/rocket1.glb', function (gltf) {
    console.log(gltf.scene)
    if (gltf.isMesh) {
        gltf.material.set(new THREE.MeshStandardMaterial({
            // color: '0xffff00',
            map: colorTexture,
            transparent: true,
            normalMap: normalTexture,
            heightMap: heightTexture,
            metalnessMap: metallicTexture,
            roughnessMap: roughnessTexture,
        }))
    }
    rocket = gltf.scene;

    scene.add(rocket);
    gltf.scene.scale.set(15, 15, 15)
    gltf.scene.position.set(0, -1, 2)


}, undefined, function (error) {

    console.error(error);

});




// Lights

const directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight.position.set(1, 1, 3)
scene.add(directionalLight)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height;

    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 100
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,

    // transparent canvas
    alpha: true,
})
// renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Cursor 
const cursor = {}
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
})



const targetRocketPosition = 3;
const animationDuration = 2000;
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // delta time between now and previous frame

    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime

    // Animate camera
    // camera.position.y = - scrollY / sizes.height * objectsDistance;

    const parallaxX = cursor.x;
    const parallaxY = - cursor.y;

    // disstane form the current position to the destination

    // cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 4 * deltaTime;
    // cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 4 * deltaTime;

    if (rocket) {
        rocket.rotation.y += 0.01;
        setTimeout(() => {
            createSmoke(rocket);
        }, 1000);
        if (rocket.position.y < 130) {
            rocket.position.y += 0.005;
            // rocket.position.x = Math.random() * Math.PI * 0.5;
            // rocket.rotation.x = Math.random() * Math.sin(1) * 0.04;
            // rocket.rotation.z = Math.random() * Math.sin(1) * 0.04;
            // rocket.position.z = Math.random() * Math.PI * 0.5;
        } else {
            // rocket.rotation.y += Math.sin(1) * 0.02;
        }

        if (rocket.position.y > 350) {
            rocket.position.y = -30;
        }

        createFlyingParticles();
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
const getParticle = () => {
    let p;
    if (particleArray.length > 0) {
        p = particleArray.pop();
    } else {
        p = new Particle();
    }
    return p;
};

const createSmoke = (rocket) => {
    let p = getParticle();
    dropParticle(p, rocket);
};

const createFlyingParticles = () => {
    let p = getParticle();
    flyParticle(p);
};

class Particle {
    constructor() {
        this.isFlying = false;
        var scale = 2 + Math.random() * 20;
        var nLines = 3 + Math.floor(Math.random() * 5);
        var nRows = 3 + Math.floor(Math.random() * 5);
        this.geometry = new THREE.SphereGeometry(scale, nLines, nRows);

        this.material = new THREE.MeshLambertMaterial({
            color: 0xe3e3e3,
            transparent: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        recycleParticle(this);
    }
}

function recycleParticle(p) {
    p.mesh.position.x = 0;
    p.mesh.position.y = 0;
    p.mesh.position.z = 0;
    p.mesh.rotation.x = Math.random() * Math.PI * 2;
    p.mesh.rotation.y = Math.random() * Math.PI * 2;
    p.mesh.rotation.z = Math.random() * Math.PI * 2;
    p.mesh.scale.set(0.1, 0.1, 0.1);
    p.mesh.material.opacity = 0;
    p.color = 0xe3e3e3;
    p.mesh.material.color.set(p.color);
    p.material.needUpdate = true;
    scene.add(p.mesh);
    particleArray.push(p);
}
function flyParticle(p) {
    var targetPosX, targetPosY, targetSpeed, targetColor;
    p.mesh.material.opacity = 1;
    p.mesh.position.x = -1000 + Math.random() * 2000;
    p.mesh.position.y = 100 + Math.random() * 2000;
    p.mesh.position.z = -1000 + Math.random() * 1500;

    var s = Math.random() * 0.2;
    p.mesh.scale.set(s, s, s);

    targetPosX = 0;
    targetPosY = -p.mesh.position.y - 500;
    targetSpeed = 1 + Math.random() * 2;
    targetColor = 0xe3e3e3;

    gsap.to(p.mesh.position, targetSpeed * slowMoFactor, {
        x: targetPosX,
        y: targetPosY,
        ease: 'Power0.easeNone',
        onComplete: recycleParticle,
        onCompleteParams: [p]
    });
}


let cloudTargetPosX,
    cloudTargetPosY,
    cloudTargetSpeed,
    cloudTargetColor,
    cloudSlowMoFactor = 1.5;
const dropParticle = (p, rocket) => {
    p.mesh.material.opacity = 1;
    p.mesh.position.x = 0;
    p.mesh.position.y = rocket.position.y - 80;
    p.mesh.position.z = 2;

    // console.log(rocket.position.z)
    var s = Math.random(0.2) + 0.35;
    p.mesh.scale.set(0.01 * s, 0.01 * s, 0.01 * s);
    cloudTargetPosX = 0;
    cloudTargetPosY = rocket.position.y - 20;
    cloudTargetSpeed = 0.18 + Math.random() * 0.6;
    cloudTargetColor = 0xa3a3a3;

    gsap.to(p.mesh.position, 1 * cloudTargetSpeed * cloudSlowMoFactor, {
        x: cloudTargetPosX,
        y: cloudTargetPosY,
        ease: 'Power0.easeNone',
        onComplete: recycleParticle,
        onCompleteParams: [p]
    });

    gsap.to(p.mesh.scale, cloudTargetSpeed * cloudSlowMoFactor, {
        x: s * 1.8,
        y: s * 1.8,
        z: s * 1.8,
        ease: 'Power0.easeNone',

    });
};
