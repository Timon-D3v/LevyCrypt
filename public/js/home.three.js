import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import timon from "timonjs";

/**
 * Creates a new Three.js scene with a camera and renderer.
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: timon.getElm("threejs-bg"), antialias: true, alpha: true});

/**
 * Sets the pixel ratio, auto clear, clear color, and size of the renderer.
 */
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
renderer.setSize(window.innerWidth, window.innerHeight);

/**
 * Positioning the camera
 */
camera.position.z = 5;

/**
 * Add purple light to the scene.
 * The 0x7b41be refers to the hex color #7b41be.
 * This color is used in the app as the css variable --c-accent-500.
 */
const light = new THREE.AmbientLight(0x7b41be, 1000);
scene.add(light);

/**
 * This code snippet loads a GLTF model using the GLTFLoader from the Three.js library.
 * It creates a new instance of the GLTFLoader and defines a callback function to handle the loaded object.
 * The loaded object is assigned to the 'dna' variable and added to the scene.
 * The position and rotation of the 'dna' object are set, and an error callback is defined to handle any loading errors.
 * This 3D-Model is not owned by the author of this project and the license can be found under /models/license_dna.txt.
 */
const loader = new GLTFLoader();
let dna;
loader.load(
    "/models/dna.glb",
    obj => {
        dna = obj.scene;
        scene.add(dna);
        dna.position.setZ(-10);
        dna.rotation.z = 0.25;
    },
    null,
	error => console.error("An error happened:", error)
);

/**
 * Renders the scene and rotates the DNA model.
 */
function animate() {
    // Create a smooth animation loop
    requestAnimationFrame(animate);

    // Update rotation of the DNA model around the x-axis if the 'dna' object is defined
    if (typeof dna !== 'undefined') {
        dna.rotation.x += 0.0005;
    }

    // Render the scene using the renderer
    renderer.render(scene, camera);
}
animate();

/**
 * This function is triggered when the window is resized. It updates the camera's aspect ratio and projection matrix,
 * sets the renderer's size to match the window dimensions, and clears the renderer.
 */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.clear();
});