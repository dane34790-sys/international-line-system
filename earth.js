// =============================
// ENHANCED NASA WIREFRAME EARTH
// Separate file: earth.js
// =============================
(function() {
  let canvas, ctx;
  let animationId;

  const camera = { distance: 700, fov: 350 };
  const earth = { radius: 85, rotationY: 0, rotationX: -0.25 };

  // Starfield
  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      z: Math.random() * 1000 - 500,
      size: Math.random() * 2 + 0.5
    });
  }

  // Sphere vertices
  const vertices = [];
  const latSteps = 42, lonSteps = 84;
  for (let lat = 0; lat <= latSteps; lat++) {
    const theta = (lat / latSteps) * Math.PI;
    for (let lon = 0; lon <= lonSteps; lon++) {
      const phi = (lon / lonSteps) * Math.PI * 2;
      const x = earth.radius * Math.sin(theta) * Math.cos(phi);
      const y = earth.radius * Math.cos(theta);
      const z = earth.radius * Math.sin(theta) * Math.sin(phi);
      vertices.push({ x, y, z });
    }
  }

  // Node locations (5 nodes worldwide)
  const nodes = [
    { lat: 35, lon: -120 },   // North America
    { lat: 52, lon: 15 },     // Europe
    { lat: 30, lon: 110 },    // Asia
    { lat: -25, lon: 25 },    // Africa
    { lat: -35, lon: 145 }    // Australia
  ];

  const links = [[0,1],[1,2],[2,3],[3,0],[1,4]];

  function rotate(v) {
    let x = v.x, y = v.y, z = v.z;
    let cosY = Math.cos(earth.rotationY), sinY = Math.sin(earth.rotationY);
    let dx = x * cosY - z * sinY;
    let dz = x * sinY + z * cosY;
    let cosX = Math.cos(earth.rotationX), sinX = Math.sin(earth.rotationX);
    let dy = y * cosX - dz * sinX;
    dz = y * sinX + dz * cosX;
    return { x: dx, y: dy, z: dz };
  }

  function project(v) {
    const scale = camera.fov / (camera.distance + v.z);
    return {
      x: v.x * scale + canvas.width / 2,
      y: v.y * scale + canvas.height / 2,
      scale
    };
  }

  function geoPoint(lat, lon) {
    lat *= Math.PI/180; lon *= Math.PI/180;
    return {
      x: earth.radius * Math.cos(lat) * Math.cos(lon),
      y: earth.radius * Math.sin(lat),
      z: -earth.radius * Math.cos(lat) * Math.sin(lon)
    };
  }

  function drawStarfield() {
    stars.forEach(s => {
      const p = project(s);
      if (p.scale > 0 && p.x > 0 && p.x < canvas.width && p.y > 0 && p.y < canvas.height) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + p.scale * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s.size * p.scale / 100, 0, Math.PI*2);
        ctx.fill();
      }
    });
  }

  function drawSphere() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep space background gradient
    const bgGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 50, canvas.width/2, canvas.height/2, 400);
    bgGrad.addColorStop(0, '#001a0a');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStarfield();

    // Earth glow
    const g = ctx.createRadialGradient(canvas.width/2, canvas.height/2, earth.radius*0.6, canvas.width/2, canvas.height/2, earth.radius*2);
    g.addColorStop(0, "rgba(0,255,120,0.25)");
    g.addColorStop(0.5, "rgba(0,255,120,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wireframe lines
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 0.8;
    let index = 0;

    for (let lat = 0; lat <= latSteps; lat++) {
      ctx.beginPath();
      for (let lon = 0; lon <= lonSteps; lon++) {
        const p = rotate(vertices[index++]);
        const s = project(p);
        if (lon === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
    }

    for (let lon = 0; lon <= lonSteps; lon++) {
      ctx.beginPath();
      for (let lat = 0; lat <= latSteps; lat++) {
        const id = lat * (lonSteps+1) + lon;
        const p = rotate(vertices[id]);
        const s = project(p);
        if (lat === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
    }
  }

  function drawNodes() {
    nodes.forEach((n, i) => {
      const p = rotate(geoPoint(n.lat, n.lon));
      if (p.z < -120) return;
      const s = project(p);

      // Outer glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, 14 + s.scale * 2, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255, 0, 200, 0.2)";
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4 + s.scale, 0, Math.PI*2);
      ctx.fillStyle = "#ff00cc";
      ctx.fill();
      ctx.shadowColor = "#ff00cc";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pulsing ring
      const pulse = Math.sin(Date.now() * 0.005 + i) * 2 + 6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, pulse + s.scale, 0, Math.PI*2);
      ctx.strokeStyle = "#00ffaa";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function drawLinks() {
    ctx.strokeStyle = "rgba(0, 255, 170, 0.6)";
    ctx.lineWidth = 1.8;
    links.forEach(link => {
      const a = rotate(geoPoint(nodes[link[0]].lat, nodes[link[0]].lon));
      const b = rotate(geoPoint(nodes[link[1]].lat, nodes[link[1]].lon));
      if (a.z < -100 || b.z < -100) return;
      const p1 = project(a);
      const p2 = project(b);
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 - 40;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
      ctx.stroke();
    });
  }

  function update() {
    earth.rotationY += 0.003;
    drawSphere();
    drawLinks();
    drawNodes();
    animationId = requestAnimationFrame(update);
  }

  // Global start function
  window.startEarth = function() {
    canvas = document.getElementById("earth");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight || 200;
    };
    window.addEventListener("resize", resize);
    resize();

    if (animationId) cancelAnimationFrame(animationId);
    update();
  };
})();
