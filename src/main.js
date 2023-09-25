import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap';
import randomColor from "randomcolor";
var conf, scene, camera, cameraCtrl, renderer;

var objects, meshes;
var trucRadius = 5, trucDepth = 0.3, trucHeight = (1 + Math.sin(Math.PI / 6)) * trucRadius;
var trucGeometry, trucMaterial;
var geometry;
var material;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  initScene();

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', onMouseMove, false);

  animate();
};
function initLights() {
    const lightIntensity = 1;
    const lightDistance = 1250;
    var light;
  
    light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    light.position.set(0, 80, 100);
    scene.add(light);
    light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    light.position.set(0, -80, 100);
    scene.add(light);
  
    light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    light.position.set(100, 0, 10);
    scene.add(light);
    light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    light.position.set(-100, 0, 10);
    scene.add(light);
  
    // light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    // light.position.set(0, 0, 100);
    // scene.add(light);
    // light = new THREE.PointLight(randomColor({ luminosity: 'light' }), lightIntensity, lightDistance);
    // light.position.set(0, 0, -100);
    // scene.add(light);
  }
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.add(new THREE.AmbientLight(0xeeeeee));

  camera.position.z = 50;

 initLights();
 initGeoMat();

  var object = new Truc();
  scene.add(object.o3d);
}



function initGeoMat() {
  var shape = new THREE.Shape();
  const y = Math.sin(-Math.PI / 6) * trucRadius;
  const x = Math.cos(Math.PI / 6) * trucRadius;
  shape.moveTo(0, trucRadius);
  shape.lineTo(-x, y);
  shape.lineTo(x, y);
  shape.lineTo(0, trucRadius);

  var extrudeSettings = { steps: 1, depth: trucDepth, bevelEnabled: false };
  geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  geometry.translate(0, 0, -trucDepth / 2);
  material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.9 });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

function Truc() {
  this.init();
}

Truc.prototype.init = function () {
  this.o3d = new THREE.Object3D();

  const dy = Math.sin(-Math.PI / 6) * trucRadius;
  const dx = Math.cos(Math.PI / 6) * trucRadius;

  meshes = [];
  const nx = 40, ny = 10;
  for (var j = 0; j < ny; j++) {
    for (var i = 0; i < nx; i++) {
      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.z = (i % 2) * Math.PI / 3;
      mesh.position.x = (nx / 2 - i - j % 2) * dx;
      mesh.position.y = (ny / 2 - j - 0.5) * trucHeight - (i % 2) * dy;
      meshes.push(mesh);
      this.o3d.add(mesh);
      mesh.tween = gsap.to(mesh.rotation,  { duration:1,y: Math.PI, ease: "", delay: 0.1 * i });
    }
  }
};

function rnd(max, negative) {
  return negative ? Math.random() * 2 * max - max : Math.random() * max;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(meshes);

  for (var i = 0; i < intersects.length; i++) {
    var o = intersects[i].object;
    if (o.tween && o.tween.isActive()) continue;
    o.tween = gsap.to(o.rotation, { duration:1, y: o.rotation.y + Math.PI, ease: "none" });
  }
}

init();