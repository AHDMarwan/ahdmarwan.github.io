
// Utility math functions
var Mathutils = {
  normalize: function ($value, $min, $max) {
    return ($value - $min) / ($max - $min);
  },
  interpolate: function ($normValue, $min, $max) {
    return $min + ($max - $min) * $normValue;
  },
  map: function ($value, $min1, $max1, $min2, $max2) {
    $value = Math.max($min1, Math.min($max1, $value));
    return this.interpolate(this.normalize($value, $min1, $max1), $min2, $max2);
  }
};

var ww = window.innerWidth, wh = window.innerHeight;

var composer, params = {
  exposure: 1.3,
  bloomStrength: 0.9,
  bloomThreshold: 0,
  bloomRadius: 0
};

var renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
  shadowMapEnabled: true,
  shadowMapType: THREE.PCFSoftShadowMap
});
renderer.setSize(ww, wh);

var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x194794, 0, 100);

var camera = new THREE.PerspectiveCamera(45, ww / wh, 0.001, 200);
var cameraGroup = new THREE.Group();
cameraGroup.position.z = 400;
cameraGroup.add(camera);
scene.add(cameraGroup);

var cameraRotationProxyX = 3.14159, cameraRotationProxyY = 0;

// Bloom pass
var renderScene = new THREE.RenderPass(scene, camera);
var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(ww, wh), 1.5, 0.4, 0.85);
bloomPass.renderToScreen = true;
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer = new THREE.EffectComposer(renderer);
composer.setSize(ww, wh);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Tunnel points
var points = [
  [10, 89, 0], [50, 88, 10], [76, 139, 20],
  [126, 141, 12], [150, 112, 8], [157, 73, 0],
  [180, 44, 5], [207, 35, 10], [232, 36, 0]
].map(p => new THREE.Vector3(p[0], p[2], p[1]));

var path = new THREE.CatmullRomCurve3(points);
path.tension = 0.5;

var geometry = new THREE.TubeGeometry(path, 300, 4, 32, false);
var texture = new THREE.TextureLoader().load('t.webp', t => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.offset.set(0, 0);
  t.repeat.set(30, 2);
});
var mapHeight = new THREE.TextureLoader().load('t.webp', t => {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.offset.set(0, 0);
  t.repeat.set(30, 2);
});

var material = new THREE.MeshPhongMaterial({
  side: THREE.BackSide,
  map: texture,
  shininess: 20,
  bumpMap: mapHeight,
  bumpScale: -0.03,
  specular: 0x0b2349
});
var tube = new THREE.Mesh(geometry, material);
scene.add(tube);

// Wireframe
var innerGeometry = new THREE.TubeGeometry(path, 150, 3.4, 32, false);
var geo = new THREE.EdgesGeometry(innerGeometry);
var mat = new THREE.LineBasicMaterial({ linewidth: 2, opacity: 0.2, transparent: true });
scene.add(new THREE.LineSegments(geo, mat));

// Light
var light = new THREE.PointLight(0xffffff, 0.35, 4, 0);
light.castShadow = true;
scene.add(light);

// Starfield
function createStarfield() {
  const starCount = 5000;
  const geometry = new THREE.Geometry();

  for (let i = 0; i < starCount; i++) {
    const radius = 400 + Math.random() * 600;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    geometry.vertices.push(new THREE.Vector3(x, y, z));
  }

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = "starfield";
  scene.add(stars);
  return stars;
}






const textSound = document.getElementById("textSound");
const paragraphs = document.querySelectorAll('.tunnel-paragraph');
const playedSoundFor = new Set(); // Track which paragraphs triggered sound

