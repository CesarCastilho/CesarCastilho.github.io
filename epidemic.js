const canvas = document.getElementById("epidemicCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let edges = [];
let pulses = [];

const N = 24;
const NEIGHBORS = 3;

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function color(state) {
    if (state === "S") return "#00e5ff";
    if (state === "I") return "#ff4d4d";
    if (state === "R") return "#9b8cff";
}

function initializeParticles() {
    particles = [];

    for (let i = 0; i < N; i++) {
        particles.push({
            x: 30 + Math.random() * (canvas.width - 60),
            y: 30 + Math.random() * (canvas.height - 60),
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            r: 5,
            state: i < 3 ? "I" : "S",
            infectedTime: 0
        });
    }
}

function initializeEdges() {
    edges = [];

    for (let i = 0; i < particles.length; i++) {
        let distances = [];

        for (let j = 0; j < particles.length; j++) {
            if (i !== j) {
                distances.push({
                    from: i,
                    to: j,
                    d: distance(particles[i], particles[j])
                });
            }
        }

        distances.sort((a, b) => a.d - b.d);

        for (let k = 0; k < NEIGHBORS; k++) {
            const edge = distances[k];

            const exists = edges.some(e =>
                (e.from === edge.from && e.to === edge.to) ||
                (e.from === edge.to && e.to === edge.from)
            );

            if (!exists) {
                edges.push({ from: edge.from, to: edge.to });
            }
        }
    }
}

function update() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 20 || p.x > canvas.width - 20) p.vx *= -1;
        if (p.y < 20 || p.y > canvas.height - 20) p.vy *= -1;

        if (p.state === "I") {
            p.infectedTime++;

            if (p.infectedTime > 700) {
                p.state = "R";
            }
        }
    }

    for (const e of edges) {
        const a = particles[e.from];
        const b = particles[e.to];

        if (a.state === "I" && b.state === "S" && Math.random() < 0.004) {
            b.state = "I";
            b.infectedTime = 0;
            pulses.push({ from: e.from, to: e.to, life: 0 });
        }

        if (b.state === "I" && a.state === "S" && Math.random() < 0.004) {
            a.state = "I";
            a.infectedTime = 0;
            pulses.push({ from: e.to, to: e.from, life: 0 });
        }
    }

    for (const pulse of pulses) {
        pulse.life++;
    }

    pulses = pulses.filter(p => p.life < 80);

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

function drawEdges() {
    for (const e of edges) {
        const a = particles[e.from];
        const b = particles[e.to];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
        ctx.lineWidth = 1.3;

        ctx.stroke();
    }
}

function drawPulses() {
    for (const pulse of pulses) {
        const a = particles[pulse.from];
        const b = particles[pulse.to];

        const t = pulse.life / 80;
        const x = a.x + t * (b.x - a.x);
        const y = a.y + t * (b.y - a.y);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 77, 77, 0.9)";
        ctx.fill();
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = color(p.state);
        ctx.fill();

        if (p.state === "I") {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + 8, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 77, 77, 0.45)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEdges();
    drawPulses();
    drawParticles();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

window.addEventListener("load", () => {
    resizeCanvas();
    initializeParticles();
    initializeEdges();
    animate();
});

window.addEventListener("resize", () => {
    resizeCanvas();
    initializeParticles();
    initializeEdges();
});
