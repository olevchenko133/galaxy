import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let mixer = undefined;     // Three.JS AnimationMixer
let Player_anim_IDLE = undefined;    // Animation IDLE
let Player_anim_RUN = undefined;    // Animation RUN
let MainPlayer = undefined // Mesh
let rocket;
THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new dat.GUI()


const parameters = {
    materialColor: '#ffeded'
}
gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()

//3D Objects
const gltfLoader = new GLTFLoader();


// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         const children = [...gltf.scene.children]
//         for (const child of children) {
//             scene.add(child)
//         }
//     },
// )


//Importing model
const textureLoader = new THREE.TextureLoader();

//Rocket 1
const colorTexture = textureLoader.load('/textures/rocket/Ship_BaseColor.png')
const heightTexture = textureLoader.load('/textures/rocket/Height.png')
const metallicTexture = textureLoader.load('/textures/rocket/Ship_BaseColor.png')
const roughnessTexture = textureLoader.load('/textures/rocket/Ship_Roughness.png')
const normalTexture = textureLoader.load('/textures/rocket/Ship_Normal.png')

// Grsdient
const gradientTexture = textureLoader.load('textures/gradients/5.jpg')
// gradientTexture.magFilter = THREE.NearestFilter;
// gradientTexture.wrapS = THREE.RepeatWrapping;
// gradientTexture.wrapT = THREE.RepeatWrapping;
// gradientTexture.repeat.set(140, 140);

//Adding rocket

gltfLoader.load('/models/Rocket/rocket2.glb', function (gltf) {
    mixer = new THREE.AnimationMixer(gltf.scene);

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

    // rocket.rotation.x = 0;
    // rocket.position.y = -10;
    // rocket.rotation.z = 0;
    scene.add(rocket);
    gltf.scene.scale.set(2, 2, 2)
    gltf.scene.position.set(1, -10, 2)
    // gltf.scene.rotation.set(1, 2, 0)

}, undefined, function (error) {

    console.error(error);

});


const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture,
})

const objectsDistance = 4;

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance * 1;
mesh3.position.y = - objectsDistance * 2;

mesh1.position.x = 2
mesh2.position.x = -2;
mesh3.position.x = 2;


scene.add(mesh1, mesh2, mesh3)


const sectionMeshes = [mesh1, mesh2, mesh3];

//particles 

const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))


const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)



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
camera.position.z = 6
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


// Scroll
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / sizes.height);

    if (newSection != currentSection) {
        currentSection = newSection;

        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 2,
            ease: 'power4.inOut',
            x: '+=5',
            y: '+=3',
            z: '+=0.5',
        })
    }
})




const count = 1000;

const particlesPositions = new Float32Array(count * 3);
const particlesColors = new Float32Array(count * 3);

//FOO LOOP
// for (let i = 0; i < count * 3; i++) {
//     particlesPositions[i] = (Math.random() - 0.5) * 4;
//     // color is from 0 to 1
//     particlesColors[i] = Math.random();
// }

// // const particlesGeometry1 = new THREE.SphereBufferGeometry(1, 32, 32);
// const particlesMaterial1 = new THREE.PointsMaterial({
//     size: 0.1,
//     // Perspective
//     sizeAttenuation: true,
//     // NOT MAP - Alpha map
//     transparent: true,
//     // alphaMap: newTexture1,
//     // alphaText: 0.01,
//     // depthTest: false,
//     depthWrite: false,
//     // blending: AdditiveBlending,
//     // To enable multicolor 
//     vertexColors: true,

// })
// const particlesGeometry1 = new THREE.SphereBufferGeometry(1, 32, 32);
// const particlesMaterial1 = new THREE.PointsMaterial({
//     color: '#f0bfff',
//     size: 0.02,
//     // Perspective
//     sizeAttenuation: true,
// })

// Alpha Test - not rendering empty pixels (black parts)

// Depth test
// The behind pixels won't be drawn
// So to fix this - depthTest we will have everything done. But all particles 
// before the objects will be visible
// Depth write
// Not to write in the Depth buffer5

// Blending!potentilly performance affcting
//Cool for spartkls
// particlesGeometry1.setAttribute(
//     "position", new THREE.BufferAttribute(particlesPositions, 3)
// )
// particlesGeometry1.setAttribute(
//     "color", new THREE.BufferAttribute(particlesColors, 3)
// )

// const particles1 = new THREE.Points(particlesGeometry1, particlesMaterial1);
// scene.add(particles1)



// const particlesGeometry2 = new THREE.SphereBufferGeometry(1, 32, 32);
// const particlesMaterial2 = new THREE.PointsMaterial({
//     size: 0.1,
//     // Perspective
//     sizeAttenuation: true,
//     // NOT MAP - Alpha map
//     // transparent: true,
//     // alphaMap: newTexture1,
//     // alphaText: 0.01,
//     // depthTest: false,
//     depthWrite: false,
//     // blending: AdditiveBlending,
//     // To enable multicolor 
//     vertexColors: true,
// })


// // points 

// const particlesCircle = new THREE.Points(particlesGeometry2, particlesMaterial2)
// scene.add(particlesCircle);
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
    camera.position.y = - scrollY / sizes.height * objectsDistance;


    const parallaxX = cursor.x;
    const parallaxY = - cursor.y;

    // disstane form the current position to the destination

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 4 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 4 * deltaTime;

    // Animate rotation 
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.2;

    }

    if (rocket) {

        rocket.rotation.y += 0.1 * 0.7;
        rocket.position.y += 2.5 * Math.sin(Math.PI - 0.5 * deltaTime);
        // console.log(rocket.position.y)

        // gsap.to(rocket.rotation, {
        //     duration: 1,
        //     ease: 'power2.inOut',
        //     x: '+=0',
        //     y: '20',
        //     z: '+=0',
        // })
        // gsap.to(rocket.position, {
        //     duration: 1,
        //     ease: 'power2.inOut',
        //     x: '+=0',
        //     y: '+=100',
        //     z: '+=1.5',
        // })
    }

    if (mixer) {
        mixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

const loop = () => {

    const t = (Date.now() % animationDuration) / animationDuration;
    const delta = targetRocketPosition * Math.sin(Math.PI * 0.2 * t);

    if (rocket) {

        // rocket.rotation.y += 0.1;
        rocket.position.y = delta * 0.2;



    }
    window.requestAnimationFrame(loop)

}
// loop()
tick()
