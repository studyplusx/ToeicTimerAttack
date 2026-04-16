// 目標時間の設定 (秒単位)
// Part5: 10分(600秒), Part6: 10分(600秒), Part7: 55分(3300秒)
const TARGET_TIMES = [600, 600, 3300]; 
const PART_NAMES = ["Part 5", "Part 6", "Part 7"];
const TOTAL_LIMIT_MS = 75 * 60 * 1000; // 75分

let timerInterval = null;
let lastTime = 0;
let totalElapsedMs = 0;
let partElapsedMs = 0;
let currentPartIndex = 0;
let isRunning = false;

// HTML要素の取得
const elTotalTime = document.getElementById('total-time');
const elPartTime = document.getElementById('part-time');
const elPartLabel = document.getElementById('current-part-label');
const elLapList = document.getElementById('lap-list');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnLap = document.getElementById('btn-lap');
const btnReset = document.getElementById('btn-reset');

// ミリ秒を MM:SS.ms (00:00.00) 形式の文字列に変換
function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

// 画面の時間を更新
function updateDisplay() {
    elTotalTime.textContent = formatTime(totalElapsedMs);
    elPartTime.textContent = formatTime(partElapsedMs);
    
    if (currentPartIndex < PART_NAMES.length) {
        elPartLabel.textContent = `${PART_NAMES[currentPartIndex]} 経過時間`;
    } else {
        elPartLabel.textContent = "全パート完了";
    }
}

// 時間切れチェック
function checkTimeLimit() {
    if (totalElapsedMs >= TOTAL_LIMIT_MS) {
        totalElapsedMs = TOTAL_LIMIT_MS;
        stopTimer();
        updateDisplay();
        alert("Time's up! 75分が経過しました。試験終了です。");
        btnStart.disabled = true;
        btnLap.disabled = true;
    }
}

// 10ミリ秒ごとの処理
function tick() {
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;
    
    totalElapsedMs += delta;
    partElapsedMs += delta;
    
    updateDisplay();
    checkTimeLimit();
}

// ボタン操作: スタート
function startTimer() {
    if (!isRunning && totalElapsedMs < TOTAL_LIMIT_MS) {
        isRunning = true;
        lastTime = Date.now();
        timerInterval = setInterval(tick, 10);
        
        btnStart.disabled = true;
        btnStop.disabled = false;
        btnLap.disabled = (currentPartIndex >= PART_NAMES.length);
    }
}

// ボタン操作: ストップ
function stopTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        
        btnStart.disabled = false;
        btnStop.disabled = true;
        btnLap.disabled = true;
    }
}

// ボタン操作: ラップ
function lapTimer() {
    if (!isRunning || currentPartIndex >= PART_NAMES.length) return;

    // 目標との差分計算
    const targetSec = TARGET_TIMES[currentPartIndex];
    const partSec = partElapsedMs / 1000;
    const diffSec = partSec - targetSec;

    let diffText = "";
    let colorClass = "";

    // ±0.00, -x.xx, +x.xx の判定と色付け
    if (Math.abs(diffSec) < 0.01) {
        diffText = "±0.00";
        colorClass = "diff-zero";
    } else if (diffSec < 0) {
        diffText = diffSec.toFixed(2); // マイナスの場合は自動で - が付く
        colorClass = "diff-minus";
    } else {
        diffText = "+" + diffSec.toFixed(2);
        colorClass = "diff-plus";
    }

    // ラップ履歴の追加
    const li = document.createElement('li');
    li.innerHTML = `
        <span><strong>${PART_NAMES[currentPartIndex]}</strong> (目標${targetSec / 60}分)</span>
        <span>${formatTime(partElapsedMs)} <span class="${colorClass}">(${diffText}s)</span></span>
    `;
    elLapList.appendChild(li);

    // 次のパートへ
    partElapsedMs = 0;
    currentPartIndex++;
    
    if (currentPartIndex >= PART_NAMES.length) {
        btnLap.disabled = true;
        elPartLabel.textContent = "全パート完了";
        elPartTime.textContent = "00:00.00";
    } else {
        updateDisplay();
    }
}

// ボタン操作: リセット
function resetTimer() {
    stopTimer();
    totalElapsedMs = 0;
    partElapsedMs = 0;
    currentPartIndex = 0;
    elLapList.innerHTML = '';
    btnStart.disabled = false;
    updateDisplay();
}

// イベントリスナーの登録
btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click', stopTimer);
btnLap.addEventListener('click', lapTimer);
btnReset.addEventListener('click', resetTimer);

// 初期表示
updateDisplay();
