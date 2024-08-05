uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.14159265359;
void main () {
    vec3 color = vec3(0.2);
    float alpha = 1.0 - length(gl_PointCoord.xy - 0.5) * 2.0;

    float finalAlpha = alpha * 0.05 + smoothstep(0.0, 1.0, alpha) * 0.1 + smoothstep(0.9 - fwidth(alpha), 0.9, alpha) * 0.5;

    gl_FragColor = vec4(color, finalAlpha);
}

// https://www.youtube.com/watch?v=UnaGGWV3KL4