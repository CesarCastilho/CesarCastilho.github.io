const canvas = document.getElementById("epidemicCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
const N = 22;

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function randomState(i) {
    if (i < 4) return "I";
    return "S";
}

for (let i = 0; i < N; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 4 + Math.random() * 2,
        state: randomState(i),
        infectedTime: 0
    });
}

function color(state) {
    if (state === "S") return "#00e5ff";   // suscetível
    if (state === "I") return "#ff3b3b";   // infectado
    if (state === "R") return "#9b8cff";   // recuperado
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function update() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        if (p.state === "I") {
            p.infectedTime += 1;
            if (p.infectedTime > 600) {
                p.state = "R";
            }
        }
    }

    for (const a of particles) {
        for (const b of particles) {
            if (a === b) continue;

            const close = distance(a, b) < 22;

            if (close && a.state === "I" && b.state === "S") {
                if (Math.random() < 0.015) {
                    b.state = "I";
                    b.infectedTime = 0;
                }
            }
        }
    }

    const infected = particles.filter(p => p.state === "I").length;

    if (infected === 0) {
        const susceptible = particles.filter(p => p.state === "S");
        if (susceptible.length > 0) {
            const p = susceptible[Math.floor(Math.random() * susceptible.length)];
            p.state = "I";
            p.infectedTime = 0;
        } else {
            for (const p of particles) {
                p.state = "S";
                p.infectedTime = 0;
            }
            particles[0].state = "I";
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const d = distance(a, b);

            if (d < 120 && Math.random() < 0.02){
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = "rgba(180,180,255,0.10)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = color(p.state);
        ctx.fill();

        if (p.state === "I") {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + 8, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 59, 59, 0.35)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

animate();
