import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
var mouse = {x: 0, y: 0};
let rocket;
THREE.ColorManagement.enabled = false

const parameters = {
    materialColor: '#ffeded'
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.rocket-launcher')
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
const group = new THREE.Group();

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
    group.add(rocket);
    // scene.add(rocket);
    scene.add(group);
   
    gltf.scene.scale.set(10, 10, 10)
    gltf.scene.position.set(0, 0, -2)


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
camera.position.z = 180
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

   
   
        createFlyingParticles();
    }
    setTimeout(() => {
        createSmoke(rocket);
    }, 0);
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    requestAnimationFrame(tick)
}

// tick()

let Colors = {
    white: 0xffffff,
    black: 0x000000,
    red1: 0xd25138,
    red2: 0xc2533b,
    red3: 0xbf5139,
    grey: 0xd9d1b9,
    darkGrey: 0x4d4b54,
    windowBlue: 0xaabbe3,
    windowDarkBlue: 0x4a6e8a,
    thrusterOrange: 0xfea036
  };
  
let hemisphereLight, ambientLight, shadowLight, burnerLight;
const createLights = () => {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
  
    // an ambient light modifies the global color of a scene and makes the shadows softer
    ambientLight = new THREE.AmbientLight(0xccb8b4, 0.6);
    scene.add(ambientLight);
  
    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
  
    // Set the direction of the light
    shadowLight.position.set(150, 150, 0);
    shadowLight.castShadow = true;
  
    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -800;
    shadowLight.shadow.camera.right = 800;
    shadowLight.shadow.camera.top = 800;
    shadowLight.shadow.camera.bottom = -800;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1200;
  
    // res of shadow
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
  
    burnerLight = new THREE.DirectionalLight(Colors.thrusterOrange, 0.75);
  
    burnerLight.position.set(0, -5, 0);
    burnerLight.castShadow = true;
  
    burnerLight.shadow.camera.left = -100;
    burnerLight.shadow.camera.right = 100;
    shadowLight.shadow.camera.top = 100;
    burnerLight.shadow.camera.bottom = -100;
    burnerLight.shadow.camera.near = 1;
    burnerLight.shadow.camera.far = 1000;
  
    burnerLight.shadow.mapSize.width = 2048;
    burnerLight.shadow.mapSize.height = 2048;
  
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(burnerLight);
    scene.add(ambientLight);
  };
  createLights();
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
        var scale = 5 + Math.random() * 5;
        var nLines = 10 + Math.floor(Math.random() * 10);
        var nRows = 10 + Math.floor(Math.random() * 10);
        this.geometry = new THREE.SphereGeometry(scale, nLines, nRows);

        this.material = new THREE.MeshLambertMaterial({
            color: 0xe3e3e3,
            // color: 0xc2533b,
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
    group.add( p.mesh );
    particleArray.push(p);
}
function flyParticle(p) {
    var targetPosX, targetPosY, targetSpeed, targetColor;
    p.mesh.material.opacity = 1;
    p.mesh.position.x = -800 + Math.random() * 2000;
    p.mesh.position.y = 200 + Math.random() * 2000;
    p.mesh.position.z = -800+ Math.random() * 1500;

    var s = Math.random() * 0.4;
    p.mesh.scale.set(s, s, s);

    targetPosX = 0;
    targetPosY = -p.mesh.position.y - 2500;
    targetSpeed = 8 + Math.random() * 8;
    targetColor = 0xe3e3e3;

    gsap.to(p.mesh.position,{
        duration: targetSpeed * slowMoFactor, 
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
    cloudSlowMoFactor = 0.65;
const dropParticle = (p, rocket) => {
    p.mesh.material.opacity = 1;
    p.mesh.position.x = 0;
    p.mesh.position.y = rocket.position.y ;
    p.mesh.position.z = 0;


    var s = Math.random(0.2) + 0.35;
    p.mesh.scale.set(0.4 * s, 0.4 * s, 0.4 * s);
    cloudTargetPosX = 0;
    cloudTargetPosY = rocket.position.y - 90;
    cloudTargetSpeed = 0.8 + Math.random() * 0.6;
    cloudTargetColor = 0xa3a3a3;

    gsap.to(p.mesh.position,  {
        duration:1.3 * cloudTargetSpeed * cloudSlowMoFactor,
        x: cloudTargetPosX,
        y: cloudTargetPosY,
        ease: 'none',
        onComplete: recycleParticle,
        onCompleteParams: [p]
    });

    gsap.to(p.mesh.scale,  {
        duration:cloudTargetSpeed * cloudSlowMoFactor,
        x: s * 1.6,
        y: s * 1.6,
        z: s * 1.6,
        ease: 'ease',

    });
};

function onMouseMove(event) {

	// Update the mouse variable
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

 // Make the sphere follow the mouse
  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	group.position.copy(pos);
  
	// Make the sphere follow the mouse
//	mouseMesh.position.set(event.clientX, event.clientY, 0);
};
document.addEventListener('mousemove', onMouseMove, false);