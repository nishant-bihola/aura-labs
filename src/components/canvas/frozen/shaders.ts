/**
 * Hand-written GLSL for the Aura Labs frozen world.
 * Simplex noise: Ashima Arts / Ian McEwan (MIT, standard implementation).
 */

export const simplex3 = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/* ------------------------------------------------------------------ */
/* Fresnel ice — mobile fallback for the transmission material.        */
/* Faceted, iridescent, lit by two virtual rim lights.                 */
/* ------------------------------------------------------------------ */
export const iceVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const iceFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColorDeep;
uniform vec3 uColorIce;
uniform vec3 uColorRim;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vWorld;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.4);

  // two cool virtual lights for facet definition
  float l1 = pow(max(dot(n, normalize(vec3(0.6, 0.8, 0.4))), 0.0), 2.0);
  float l2 = pow(max(dot(n, normalize(vec3(-0.7, -0.2, 0.6))), 0.0), 3.0);

  // thin-film style iridescence riding the fresnel band
  float irid = sin(fres * 9.0 + vWorld.y * 1.5 + uTime * 0.25);
  vec3 iridCol = mix(vec3(0.45, 0.65, 1.0), vec3(0.75, 0.55, 1.0), irid * 0.5 + 0.5);

  vec3 col = uColorDeep;
  col = mix(col, uColorIce, l1 * 0.55 + l2 * 0.3);
  col += iridCol * fres * 0.55;
  col += uColorRim * pow(fres, 3.0) * 1.4;

  gl_FragColor = vec4(col, 0.96);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------ */
/* Snow / abyss dust particles.                                        */
/* ------------------------------------------------------------------ */
export const snowVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;
varying float vFade;

void main() {
  vec3 p = position;
  float t = uTime * aSpeed;
  // slow sink with sinuous lateral drift, wrapped in a 24-unit column
  p.y = mod(p.y - t * 0.45 + 12.0, 24.0) - 12.0;
  p.x += sin(t * 0.6 + aOffset * 6.2831) * 0.6;
  p.z += cos(t * 0.4 + aOffset * 6.2831) * 0.6;

  vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = -mv.z;
  gl_PointSize = aScale * uPixelRatio * (38.0 / dist);
  vFade = smoothstep(26.0, 4.0, dist) * smoothstep(12.0, 9.0, abs(p.y));
}
`;

export const snowFragment = /* glsl */ `
uniform vec3 uColor;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.08, d);
  if (disc < 0.01) discard;
  gl_FragColor = vec4(uColor, disc * vFade * 0.85);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------ */
/* Aurora veil — a vast slow nebula plane far behind the monolith.     */
/* ------------------------------------------------------------------ */
export const auroraVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const auroraFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;
${simplex3}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.04;
  float n1 = snoise(vec3(uv * vec2(1.6, 3.2), t));
  float n2 = snoise(vec3(uv * vec2(3.0, 6.0) + 4.7, t * 1.6));
  float band = smoothstep(0.15, 0.85, uv.y) * smoothstep(1.0, 0.55, uv.y);
  float glow = band * (n1 * 0.5 + 0.5) * (n2 * 0.35 + 0.65);

  vec3 blue = vec3(0.18, 0.45, 0.85);
  vec3 violet = vec3(0.42, 0.30, 0.95);
  vec3 teal = vec3(0.15, 0.85, 0.75);
  vec3 col = mix(blue, violet, n1 * 0.5 + 0.5);
  col = mix(col, teal, pow(max(n2, 0.0), 2.0) * 0.4);

  float edgeFade = smoothstep(0.0, 0.25, uv.x) * smoothstep(1.0, 0.75, uv.x);
  gl_FragColor = vec4(col * glow * uIntensity * edgeFade, glow * 0.5 * edgeFade * uIntensity);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------ */
/* Ground frost plane — radial mist with creeping noise.               */
/* ------------------------------------------------------------------ */
export const frostVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const frostFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
${simplex3}

void main() {
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  float mist = snoise(vec3(c * 5.0, uTime * 0.06)) * 0.5 + 0.5;
  float falloff = smoothstep(1.0, 0.1, r);
  vec3 col = mix(vec3(0.05, 0.10, 0.16), vec3(0.35, 0.55, 0.75), mist * 0.5);
  gl_FragColor = vec4(col, falloff * mist * 0.35);
  #include <colorspace_fragment>
}
`;
