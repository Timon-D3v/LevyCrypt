uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D uPositions;
attribute vec2 reference;
varying float vShade;

float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vec3 pos = texture2D( uPositions, reference ).xyz;

  vShade = texture2D( uPositions, reference ).w;

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
  gl_PointSize = 45. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}