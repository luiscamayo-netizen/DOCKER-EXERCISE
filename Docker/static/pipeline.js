document.addEventListener('DOMContentLoaded', () => {
    const steps = Object.entries(pipelineData);
    const canvas = document.getElementById('pipelineCanvas');
    if (!canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const boxWidth = 120, boxHeight = 60, gap = 40, startX = 30;
    const startY = canvasHeight / 2 - boxHeight / 2;
    const arrowOffsetY = 15, dataPacketRadius = 8, animationSpeed = 1;
    const dataBoxHeight = 50, dataBoxPadding = 10, lineHeight = 14;

    let currentStepIndex = 0;
    let dataPacketX = startX + boxWidth / 2;
    let dataPacketY = startY - arrowOffsetY - 15;
    let targetX = dataPacketX;
    let animating = false;

    function drawFilterBox(x, y, text) {
        ctx.fillStyle = '#e9ecef';
        ctx.strokeStyle = '#0056b3';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2 + 5);
    }

    function drawArrow(x1, y1, x2, y2) {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2 - 8, y2 - 4);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8, y2 + 4);
        ctx.stroke();
    }

    function drawDataText(boxX, boxY, text) {
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#adb5bd';
        ctx.fillRect(boxX, boxY, boxWidth, dataBoxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, dataBoxHeight);

        ctx.fillStyle = '#212529';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        const textPadding = 5;
        const maxWidth = boxWidth - (textPadding * 2);
        const words = text.split(' ');
        let line = '', lines = [];

        for (let word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxWidth && line) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        ctx.textBaseline = 'top';
        const startTextY = boxY + textPadding;
        for (let i = 0; i < Math.min(lines.length, 2); i++) {
            let lineToDraw = lines[i];
            while (ctx.measureText(lineToDraw + '...').width > maxWidth && lineToDraw.length > 0) {
                lineToDraw = lineToDraw.slice(0, -1);
            }
            if (lineToDraw !== lines[i]) lineToDraw += '...';
            ctx.fillText(lineToDraw, boxX + boxWidth / 2, startTextY + i * lineHeight);
        }
    }

    function drawDataPacket(x, y) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, dataPacketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let currentX = startX;

        steps.forEach(([stepName, stepData], index) => {
            let displayName = stepName.includes(':') ? stepName.split(':')[1].trim() : stepName;
            if (displayName.length > 15) displayName = displayName.slice(0, 13) + '...';
            drawFilterBox(currentX, startY, displayName);
            drawDataText(currentX, startY + boxHeight + dataBoxPadding, stepData);
            if (index < steps.length - 1) {
                drawArrow(currentX + boxWidth, startY + boxHeight / 2, currentX + boxWidth + gap, startY + boxHeight / 2);
            }
            currentX += boxWidth + gap;
        });

        if (animating) {
            if (dataPacketX < targetX) {
                dataPacketX += animationSpeed;
            } else if (dataPacketX > targetX) {
                dataPacketX -= animationSpeed;
            }

            const currentFilterCenterX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
            if (Math.abs(dataPacketX - currentFilterCenterX) < animationSpeed) {
                if (currentStepIndex < steps.length - 1) {
                    currentStepIndex++;
                    targetX = startX + currentStepIndex * (boxWidth + gap) + boxWidth / 2;
                    dataPacketX = startX + (currentStepIndex - 1) * (boxWidth + gap) + boxWidth + gap / 2;
                    dataPacketY = startY + boxHeight / 2;
                } else {
                    animating = false;
                    dataPacketY = startY - arrowOffsetY - 15;
                }
            }
        }

        drawDataPacket(dataPacketX, dataPacketY);
        if (animating) requestAnimationFrame(animate);
    }

    if (steps.length > 0) {
        targetX = startX + boxWidth / 2;
        dataPacketX = startX - gap / 2;
        dataPacketY = startY + boxHeight / 2;
        currentStepIndex = 0;
        animating = true;
        animate();
    }
});
