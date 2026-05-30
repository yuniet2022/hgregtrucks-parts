import { useRef, useEffect } from 'react';

const VERT_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_spinSpeed;
uniform float u_driftSpeed;
uniform vec2 u_mouse;

float S(float a, float b, float t) {
  return smoothstep(a, b, t);
}

mat2 rot(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noisyVortex(vec2 p, float t) {
  float r = length(p);
  float a = atan(p.y, p.x);
  float twist = 3.0 * sin(r * 2.0 - t * 0.8) * (1.0 - smoothstep(0.0, 0.3, r));
  float spiral = a + twist + t * u_spinSpeed + r * 3.0;
  float v = 0.0;
  float wt = 0.6;
  float freq = 3.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 off = vec2(sin(fi * 1.7 + t * 0.3 * u_driftSpeed) * 0.3, cos(fi * 2.3 - t * 0.25 * u_driftSpeed) * 0.3);
    vec2 rp = vec2(r * freq + fi * 7.1, spiral * (1.0 + fi * 0.15) * freq) + off;
    float n = sin(rp.x + sin(rp.y + t * u_driftSpeed * 0.2 + fi) * 0.5) * cos(rp.y * 0.7 - rp.x * 0.3 + t * 0.15);
    v += n * wt;
    wt *= 0.55;
    freq *= 1.8;
  }
  float radial = exp(-r * r * 3.0) * (1.0 - smoothstep(0.0, 0.05, r) * 0.3);
  return v * radial;
}

float bioluminescentVeins(vec2 uv, float t) {
  vec2 p = uv;
  float scale = 2.5;
  float intensity = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float angle = t * 0.1 * (0.5 + fi * 0.15) + fi * 2.4;
    vec2 dir = vec2(cos(angle), sin(angle));
    vec2 rotP = rot(t * 0.05 * (0.3 + fi * 0.1) + fi * 1.3) * p;
    float wave = sin(rotP.x * scale + t * 0.2 * (0.7 + fi * 0.2)) * cos(rotP.y * scale * 0.7 - t * 0.15);
    float vein = smoothstep(0.92, 0.98, abs(wave));
    float flow = sin(dot(p, dir) * 3.0 - t * 0.3 * (0.5 + fi * 0.1)) * 0.5 + 0.5;
    intensity += vein * flow * (0.3 / (1.0 + fi * 0.5));
    scale *= 1.4;
  }
  return intensity;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float t = u_time;

  if (u_mouse.x > 0.0) {
    vec2 mPos = (u_mouse / u_res - 0.5) * vec2(u_res.x / u_res.y, 1.0);
    p -= mPos * 0.3;
  }

  float r = length(p);
  float vortex = noisyVortex(p, t);
  float veins = bioluminescentVeins(uv * 3.0 - vec2(1.5), t);

  vec2 swirl = p + vec2(vortex * 0.3, vortex * 0.2);
  float noise = hash(swirl * 500.0 + t * 0.5);

  vec3 glowColor = vec3(0.85, 0.47, 0.024) * exp(-r * r * 4.0) * (1.0 + sin(t * 0.5) * 0.2);
  vec3 midColor = vec3(0.08, 0.08, 0.10) * S(0.15, 0.5, r) * 0.15;
  vec3 outerColor = vec3(0.04, 0.14, 0.39) * S(0.6, 1.2, r);
  vec3 col = glowColor + midColor + outerColor;

  col += vec3(0.85, 0.55, 0.15) * abs(vortex) * 0.8;
  col += vec3(0.04, 0.14, 0.39) * veins * 0.6 * S(0.0, 0.4, r);
  col += vec3(0.03, 0.03, 0.04) * noise * 0.08;

  float glow = exp(-r * r * 5.0) * 0.3;
  float pulse = sin(t * 0.8) * 0.5 + 0.5;
  vec3 glowColor2 = vec3(0.85, 0.47, 0.024) * glow * pulse + vec3(0.18, 0.35, 0.60) * glow * (1.0 - pulse);
  col += glowColor2;

  col *= (1.0 - smoothstep(0.3, 1.0, r) * 0.3);
  col = col / (1.0 + col * 0.3);

  gl_FragColor = vec4(pow(col, vec3(0.95, 1.0, 1.05)), 1.0);
}
`;

const SPIN_SPEED = 0.5;
const DRIFT_SPEED = 0.4;

export default function VortexSandstorm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let mouseX = -1;
    let mouseY = -1;
    let running = true;

    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERT_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uSpin = gl.getUniformLocation(prog, 'u_spinSpeed');
    const uDrift = gl.getUniformLocation(prog, 'u_driftSpeed');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    gl.uniform1f(uSpin, SPIN_SPEED);
    gl.uniform1f(uDrift, DRIFT_SPEED);

    function resize() {
      const w = canvas!.clientWidth * dpr;
      const h = canvas!.clientHeight * dpr;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
      }
    }

    function render(now: number) {
      if (!running) return;
      resize();
      gl!.uniform1f(uTime, now * 0.001);
      gl!.uniform2f(uMouse, mouseX, mouseY);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        mouseX = e.clientX * dpr;
        mouseY = (canvas!.clientHeight - (e.clientY - rect.top)) * dpr;
      } else {
        mouseX = -1;
        mouseY = -1;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(render);

    return () => {
      running = false;
      window.removeEventListener('mousemove', onMouseMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