function updateParagraphs(progress) {
  paragraphs.forEach((para, index) => {
    const start = parseFloat(para.dataset.start);
    const end = parseFloat(para.dataset.end);

    const isVisible = progress >= start && progress < end;

    if (isVisible) {
      if (!para.classList.contains('active')) {
        para.classList.add('active');
        para.style.opacity = 1;

        // Play sound ONLY once per paragraph
        if (!playedSoundFor.has(index)) {
          playTextSound();
          playedSoundFor.add(index);
        }
      }
    } else {
      para.classList.remove('active');
      para.style.opacity = 0;
    }
  });
}

function playTextSound() {
  if (textSound) {
    textSound.currentTime = 0;
    textSound.play().catch((e) => {
      console.log("Sound play blocked until user interacts.");
    });
  }
}

const starfield = createStarfield();

var cameraTargetPercentage = 0;
var currentCameraPercentage = 0;

// Update camera based on percentage
function updateCameraPercentage(percentage) {
  const clampedPerc = Math.min(percentage, 1.3);
  const p1 = path.getPointAt(Math.min(clampedPerc, 1));
  const p2 = path.getPointAt(Math.min(clampedPerc + 0.03, 1));

  // -- Camera movement logic remains the same --
  if (clampedPerc <= 1) {
    cameraGroup.position.set(p1.x, p1.y, p1.z);
    cameraGroup.lookAt(p2);
    light.position.set(p2.x, p2.y, p2.z);
    if (starfield) starfield.material.opacity = 1;
  } else {
    const endPoint = path.getPointAt(1);
    const beforeEndPoint = path.getPointAt(0.99);
    const forwardDir = new THREE.Vector3().subVectors(endPoint, beforeEndPoint).normalize();
    const exitProgress = (clampedPerc - 1) * 150;
    const outsidePos = endPoint.clone().add(forwardDir.clone().multiplyScalar(exitProgress));
    cameraGroup.position.copy(outsidePos);
    const lookAtPos = outsidePos.clone().add(forwardDir);
    cameraGroup.lookAt(lookAtPos);
    light.position.copy(lookAtPos);
    if (starfield && starfield.material.opacity < 1) {
      starfield.material.opacity += 0.1;
    }
    const showExitText = clampedPerc > 1.005 && clampedPerc < 1.1;
    document.getElementById("exitText").style.opacity = showExitText ? 1 : 0;
  }

  // -- Paragraph fade logic --
  const allParagraphs = document.querySelectorAll('.tunnel-paragraph');
  allParagraphs.forEach(paragraph => {
    const start = parseFloat(paragraph.dataset.start);
    const end = parseFloat(paragraph.dataset.end);
    const isVisible = clampedPerc >= start && clampedPerc < end;
    paragraph.style.opacity = isVisible ? 1 : 0;
  });

  updateParagraphs(clampedPerc);

}


// Load a planet texture (kept here but not used now)
var textureLoader = new THREE.TextureLoader();
var planetTexture = textureLoader.load('earthcloudmap.jpg');

// Create planet sphere geometry and material (not used for close-up anymore)
var planetGeometry = new THREE.SphereGeometry(4, 32, 32);
var planetMaterial = new THREE.MeshPhongMaterial({
  map: planetTexture,
  shininess: 3
});

var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

// Position the planet ahead of the tunnel exit
var endPoint = path.getPointAt(1);
var dir = new THREE.Vector3().subVectors(endPoint, path.getPointAt(0.99)).normalize();
planetMesh.position.copy(endPoint.clone().add(dir.clone().multiplyScalar(40)));

scene.add(planetMesh);

// Text mesh placeholder (if used)
var textMesh = null;



const fadePlaneMat = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0,
  depthWrite: false
});

const fadePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  fadePlaneMat
);
fadePlane.material.side = THREE.DoubleSide;
fadePlane.renderOrder = 999; // Ensure on top
fadePlane.frustumCulled = false;

const fadeScene = new THREE.Scene();
const fadeCamera = new THREE.Camera();
fadeScene.add(fadePlane);





