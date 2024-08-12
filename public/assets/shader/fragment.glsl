uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vShade;

float PI = 3.141592653589793238;

void main()	{
	vec3 color = vec3(0.25, 0.44, 0.75);
	float alpha = 1.-length(gl_PointCoord.xy - 0.5)*2.;

	float finalAlpha = alpha*0.05 + smoothstep(0.,1.,alpha)*0.1 + 0.5*smoothstep(0.9-fwidth(alpha),0.9,alpha);

	float opac = 1. - (.7*vShade);

	gl_FragColor = vec4(color,finalAlpha*opac);
}