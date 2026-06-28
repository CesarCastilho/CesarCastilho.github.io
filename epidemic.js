const canvas = document.getElementById("epidemicCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let pulses = [];

const STATES = {
    S: "rgba(125, 211, 252, 0.70)",
    I: "rgba(248, 113, 113, 0.80)",
    R: "rgba(167, 139, 250, 0.65)"
};

const nodePositions = [
    [0.32, 0.28],
    [0.42, 0.20],
    [0.52, 0.30],
    [0.62, 0.22],
    [0.70, 0.36],
    [0.38, 0.52],
    [0.50, 0.48],
    [0.62, 0.55],
    [0.30, 0.72],
    [0.44, 0.76],
    [0.58, 0.72],
    [0.72, 0.70]
];

const edgeList = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [2, 6], [4, 7],
    [5, 6], [6, 7],
    [5, 8], [6, 9], [7, 10],
    [8, 9], [9, 10], [10, 11],
    [3, 7], [1, 6]
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
        radius: 4,
        state: i === 2 ? "I" : "S",
        infectedTime: 0
    }));

    edges = edgeList.map(e => ({ from: e[0], to: e[1] }));
}

function updateNodeCoordinates(time) {
    for (const n of nodes) {
        n.x = n.x0 * canvas.width;
        n.y = n.y0 * canvas.height;
    }
}

function updateEpidemic() {
    for (const n of nodes) {
        if (n.state === "I") {
            n.infectedTime++;

            if (n.infectedTime > 620) {
                n.state = "R";
            }
        }
    }

    for (const e of edges) {
        const a = nodes[e.from];
        const b = nodes[e.to];

        if (a.state === "I" && b.state === "S" && Math.random() < 0.003) {
            b.state = "I";
            b.infectedTime = 0;
            pulses.push({ from: e.from, to: e.to, life: 0 });
        }

        if (b.state === "I" && a.state === "S" && Math.random() < 0.003) {
            a.state = "I";
            a.infectedTime = 0;
            pulses.push({ from: e.to, to: e.from, life: 0 });
        }
    }

    for (const p of pulses) {
        p.life++;
    }

    pulses = pulses.filter(p => p.life < 90);

    const infected = nodes.some(n => n.state === "I");

    if (!infected) {
        const allRecovered = nodes.every(n => n.state === "R");

        if (allRecovered) {
            for (const n of nodes) {
                n.state = "S";
                n.infectedTime = 0;
            }
        }

        const p = nodes[Math.floor(Math.random() * nodes.length)];
        p.state = "I";
        p.infectedTime = 0;
    }
}

function drawEdges() {
    for (const e of edges) {
        const a = nodes[e.from];
        const b = nodes[e.to];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle = "rgba(125, 211, 252, 0.10)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
}

function drawPulses() {
    for (const p of pulses) {
        const a = nodes[p.from];
        const b = nodes[p.to];

        const t = p.life / 90;
        const x = a.x + t * (b.x - a.x);
        const y = a.y + t * (b.y - a.y);

        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(248, 113, 113, 0.55)";
        ctx.fill();
    }
}

function drawNodes(time) {
    for (const n of nodes) {
        if (n.state === "I") {
            const halo = n.radius + 4 + 2 * Math.sin(time * 0.004);

            ctx.beginPath();
            ctx.arc(n.x, n.y, halo, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(248,113,113,0.18)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = STATES[n.state];
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 1, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
}

function drawLegend() {
    const y = canvas.height - 16;

    ctx.font = "11px Segoe UI, sans-serif";
    ctx.fillStyle = "rgba(203, 213, 225, 0.50)";

    const items = [
        ["S", STATES.S, 22],
        ["I", STATES.I, 66],
        ["R", STATES.R, 110]
    ];

    for (const [letter, col, x] of items) {
        ctx.beginPath();
        ctx.arc(x, y - 4, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = col;
        ctx.fill();

        ctx.fillStyle = "rgba(203, 213, 225, 0.50)";
        ctx.fillText(letter, x + 8, y);
    }
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateNodeCoordinates(time);
    updateEpidemic();

    drawEdges();
    drawPulses();
    drawNodes(time);
    drawLegend();

    requestAnimationFrame(animate);
}

resizeCanvas();
createNetwork();
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
    resizeCanvas();
    createNetwork();
});
