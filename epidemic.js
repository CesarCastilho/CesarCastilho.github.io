const canvas = document.getElementById("epidemicCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let pulses = [];

const STATES = {
    S: "#00e5ff",   // suscetível
    I: "#ff4d4d",   // infectado
    R: "#9b8cff"    // recuperado
};

const nodePositions = [
    [0.12, 0.25], [0.23, 0.15], [0.35, 0.28], [0.48, 0.18],
    [0.62, 0.30], [0.78, 0.20], [0.88, 0.35],
    [0.18, 0.55], [0.32, 0.48], [0.46, 0.58], [0.60, 0.50],
    [0.74, 0.60], [0.88, 0.55],
    [0.25, 0.82], [0.40, 0.75], [0.55, 0.82], [0.70, 0.78],
    [0.84, 0.84]
];

const edgeList = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [0, 7], [2, 8], [4, 10], [6, 12],
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
    [7, 13], [8, 14], [9, 14], [10, 15], [11, 16], [12, 17],
    [13, 14], [14, 15], [15, 16], [16, 17],
    [3, 9], [5, 11], [1, 8], [4, 11]
];

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function createNetwork() {
    nodes = nodePositions.map((pos, i) => ({
        x0: pos[0],
        y0: pos[1],
        x: 0,
        y: 0,
        phase: Math.random() * Math.PI * 2,
        radius: 6,
        state: i === 2 || i === 10 ? "I" : "S",
        infectedTime: 0
    }));

    edges = edgeList.map(e => ({ from: e[0], to: e[1] }));
}

function updateNodeCoordinates(time) {
    for (const n of nodes) {
        const wiggle = 4;

        n.x = n.x0 * canvas.width + wiggle * Math.sin(time * 0.001 + n.phase);
        n.y = n.y0 * canvas.height + wiggle * Math.cos(time * 0.0012 + n.phase);
    }
}

function updateEpidemic() {
    for (const n of nodes) {
        if (n.state === "I") {
            n.infectedTime++;

            if (n.infectedTime > 520) {
                n.state = "R";
            }
        }
    }

    for (const e of edges) {
        const a = nodes[e.from];
        const b = nodes[e.to];

        if (a.state === "I" && b.state === "S" && Math.random() < 0.006) {
            b.state = "I";
            b.infectedTime = 0;
            pulses.push({ from: e.from, to: e.to, life: 0 });
        }

        if (b.state === "I" && a.state === "S" && Math.random() < 0.006) {
            a.state = "I";
            a.infectedTime = 0;
            pulses.push({ from: e.to, to: e.from, life: 0 });
        }
    }

    for (const p of pulses) {
        p.life++;
    }

    pulses = pulses.filter(p => p.life < 70);

    const infected = nodes.some(n => n.state === "I");

    if (!infected) {
        setTimeout(() => {
            for (const n of nodes) {
                n.state = "S";
                n.infectedTime = 0;
            }

            nodes[Math.floor(Math.random() * nodes.length)].state = "I";
        }, 500);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(15, 23, 42, 0.95)");
    gradient.addColorStop(1, "rgba(30, 41, 59, 0.75)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawEdges() {
    for (const e of edges) {
        const a = nodes[e.from];
        const b = nodes[e.to];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle = "rgba(125, 211, 252, 0.22)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
    }
}

function drawPulses() {
    for (const p of pulses) {
        const a = nodes[p.from];
        const b = nodes[p.to];

        const t = p.life / 70;
        const x = a.x + t * (b.x - a.x);
        const y = a.y + t * (b.y - a.y);

        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 77, 77, 0.90)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(255, 77, 77, 0.25)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
    }
}

function drawNodes() {
    for (const n of nodes) {
        if (n.state === "I") {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 8, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 77, 77, 0.45)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = STATES[n.state];
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(248, 250, 252, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawLegend() {
    const y = canvas.height - 18;

    ctx.font = "13px Segoe UI, sans-serif";
    ctx.fillStyle = "rgba(248, 250, 252, 0.72)";

    const items = [
        ["S", "Susceptible", STATES.S, 24],
        ["I", "Infected", STATES.I, 145],
        ["R", "Recovered", STATES.R, 250]
    ];

    for (const [letter, label, col, x] of items) {
        ctx.beginPath();
        ctx.arc(x, y - 4, 5, 0, 2 * Math.PI);
        ctx.fillStyle = col;
        ctx.fill();

        ctx.fillStyle = "rgba(248, 250, 252, 0.72)";
        ctx.fillText(`${letter}: ${label}`, x + 12, y);
    }
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateNodeCoordinates(time);
    updateEpidemic();

    drawBackground();
    drawEdges();
    drawPulses();
    drawNodes();
    drawLegend();

    requestAnimationFrame(animate);
}

window.addEventListener("load", () => {
    resizeCanvas();
    createNetwork();
    requestAnimationFrame(animate);
});

window.addEventListener("resize", () => {
    resizeCanvas();
    createNetwork();
});
