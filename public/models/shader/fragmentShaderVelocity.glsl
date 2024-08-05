uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D(texturePosition, uv).xyz;
    vec3 velocity = texture2D(textureVelocity, uv).xyz;
    gl_FragColor = vec4(velocity, 1.0);
}

// https://www.youtube.com/watch?v=UnaGGWV3KL4