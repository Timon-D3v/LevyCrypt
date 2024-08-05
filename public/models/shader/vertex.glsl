uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D uPositions;
attribute vec2 reference;
float PI = 3.14159265359;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 20.0 * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}

// https://www.youtube.com/watch?v=UnaGGWV3KL4