// Fade out starfield when switching
gsap.to(starfield.material, {
  opacity: 0,
  duration: 2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".scrollTarget",
    start: "top top",
    end: "center center",
    scrub: 1
  }
});
// --- OCEAN SHADER SETUP FOR CLOSE-UP SCENE ---

const oceanVertexShader = `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
`;

const oceanFragmentShader = `
        precision highp float;

        uniform float uElapsedTime;
        uniform vec2 uViewportSize;

        const int STEPS_RAYMARCH = 8;
        const float PI_CONST = 3.1415;
        const float EPSILON_SMALL = 1e-3;
        float NORMAL_EPSILON;

        // Ocean params
        const int GEOMETRY_ITER = 3;
        const int FRAGMENT_ITER = 5;
        const float OCEAN_WAVE_HEIGHT = 0.6;
        const float OCEAN_CHOPPYNESS = 1.0;
        const float OCEAN_WAVE_SPEED = 1.0;
        const float OCEAN_WAVE_FREQ = 0.16;
        const vec3 OCEAN_BASE_COLOR = vec3(0.1, 0.19, 0.22);
        const vec3 OCEAN_WATER_HUE = vec3(0.8, 0.9, 0.6);
        float oceanTime;

        mat2 octaveMatrix = mat2(1.6, 1.2, -1.2, 1.6);

        float generateHash(vec2 p) {
            float h = dot(p, vec2(127.1, 311.7));
            return fract(sin(h) * 43758.5453123);
        }

        float generateNoise(vec2 p) {
            vec2 ip = floor(p);
            vec2 fp = fract(p);
            vec2 smoothStep = fp * fp * (3.0 - 2.0 * fp);
            return -1.0 + 2.0 * mix(
                mix(
                    generateHash(ip + vec2(0.0, 0.0)),
                    generateHash(ip + vec2(1.0, 0.0)), smoothStep.x),
                mix(
                    generateHash(ip + vec2(0.0, 1.0)),
                    generateHash(ip + vec2(1.0, 1.0)), smoothStep.x),
                smoothStep.y
            );
        }

        float oceanWaveLayer(vec2 uv, float choppiness) {
            uv += generateNoise(uv);
            vec2 waveVals = 1.0 - abs(sin(uv));
            vec2 waveSecondaryVals = abs(cos(uv));
            waveVals = mix(waveVals, waveSecondaryVals, waveVals);
            return pow(1.0 - pow(waveVals.x * waveVals.y, 0.65), choppiness);
        }

        float oceanHeightMap(vec3 point) {
            float frequency = OCEAN_WAVE_FREQ;
            float amplitude = OCEAN_WAVE_HEIGHT;
            float choppyFactor = OCEAN_CHOPPYNESS;
            vec2 uv = point.xz;
            uv.x *= 0.75;

            float waveHeight, totalHeight = 0.0;
            for (int i = 0; i < GEOMETRY_ITER; i++) {
                waveHeight = oceanWaveLayer((uv + oceanTime) * frequency, choppyFactor);
                waveHeight += oceanWaveLayer((uv - oceanTime) * frequency, choppyFactor);
                totalHeight += waveHeight * amplitude;
                uv *= octaveMatrix;
                frequency *= 1.9;
                amplitude *= 0.22;
                choppyFactor = mix(choppyFactor, 1.0, 0.2);
            }
            return point.y - totalHeight;
        }

        float detailedOceanHeightMap(vec3 point) {
            float frequency = OCEAN_WAVE_FREQ;
            float amplitude = OCEAN_WAVE_HEIGHT;
            float choppyFactor = OCEAN_CHOPPYNESS;
            vec2 uv = point.xz;
            uv.x *= 0.75;

            float waveHeight, totalHeight = 0.0;
            for (int i = 0; i < FRAGMENT_ITER; i++) {
                waveHeight = oceanWaveLayer((uv + oceanTime) * frequency, choppyFactor);
                waveHeight += oceanWaveLayer((uv - oceanTime) * frequency, choppyFactor);
                totalHeight += waveHeight * amplitude;
                uv *= octaveMatrix;
                frequency *= 1.9;
                amplitude *= 0.22;
                choppyFactor = mix(choppyFactor, 1.0, 0.2);
            }
            return point.y - totalHeight;
        }

        float calculateDiffuse(vec3 normal, vec3 lightDir, float power) {
            return pow(dot(normal, lightDir) * 0.4 + 0.6, power);
        }

        float calculateSpecular(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess) {
            float normalizationFactor = (shininess + 8.0) / (PI_CONST * 8.0);
            return pow(max(dot(reflect(viewDir, normal), lightDir), 0.0), shininess) * normalizationFactor;
        }

        vec3 computeSkyColor(vec3 direction) {
            direction.y = max(direction.y, 0.0);
            vec3 skyColor;
            skyColor.x = pow(1.0 - direction.y, 2.0);
            skyColor.y = 1.0 - direction.y;
            skyColor.z = 0.6 + (1.0 - direction.y) * 0.4;
            return skyColor;
        }

        vec3 calculateOceanColor(vec3 position, vec3 normal, vec3 lightDir, vec3 viewDir, vec3 distanceVec) {
            float fresnelEffect = 1.0 - max(dot(normal, -viewDir), 0.0);
            fresnelEffect = pow(fresnelEffect, 3.0) * 0.65;

            vec3 reflectedColor = computeSkyColor(reflect(viewDir, normal));
            vec3 refractedColor = OCEAN_BASE_COLOR + calculateDiffuse(normal, lightDir, 80.0) * OCEAN_WATER_HUE * 0.12;

            vec3 finalColor = mix(refractedColor, reflectedColor, fresnelEffect);

            float attenuation = max(1.0 - dot(distanceVec, distanceVec) * 0.001, 0.0);
            finalColor += OCEAN_WATER_HUE * (position.y - OCEAN_WAVE_HEIGHT) * 0.18 * attenuation;

            finalColor += vec3(calculateSpecular(normal, lightDir, viewDir, 60.0));

            return finalColor;
        }

        vec3 calculateNormalAtPoint(vec3 point, float epsilon) {
            vec3 gradient;
            gradient.y = detailedOceanHeightMap(point);
            gradient.x = detailedOceanHeightMap(vec3(point.x + epsilon, point.y, point.z)) - gradient.y;
            gradient.z = detailedOceanHeightMap(vec3(point.x, point.y, point.z + epsilon)) - gradient.y;
            gradient.y = epsilon;
            return normalize(gradient);
        }

        float rayMarchHeightMap(vec3 origin, vec3 direction, out vec3 hitPoint) {
            float minDist = 0.0;
            float maxDist = 1000.0;
            float heightAtMax = oceanHeightMap(origin + direction * maxDist);

            if (heightAtMax > 0.0) {
                hitPoint = origin + direction * maxDist;
                return maxDist;
            }

            float heightAtMin = oceanHeightMap(origin + direction * minDist);
            float midDist = 0.0;
            for (int i = 0; i < STEPS_RAYMARCH; i++) {
                midDist = mix(minDist, maxDist, heightAtMin / (heightAtMin - heightAtMax));
                hitPoint = origin + direction * midDist;
                float heightAtMid = oceanHeightMap(hitPoint);
                if (heightAtMid < 0.0) {
                    maxDist = midDist;
                    heightAtMax = heightAtMid;
                } else {
                    minDist = midDist;
                    heightAtMin = heightAtMid;
                }
            }
            return midDist;
        }

        void main() {
            NORMAL_EPSILON = 0.1 / uViewportSize.x;
            oceanTime = uElapsedTime * OCEAN_WAVE_SPEED;

            vec2 uvCoord = gl_FragCoord.xy / uViewportSize.xy;
            uvCoord = uvCoord * 2.0 - 1.0;
            uvCoord.x *= uViewportSize.x / uViewportSize.y;
            float timeScaled = uElapsedTime * 0.3;

            // Camera and ray setup
            vec3 rotationAngles = vec3(
                sin(timeScaled * 3.0) * 0.1,
                sin(timeScaled) * 0.2 + 0.3,
                timeScaled
            );
            vec3 cameraPos = vec3(0.0, 3.5, timeScaled * 5.0);
            vec3 rayDir = normalize(vec3(uvCoord.xy, -2.0));
            rayDir.z += length(uvCoord) * 0.15;
            rayDir = normalize(rayDir);

            // Ray marching ocean surface intersection
            vec3 intersectionPoint;
            rayMarchHeightMap(cameraPos, rayDir, intersectionPoint);
            vec3 distanceVector = intersectionPoint - cameraPos;
            vec3 normalVector = calculateNormalAtPoint(
                intersectionPoint,
                dot(distanceVector, distanceVector) * NORMAL_EPSILON
            );
            vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.8));

            // Compute final color blending sky and ocean
            vec3 finalColor = mix(
                computeSkyColor(rayDir),
                calculateOceanColor(intersectionPoint, normalVector, lightDirection, rayDir, distanceVector),
                pow(smoothstep(0.0, -0.05, rayDir.y), 0.3)
            );

            // Apply gamma correction and output color
            gl_FragColor = vec4(pow(finalColor, vec3(0.75)), 1.0);
        }
`;

