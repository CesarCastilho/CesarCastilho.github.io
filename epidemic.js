const canvas = document.getElementById("epidemicCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

function drawTest() {
    resizeCanvas();

    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 120, 80);

    ctx.beginPath();
    ctx.arc(250, 80, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "cyan";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, 160);
    ctx.lineTo(canvas.width - 20, 160);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 5;
    ctx.stroke();
}

drawTest();
