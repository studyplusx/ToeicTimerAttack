const TARGET_TIMES = [600, 600, 3300]; 
const PART_NAMES = ["Part 5", "Part 6", "Part 7"];
const TOTAL_LIMIT_MS = 75 * 60 * 1000;

let timerInterval = null;
let lastTime = 0;
let totalElapsedMs = 0;
let partElapsedMs = 0;
let currentPartIndex = 0;
let isRunning = false;

const elTotalTime = document.getElementById('total-time');
const elPartTime = document.getElementById('part-time');
const elPartLabel = document.getElementById('current-part-label');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnLap = document.getElementById('btn-lap');
const btnReset = document.getElementById('btn-reset');

function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function updateDisplay() {
    elTotalTime.textContent = formatTime(totalElapsedMs);
    elPartTime.textContent = formatTime(partElapsedMs);
    if (currentPartIndex < PART_NAMES.length) {
        elPartLabel.textContent = `Next: ${PART_NAMES[currentPartIndex]}`;
    } else {
        elPartLabel.textContent = "Finished";
    }
}

function tick() {
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;
    totalElapsedMs += delta;
    partElapsedMs += delta;
    updateDisplay();
    if (totalElapsedMs >= TOTAL_LIMIT_MS) {
        stopTimer();
        alert("試験終了です！");
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        lastTime = Date.now();
        timerInterval = setInterval(tick, 10);
        btnStart.disabled = true;
        btnStop.disabled = false;
        btnLap.disabled = (currentPartIndex >= PART_NAMES.length);
    }
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    btnStart.disabled = false;
    btnStop.disabled = true;
}

function lapTimer() {
    if (!isRunning || currentPartIndex >= PART_NAMES.length) return;

    const targetSec = TARGET_TIMES[currentPartIndex];
    const partSec = partElapsedMs / 1000;
    const diffSec = partSec - targetSec;

    let diffText = (diffSec >= 0 ? "+" : "") + diffSec.toFixed(2) + "s";
    let colorClass = diffSec < 0 ? "diff-minus" : (Math.abs(diffSec) < 0.01 ? "diff-zero" : "diff-plus");
    if (Math.abs(diffSec) < 0.01) diffText = "±0.00s";

    // Pacing Boardの該当行を更新
    const resultEl = document.getElementById(`result-${currentPartIndex}`);
    resultEl.classList.add('active');
    resultEl.innerHTML = `${formatTime(partElapsedMs)}<span class="diff ${colorClass}">${diffText}</span>`;

    partElapsedMs = 0;
    currentPartIndex++;
    btnLap.disabled = (currentPartIndex >= PART_NAMES.length);
    updateDisplay();
}

function resetTimer() {
    stopTimer();
    totalElapsedMs = 0;
    partElapsedMs = 0;
    currentPartIndex = 0;
    [0, 1, 2].forEach(i => {
        const el = document.getElementById(`result-${i}`);
        el.classList.remove('active');
        el.textContent = '--:--.--';
    });
    updateDisplay();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnLap.addEventListener('click', lapTimer);
btnReset.addEventListener('click', resetTimer);
updateDisplay();