const oceanUniforms = {
  uElapsedTime: { value: 0.0 },
  uViewportSize: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};



const oceanMaterial = new THREE.ShaderMaterial({
  vertexShader: oceanVertexShader,
  fragmentShader: oceanFragmentShader,
  uniforms: oceanUniforms,
  side: THREE.DoubleSide,
});

const oceanPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 40, 40),
    oceanMaterial
);
oceanPlane.rotation.x = -Math.PI / 2;


const oceanGeometry = new THREE.PlaneGeometry(40, 40, 64, 64);
const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);

// Yellow sphere for visual reference
const sphereGeo = new THREE.SphereGeometry(10, 32, 32);

const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const yellowSphere = new THREE.Mesh(sphereGeo, sphereMat);
yellowSphere.position.y = 5;


// Close-up ocean scene
let closeUpScene = new THREE.Scene();
closeUpScene.fog = new THREE.Fog(0x000d1a, 1, 100); // dark blue fog

closeUpScene.add(oceanMesh);
closeUpScene.add(yellowSphere);
closeUpScene.add(oceanPlane);

const closeUpLight = new THREE.DirectionalLight(0xffffff, 0.8);
closeUpLight.position.set(10, 10, 10);
closeUpScene.add(closeUpLight);

const closeUpAmbientLight = new THREE.AmbientLight(0x202040);
closeUpScene.add(closeUpAmbientLight);

