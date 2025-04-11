import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { getElm, on, createElm } from "timonjs";
import PoissonDiskSampling from '../assets/pds/pds.js';

/**
 * Basically this:
 * import fragment from "../assets/shader/fragment.glsl";
 * import vertex from "../assets/shader/vertex.glsl";
 * import fragmentShaderPosition from "../assets/shader/fragmentShaderPosition.glsl";
 * import fragmentShaderVelocity from "../assets/shader/fragmentShaderVelocity.glsl";
 * I need to do this because MIME type of .glsl files is not supported by the browser.
 */
const getShader = async url => {
    const response = await fetch(url);
    return await response.text();
};
const fragment = await getShader("/assets/shader/fragment.glsl");
const vertex = await getShader("/assets/shader/vertexParticles.glsl");
const fragmentShaderPosition = await getShader("/assets/shader/fragmentShaderPosition.glsl");
const fragmentShaderVelocity = await getShader("/assets/shader/fragmentShaderVelocity.glsl");



// Constants
const COUNT = 128;
const TEXTURE_WIDTH = COUNT ** 2;
const POINTS = [
    await getPoints("/img/logo_black.png"),
    await getPoints("/img/logo_timondev_text.png"),
    await getPoints("/img/logo_black_text.png"),
    await getPoints("/img/logo_timondev.png"),
    await getPoints("/img/credits.png"),
];
const POSITIONS = new Float32Array(TEXTURE_WIDTH * 3);
const REFERENCE = new Float32Array(TEXTURE_WIDTH * 2);
const THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    canvas: getElm("threejs-bg"),
    antialias: true,
    alpha: true,
});
const camera = new THREE.PerspectiveCamera(
    30,
    1 / 1,
    0.1,
    10
);
// const controls = new OrbitControls(
//     camera,
//     renderer.domElement
// );
const dracoLoader = new DRACOLoader(
    new THREE.LoadingManager()
);
const gltfLoader = new GLTFLoader();
const gpuCompute = new GPUComputationRenderer(
    COUNT,
    COUNT,
    renderer
);
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
        time: { value: 0 },
        uPositions: { value: null },
        resolution: { value: new THREE.Vector4() },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    vertexShader: vertex,
    fragmentShader: fragment,
});
const geometry = new THREE.BufferGeometry();
const DT_POSITIONS = [];
const TARGETS = [];
const DT_VELOCITY = gpuCompute.createTexture();



// THREE.js Setup
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
renderer.setSize(getSize(), getSize());

camera.position.set(0, 0, 4);

