import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { getElm, createElm } from "timonjs";
import * as diskSampling from "https://cdn.jsdelivr.net/gh/kchapelier/poisson-disk-sampling@2.3.1/build/poisson-disk-sampling.min.js";
console.log(diskSampling);


/**
 * Basically this:
 * import fragment from "../models/shader/fragment.glsl";
 * import vertex from "../models/shader/vertex.glsl";
 * import fragmentShaderPosition from "../models/shader/fragmentShaderPosition.glsl";
 * import fragmentShaderVelocity from "../models/shader/fragmentShaderVelocity.glsl";
 * I need to do this because MIME type of .glsl files is not supported by the browser.
 */
const getShader = async path => {
    const response = await fetch(path);
    return await response.text();
};
const fragment = await getShader("/models/shader/fragment.glsl");
const vertex = await getShader("/models/shader/vertex.glsl");
const fragmentShaderPosition = await getShader("/models/shader/fragmentShaderPosition.glsl");
const fragmentShaderVelocity = await getShader("/models/shader/fragmentShaderVelocity.glsl");



/**
 * Creates a new Three.js scene with a camera and renderer.
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: getElm("threejs-bg"), antialias: true, alpha: true});

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
 * Adding the orbit controls
 */
const controls = new OrbitControls(camera, renderer.domElement);

/** 
 * Adding the material
 */
const material = new THREE.ShaderMaterial({
    extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
    },
    side: THREE.DoubleSide,
    fragmentShader: fragment,
    vertexShader: vertex,
    uniforms: {
        time: { value: 0 },
        uPositions: { value: null },
        resolution: { value: new THREE.Vector4() }
    },
    transparent: true
});

/** 
 * Adding the geometry
 */
const geometry = new THREE.BufferGeometry(2, 2);

/**
 * Adding the mesh
 */
const COUNT = 32;
const TEXTURE_WIDTH = COUNT ** 2;
const PARTICLES_COUNT = TEXTURE_WIDTH;
const positions = new Float32Array(PARTICLES_COUNT * 3);
const reference = new Float32Array(PARTICLES_COUNT * 2);

for (let i = 0; i < PARTICLES_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = 0;

    reference[i * 2] = (i / PARTICLES_COUNT) / PARTICLES_COUNT;
    reference[i * 2 + 1] = ~ ~ (i / PARTICLES_COUNT) / PARTICLES_COUNT;
}

const positionAttribute = new THREE.BufferAttribute(positions, 3);
const referenceAttribute = new THREE.BufferAttribute(reference, 2);
geometry.setAttribute("position", positionAttribute);
geometry.setAttribute("reference", referenceAttribute);

const mesh = new THREE.Points(geometry, material);
scene.add(mesh);

/**
 * The image
 */
const getImage = async url => {
    const load = opt => new Promise(function (resolve, reject) {
        var finished = false;
        var image = new window.Image();
        image.onload = function onLoaded () {
            if (finished) return;
            finished = true;
            resolve(image);
        };
        image.onerror = function onError () {
            if (finished) return;
            finished = true;
            reject(new Error('Error while loading image at ' + opt.url));
        };
        if (opt.crossOrigin) image.crossOrigin = opt.crossOrigin;
        image.src = opt.url;
    });
    const image = await load({ url });
    const canvas = createElm("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = PARTICLES_COUNT;
    canvas.height = PARTICLES_COUNT;
    ctx.drawImage(image, 0, 0, PARTICLES_COUNT, PARTICLES_COUNT);
    const data = ctx.getImageData(0, 0, PARTICLES_COUNT, PARTICLES_COUNT).data;
    const array = new Array(PARTICLES_COUNT).fill().map(() => new Array(PARTICLES_COUNT).fill(0));
    for (let i = 0; i < PARTICLES_COUNT; i++) {
        for (let j = 0; j < PARTICLES_COUNT; j++) {
            array[i][j] = data[(i + PARTICLES_COUNT * j) * 4] / 255;
        }
    }
    
    const pds = new diskSampling({
        shape: [1, 1],
        minDistance: 4/400,
        maxDistance: 20/400,
        tries: 20,
        distanceFunction: (point) => {
            const dx = Math.floor(point[0] * PARTICLES_COUNT);
            const dy = Math.floor(point[1] * PARTICLES_COUNT);
            return array[dx][dy];
        },
        bias: 0
    });

    const points = pds.fill();

    console.log(points);
};
const image = getImage("/img/logo_black.png");

/**
 * GPUComputationRenderer Setup
 */
const gpuCompute = new GPUComputationRenderer(COUNT, COUNT, renderer);
const dtPosition = gpuCompute.createTexture();
const dtVelocity = gpuCompute.createTexture();
const fillPositionTexture = texture => {

    const theArray = texture.image.data;

    for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;

        theArray[ k + 0 ] = x * 2;
        theArray[ k + 1 ] = y * 2;
        theArray[ k + 2 ] = 0;
        theArray[ k + 3 ] = 1;

    }

};
const fillVelocityTexture = texture => {

    const theArray = texture.image.data;

    for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;

        theArray[ k + 0 ] = x * 10;
        theArray[ k + 1 ] = y * 10;
        theArray[ k + 2 ] = 0;
        theArray[ k + 3 ] = 1;

    }

};
fillPositionTexture(dtPosition);
fillVelocityTexture(dtVelocity);

const positionVariable = gpuCompute.addVariable("texturePosition", fragmentShaderPosition, dtPosition);
const velocityVariable = gpuCompute.addVariable("textureVelocity", fragmentShaderVelocity, dtVelocity);

gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

const positionUniforms = positionVariable.material.uniforms;
const velocityUniforms = velocityVariable.material.uniforms;

positionUniforms.time = { value: 0.0 };
velocityUniforms.time = { value: 1.0 };

gpuCompute.init();


let time = 0;
const animate = () => {
    time += 0.05;

    gpuCompute.compute();
    positionUniforms.time.value = time;
    velocityUniforms.time.value = time;

    material.uniforms.time.value = time;

    controls.update();


    material.uniforms.uPositions.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
    material.uniforms.time.value += 0.05;
    material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight, 1);

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}
animate();




// TEMP

document.querySelector("main").style.display = "none";
document.querySelector("html").attributes.item(1).value = "light";