let closeUpCamera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 1000);
closeUpCamera.position.set(0, 15, 30);
closeUpCamera.lookAt(new THREE.Vector3(0, 0, 0));

let useCloseUpScene = false;
const SWITCH_THRESHOLD = 1.22;

// GSAP scroll control
gsap.registerPlugin(ScrollTrigger);
gsap.defaultEase = Linear.easeNone;

var tubePerc = { percent: 0 };

gsap.timeline({
  scrollTrigger: {
    trigger: ".scrollTarget",
    start: "top top",
    end: "bottom 100%",
    scrub: 5
  }
}).to(tubePerc, {
  percent: 1.4,
  duration: 5,
  onUpdate: () => cameraTargetPercentage = tubePerc.percent
});

// Particle systems (kept unchanged)
const spikeyTexture = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/68819/spikey.png');
const pMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  map: spikeyTexture,
  transparent: true,
  blending: THREE.AdditiveBlending
});
function makeParticles() {
  const geo = new THREE.Geometry();
  for (let i = 0; i < 6800; i++) {
    geo.vertices.push(new THREE.Vector3(
      Math.random() * 500 - 250,
      Math.random() * 50 - 25,
      Math.random() * 500 - 250
    ));
  }
  return new THREE.Points(geo, pMaterial);
}
scene.add(makeParticles(), makeParticles(), makeParticles());















