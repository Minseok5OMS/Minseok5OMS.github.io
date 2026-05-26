(() => {
  const canvases = document.querySelectorAll('.visitor-globe-canvas');
  if (!canvases.length) return;

  const points = [
    { lat: 37.5665, lon: 126.9780 },
    { lat: 34.0522, lon: -118.2437 },
    { lat: 38.0293, lon: -78.4767 },
    { lat: 40.7128, lon: -74.0060 },
    { lat: 51.5072, lon: -0.1276 },
    { lat: 35.6762, lon: 139.6503 },
    { lat: 1.3521, lon: 103.8198 },
  ];

  const toRad = (degrees) => (degrees * Math.PI) / 180;

  function setupCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const size = 180;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return ctx;
  }

  function drawGreatCircle(ctx, radius, center, latitude, rotation, color, width = 1) {
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 4) {
      const lon = toRad(i + rotation);
      const lat = toRad(latitude);
      const x = Math.cos(lat) * Math.sin(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon);
      if (z < -0.02) continue;
      const px = center + radius * x;
      const py = center - radius * y;
      if (i === 0 || z < 0.02) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function drawMeridian(ctx, radius, center, meridian, rotation, color) {
    ctx.beginPath();
    let drawing = false;
    for (let i = -90; i <= 90; i += 3) {
      const lat = toRad(i);
      const lon = toRad(meridian + rotation);
      const x = Math.cos(lat) * Math.sin(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon);
      if (z < -0.02) {
        drawing = false;
        continue;
      }
      const px = center + radius * x;
      const py = center - radius * y;
      if (!drawing) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      drawing = true;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function draw(canvas, ctx, startedAt) {
    const elapsed = (performance.now() - startedAt) / 1000;
    const size = 180;
    const center = size / 2;
    const radius = 72;
    const rotation = elapsed * 14;

    ctx.clearRect(0, 0, size, size);

    const sphere = ctx.createRadialGradient(center - 22, center - 26, 14, center, center, radius);
    sphere.addColorStop(0, '#ffffff');
    sphere.addColorStop(0.48, '#edf1f5');
    sphere.addColorStop(1, '#aeb5bf');

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = sphere;
    ctx.fill();
    ctx.clip();

    drawGreatCircle(ctx, radius, center, 0, rotation, 'rgba(92, 103, 116, 0.36)', 1.2);
    [-45, 45].forEach((lat) => drawGreatCircle(ctx, radius, center, lat, rotation, 'rgba(92, 103, 116, 0.24)'));
    [0, 60, 120, 180, 240, 300].forEach((lon) => drawMeridian(ctx, radius, center, lon, rotation, 'rgba(92, 103, 116, 0.22)'));

    points.forEach((point, index) => {
      const lat = toRad(point.lat);
      const lon = toRad(point.lon + rotation);
      const x = Math.cos(lat) * Math.sin(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon);
      if (z <= 0) return;

      const px = center + radius * x;
      const py = center - radius * y;
      const depth = 0.55 + z * 0.45;
      const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.25;

      ctx.beginPath();
      ctx.arc(px, py, 4.5 * depth * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 118, 223, ${0.14 * depth})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 2.1 * depth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 118, 223, ${0.72 + 0.2 * depth})`;
      ctx.fill();
    });

    ctx.restore();

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#8a8f98';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(center, center, radius + 9, radius + 1, -0.35, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(138, 143, 152, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(() => draw(canvas, ctx, startedAt));
  }

  canvases.forEach((canvas) => {
    const ctx = setupCanvas(canvas);
    draw(canvas, ctx, performance.now());
  });
})();
