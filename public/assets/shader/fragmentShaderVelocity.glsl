uniform float time;
uniform sampler2D uTarget;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 position = texture2D(texturePosition, uv);
  vec4 velocity = texture2D(textureVelocity, uv);
  vec4 target = texture2D(uTarget, uv);

  velocity *= 0.4;
  velocity += (target - position) * 0.8;

  gl_FragColor = vec4(velocity);
}