// Render loop
function render() {
  currentCameraPercentage = cameraTargetPercentage;
  camera.rotation.y += (cameraRotationProxyX - camera.rotation.y) / 15;
  camera.rotation.x += (cameraRotationProxyY - camera.rotation.x) / 15;
    

  const time = performance.now() * 0.001;

    // Update uniforms
  oceanUniforms.uElapsedTime.value = time;
  oceanUniforms.uViewportSize.value.set(window.innerWidth, window.innerHeight);
    // Update camera position based on percentage


  updateCameraPercentage(currentCameraPercentage);

  if (currentCameraPercentage >= SWITCH_THRESHOLD) {
    useCloseUpScene = true;
  } else {
    useCloseUpScene = false;

  }


  if (!useCloseUpScene) {
    composer.render();
    if (planetMesh) planetMesh.rotation.y += 0.01;
    renderer.domElement.style.display = "block";
    fadePlane.material.opacity = 0; // Hide fade plane in normal scene
    fadePlane.material.visible = false;
    fadePlane.position.set(0, 0, 0); // Reset position
    fadePlane.scale.set(2, 2, 1); // Reset scale
    fadePlane.rotation.set(0, 0, 0); // Reset rotation
    fadePlane.frustumCulled = false; // Ensure it renders
    fadePlane.renderOrder = 999; // Ensure it renders on top
    fadePlane.material.side = THREE.DoubleSide; // Ensure both sides are rendered
    fadePlane.material.transparent = true; // Ensure transparency works
    fadePlane.material.depthWrite = false; // Disable depth writing for fade plane
    fadePlane.material.visible = true; // Ensure fade plane is visible
    fadePlane.position.set(0, 0, -1); // Position it in front
    renderer.render(scene, camera);

  } else {

    closeUpCamera.position.x = Math.sin(time * 0.3) * 30;
    closeUpCamera.position.z = Math.cos(time * 0.3) * 30;
    closeUpCamera.lookAt(new THREE.Vector3(0, 0, 0));
    fadePlane.material.opacity = 1; // Show fade plane in close-up scene
    fadePlane.position.set(0, 0, -1); // Position it in front
    fadePlane.scale.set(2, 2, 1); // Scale it to cover the view
    fadePlane.rotation.set(0, 0, 0); // Reset rotation
    fadePlane.frustumCulled = false; // Ensure it renders
    fadePlane.renderOrder = 999; // Ensure it renders on top
    fadePlane.material.side = THREE.DoubleSide; // Ensure both sides are rendered
    fadePlane.material.transparent = true; // Ensure transparency works
    fadePlane.material.depthWrite = false; // Disable depth writing for fade plane
    fadePlane.material.visible = true; // Ensure fade plane is visible
    fadePlane.position.set(0, 0, -1); // Position it in front
    fadePlane.scale.set(2, 2, 1); // Scale it to cover the view
    fadePlane.rotation.set(0, 0, 0); // Reset rotation
    fadePlane.frustumCulled = false; // Ensure it renders
    fadePlane.renderOrder = 999; // Ensure it renders on top
    

    renderer.render(closeUpScene, closeUpCamera);
    
  }

  requestAnimationFrame(render);
}

render();

// Handle window resize
window.addEventListener('resize', () => {
  ww = window.innerWidth;
  wh = window.innerHeight;
  renderer.setSize(ww, wh);

  camera.aspect = ww / wh;
  camera.updateProjectionMatrix();

  closeUpCamera.aspect = ww / wh;
  closeUpCamera.updateProjectionMatrix();

  composer.setSize(ww, wh);
});








