// === DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  const textSound = document.getElementById("textSound");
  const paragraphs = document.querySelectorAll(".tunnel-paragraph");
  const playedSoundFor = new Set();

  // === Math Utilities ===
  const Mathutils = {
    normalize: (val, min, max) => (val - min) / (max - min),
    interpolate: (normVal, min, max) => min + (max - min) * normVal,
    map: (val, min1, max1, min2, max2) => {
      val = Math.max(min1, Math.min(max1, val));
      return Mathutils.interpolate(Mathutils.normalize(val, min1, max1), min2, max2);
    }
  };

  const ww = window.innerWidth, wh = window.innerHeight;

  // === Renderer & Scene ===
  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("canvas"), antialias: true });
  renderer.setSize(ww, wh);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x194794, 0.2, 100);
  const clock = new THREE.Clock();

  const camera = new THREE.PerspectiveCamera(60, ww / wh, 0.001, 200);
  const c = new THREE.Group();
  c.position.z = 400;
  c.add(camera);
  scene.add(c);

  // === Tube Geometry ===
  const radius = 100;
  const segments = 20;
  const points = Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return new THREE.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle));
  });

  const path = new THREE.CatmullRomCurve3(points);
  path.tension = 0.2;
  path.closed = true;

  const geometry = new THREE.TubeGeometry(path, 360, 4, 64, true);
  const texture = new THREE.TextureLoader().load("tex.jpg", t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(15, 4);
  });

  const tunnelShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      texture1: { value: texture }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float offset = sin(pos.y * 5.0 + time * 2.0) * 0.2;
        pos += normal * offset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D texture1;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(texture1, vUv);
      }
    `,
    side: THREE.BackSide
  });

  const tube = new THREE.Mesh(geometry, tunnelShaderMaterial);
  scene.add(tube);

  // === Post Processing ===
  const composer = new THREE.EffectComposer(renderer);
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(ww, wh), 0.9, 0.4, 0);
  bloomPass.renderToScreen = true;
  composer.setSize(ww, wh);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // === Particle System ===
  const spikeyTexture = new THREE.TextureLoader().load("loop.webp");
  const particleCount = 9900;
  const genParticles = () => new THREE.Geometry();
  const [particles1, particles2, particles3] = [genParticles(), genParticles(), genParticles()];

  for (let i = 0; i < particleCount; i++) {
    particles1.vertices.push(new THREE.Vector3(Math.random() * 500 - 250, Math.random() * 50 - 25, Math.random() * 500 - 250));
    particles2.vertices.push(new THREE.Vector3(Math.random() * 500, Math.random() * 10 - 5, Math.random() * 500));
    particles3.vertices.push(new THREE.Vector3(Math.random() * 500, Math.random() * 10 - 5, Math.random() * 500));
  }

  const pMaterial = new THREE.ParticleBasicMaterial({
    color: 0xa1ff14,
    size: 0.7,
    map: spikeyTexture,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  const particleSystem1 = new THREE.ParticleSystem(particles1, pMaterial);
  const particleSystem2 = new THREE.ParticleSystem(particles2, pMaterial);
  const particleSystem3 = new THREE.ParticleSystem(particles3, pMaterial);
  scene.add(particleSystem1, particleSystem2, particleSystem3);

  // === Light ===
  const light = new THREE.PointLight(0xa1ff14, 0.5, 4, 0);
  scene.add(light);

  // === Scroll-based Tunnel Control ===
  let cameraRotationProxyX = 3.14159;
  let cameraRotationProxyY = 0.2;
  let cameraTargetPercentage = 0;
  let currentCameraPercentage = 0;
  const tubePerc = { percent: 0 };
  const cameraLerpSpeed = 0.05;

  function updateCameraPercentage(percentage) {
    const loopedPerc = percentage % 1;
    const p1 = path.getPointAt(loopedPerc);
    const p2 = path.getPointAt((loopedPerc + 0.01) % 1);
    c.position.set(p1.x, p1.y, p1.z);
    c.lookAt(p2);
    light.position.copy(p2);

    paragraphs.forEach((para, index) => {
      const start = parseFloat(para.dataset.start);
      const end = parseFloat(para.dataset.end);
      const visible = start < end ? loopedPerc >= start && loopedPerc < end : loopedPerc >= start || loopedPerc < end;
      para.style.opacity = visible ? 1 : 0;
      para.classList.toggle("active", visible);
      if (visible && !playedSoundFor.has(index)) {
        if (textSound) {
          textSound.currentTime = 0;
          textSound.play().catch(() => {});
        }
        playedSoundFor.add(index);
      }
    });
  }

  function render() {
    currentCameraPercentage += (cameraTargetPercentage - currentCameraPercentage) * cameraLerpSpeed;
    camera.rotation.y += (cameraRotationProxyX - camera.rotation.y) / 15;
    camera.rotation.x += (cameraRotationProxyY - camera.rotation.x) / 15;
    updateCameraPercentage(currentCameraPercentage);
    tunnelShaderMaterial.uniforms.time.value = clock.getElapsedTime();
    particleSystem1.rotation.y += 0.00002;
    particleSystem2.rotation.x += 0.00005;
    particleSystem3.rotation.z += 0.00001;
    composer.render();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // === GSAP Setup ===
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const clamp = gsap.utils.clamp(-20, 20);
  const skewSetter = gsap.quickTo(".skew", "skewY");

  gsap.to(tubePerc, {
    percent: 0.7,
    ease: "none",
    scrollTrigger: {
      trigger: ".scrollTarget",
      start: "top top",
      end: "bottom bottom",
      toggleActions: "play reverse play reverse",
      scrub: 5,
    },
    onUpdate: () => cameraTargetPercentage = tubePerc.percent
  });

  ScrollSmoother.create({
    wrapper: "#wrapper",
    content: "#content",
    smooth: 3,
    speed: 0.5,
    effects: true,
    onUpdate: self => skewSetter(clamp(self.getVelocity() / -50)),
    onStop: () => skewSetter(0)
  });

  // === Animate .tunnel-paragraph with ScrollTrigger ===
paragraphs.forEach((para, index) => {
  gsap.fromTo(para.querySelector('h1'), 
    { 
      opacity: 0, 
      y: 100,
      scale: 0.95 
    }, 
    { 
      opacity: 1, 
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: para,
        start: "top 80%",
        end: "top 30%",
        scrub: true
      }
    }
  );
});


  document.addEventListener("mousemove", evt => {
    cameraRotationProxyX = Mathutils.map(evt.clientX, 0, window.innerWidth, 3.24, 3.04);
    cameraRotationProxyY = Mathutils.map(evt.clientY, 0, window.innerHeight, -0.1, 0.1);
  });

  window.addEventListener("resize", () => {
    const width = window.innerWidth, height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const logos = document.querySelectorAll('.sponsor-logo');

  logos.forEach(logo => {
    const tl = gsap.timeline({ paused: true });
    tl.to(logo, {
      scale: 1.15,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    logo.addEventListener('mouseenter', () => tl.play());
    logo.addEventListener('mouseleave', () => tl.reverse());
  });

const scrollNextBtn = document.querySelector('.scroll-next');
if (scrollNextBtn) {
  scrollNextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollBy({
      top: window.innerHeight * 0.25,
      behavior: 'smooth'
    });
  });
}

const audio = document.getElementById("bgAudio");

function startAudio() {
  if (audio) {
    audio.play().catch(e => console.warn("Autoplay prevented:", e));
    document.removeEventListener("click", startAudio);
    document.removeEventListener("scroll", startAudio);
  } else {
    console.warn("No audio element with ID #bgAudio found.");
  }
}

document.addEventListener("click", startAudio);
document.addEventListener("scroll", startAudio);

const visible = start < end
  ? loopedPerc >= start && loopedPerc < end
  : loopedPerc >= start || loopedPerc < end;


});