dracoLoader.setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/`);

gltfLoader.setDRACOLoader(dracoLoader);

for (let i = 0; i < POINTS.length; i++) {

    DT_POSITIONS.push(gpuCompute.createTexture());
    TARGETS.push(gpuCompute.createTexture());

    fillPositionTextureFromPoints(DT_POSITIONS[i], POINTS[i]);
    fillPositionTextureFromPoints(TARGETS[i], POINTS[i]);

}

fillVelocityTexture(DT_VELOCITY);

const velocityVariable = gpuCompute.addVariable(
    "textureVelocity",
    fragmentShaderVelocity,
    DT_VELOCITY
);
const positionVariable = gpuCompute.addVariable(
    "texturePosition",
    fragmentShaderPosition,
    DT_POSITIONS[0]
);

gpuCompute.setVariableDependencies(velocityVariable, [
    positionVariable,
    velocityVariable,
]);
gpuCompute.setVariableDependencies(positionVariable, [
    positionVariable,
    velocityVariable,
]);

const positionUniforms = positionVariable.material.uniforms;
const velocityUniforms = velocityVariable.material.uniforms;

positionUniforms["time"] = { value: 0.0 };
velocityUniforms["time"] = { value: 1.0 };
velocityUniforms["uTarget"] = { value: TARGETS[0] };
velocityVariable.wrapS = THREE.RepeatWrapping;
velocityVariable.wrapT = THREE.RepeatWrapping;
positionVariable.wrapS = THREE.RepeatWrapping;
positionVariable.wrapT = THREE.RepeatWrapping;

gpuCompute.init();

for (let i = 0; i < TEXTURE_WIDTH; i++) {

    POSITIONS[i * 3 + 0] = 5 * (Math.random() - 0.5);
    POSITIONS[i * 3 + 1] = 5 * (Math.random() - 0.5);
    POSITIONS[i * 3 + 2] = 0;

    REFERENCE[i * 2 + 0] = (i % COUNT) / COUNT;
    REFERENCE[i * 2 + 1] = ~~(i / COUNT) / COUNT;

}

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(POSITIONS, 3)
);
geometry.setAttribute(
    "reference",
    new THREE.BufferAttribute(REFERENCE, 2)
);

const plane = new THREE.Points(geometry, material);

scene.add(plane);

let time = 0;



// Render the scene
render();



// Event Listeners
let activeElement = 0;
on(document, "click", () => {
    activeElement === POINTS.length - 1 ? activeElement = 0 : activeElement++;

    velocityUniforms["uTarget"] = { value: TARGETS[activeElement] };
});

on(window, "resize", () => {
    renderer.setSize(getSize(), getSize());
    camera.updateProjectionMatrix();
});




// Functions

/**
 * Loads an image from the specified URL.
 * @param {string} url - The URL of the image to load.
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded image.
 * @throws {Error} If there is an error while loading the image.
 */
function load(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Error while loading image at " + url));
        image.src = url;
    });
}

/**
 * Retrieves an array of points from the specified URL.
 * 
 * @param {string} url - The URL of the image to load.
 * @returns {Array} An array of points.
 */
async function getPoints(url) {
    const image = await load(window.location.origin + url);
    const canvas = createElm("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = COUNT;
    canvas.height = COUNT;

    ctx.drawImage(image, 0, 0, COUNT, COUNT);
    
    const { data } = ctx.getImageData(0, 0, COUNT, COUNT);

    // 2 dimensional array
    const array = new Array(COUNT).fill().map(() => new Array(COUNT).fill(0));

    for (let i = 0; i < COUNT; i++) {

        for (let j = 0; j < COUNT; j++) {
            
            const position = (i + j * COUNT) * 4;
            array[i][j] = data[position] / 255;

        }

    }

    const pds = new PoissonDiskSampling({
        shape: [1, 1],
        minDistance: 1 / 400,
        maxDistance: 4 / 400,
        tries: 20,
        distanceFunction: point => {
            const indexX = Math.floor(point[0] * COUNT);
            const indexY = Math.floor(point[1] * COUNT);
            return array[indexX][indexY];
        },
        bias: 0
    });

    let points = pds.fill();

    points.sort(() => Math.random() - 0.5);

    points = points.slice(0, TEXTURE_WIDTH);

    points = points.map(point => {
        let indexX = Math.floor(point[0] * COUNT);
        let indexY = Math.floor(point[1] * COUNT);
        return [point[0], point[1], array[indexX][indexY]];
    });

    return points;
}

/**
 * Fills a position texture from an array of points.
 * 
 * @param {Texture} texture - The texture to fill.
 * @param {Array} points - The array of points.
 */
function fillPositionTextureFromPoints(texture, points) {
    const array = texture.image.data;
    
    for (let i = 0; i < array.length; i += 4) {

        let j = i / 4;

        array[i + 0] = 2 * (points[j][0] - 0.5);
        array[i + 1] = -2 * (points[j][1] - 0.5);
        array[i + 2] = 0;
        array[i + 3] = points[j][2];

    }
}

/**
 * Fills the given texture with random velocity values.
 * 
 * @param {Texture} texture - The texture to fill.
 * @returns {void}
 */
function fillVelocityTexture(texture) {

    const array = texture.image.data;

    for (let i = 0; i < array.length; i += 4) {

        array[i + 0] = 0.01 * (Math.random() - 0.5);
        array[i + 1] = 0.01 * (Math.random() - 0.5);
        array[i + 2] = 0;
        array[i + 3] = 1;

    }
}

/**
 * Renders the scene and updates the position and velocity uniforms.
 */
function render() {
    time += 0.05;

    gpuCompute.compute();
    positionUniforms["time"].value = time;
    velocityUniforms["time"].value = time;

    const { texture } = gpuCompute.getCurrentRenderTarget(positionVariable)

    material.uniforms.uPositions.value = texture;
    material.uniforms.time.value = time;

    requestAnimationFrame(render);

    renderer.render(scene, camera);
}

/**
 * Returns the size of the smaller window direction (x || y).
 * @returns {number} The size of the smaller window direction (x || y).
 */
function getSize() {
    if (window.innerHeight - 80 > window.innerWidth) {
        return window.innerWidth;
    } else {
        return window.innerHeight - 80;
    }
}