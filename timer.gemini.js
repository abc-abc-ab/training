'use strict';
const d = document, t = window;
let interval = 0; // setInterval ID を保持

// タイマーの状態を管理する変数群
let currentTitle = "";      // 現在のプログラムのタイトル（例: "トレーニング", "休憩"）
let currentTime = 0;        // 現在の残り時間 (秒)
let programCount = 0;       // トレーニング/休憩フェーズの実行回数 (例: #1, #2...)
let isTrainingPhase = true; // 現在がトレーニングフェーズか休憩フェーズか

// クリックカウント用の独立した変数
let clickCount = 0; // クリックされた回数をカウント

// URLパラメータから取得する時間
let trainingDuration = 0; // トレーニング時間 (秒)
let breakDuration = 0;    // 休憩時間 (秒)

t.addEventListener("DOMContentLoaded", ((e) => {
    // URLパラメータの取得とバリデーション
    const urlParams = new URLSearchParams(d.location.search);
    const paramTrainingTime = parseFloat(urlParams.get("time"));
    const paramBreakTime = parseFloat(urlParams.get("break"));

    // 取得した値を秒単位に変換してグローバル変数に格納
    trainingDuration = paramTrainingTime * 60;
    breakDuration = paramBreakTime * 60;

    // HTML要素への参照
    const titleElement = d.getElementById("title");
    const timeElement = d.getElementById("time");
    const clickCountElement = d.getElementById("clickCount"); // クリックカウント表示用の新しいID
    const startButton = d.getElementById("startButton");

    // パラメータが無効な場合のバリデーション
    if (isNaN(trainingDuration) || isNaN(breakDuration) || trainingDuration <= 0 || breakDuration <= 0) {
        d.location.href = "./"; // 無効な場合はリダイレクト
        return;
    }

    // Number.prototype.PadTo2Digits の定義
    Object.defineProperty(Number.prototype, "PadTo2Digits",
        { value: /** @this {Number}*/function() {return String(this).padStart(2, "0"); }, writable: false
    });

    // 初期状態の設定と表示
    currentTitle = "トレーニング"; // 最初のフェーズはトレーニング
    currentTime = trainingDuration;
    programCount = 1; // 最初のトレーニングは1回目
    isTrainingPhase = true;
    
    clickCountElement.innerText = clickCount; // クリックカウントの初期表示
    updateDisplayElements(); // 初期表示を更新

    // クリックイベントリスナー (クリックされた回数をカウントし、表示)
    t.addEventListener("click", (e) => {
        clickCountElement.innerText = ++clickCount;
    });

    // スタートボタンがクリックされたらタイマーを開始
    startButton.addEventListener("click", startTimerSequence);

    // URL履歴の置き換え
    t.history.replaceState("", "", "./timer.html?")
}));

/**
 * HTML要素の表示を更新する関数
 */
function updateDisplayElements() {
    const titleElement = d.getElementById("title");
    const timeElement = d.getElementById("time");

    if (titleElement) {
        titleElement.innerText = `${currentTitle} #${programCount}`; // タイトルとフェーズ回数を表示
    }
    if (timeElement) {
        timeElement.innerText = formatTime(currentTime);
    }
    // clickCountElement は updateDisplayElements とは独立して更新される
}

/**
 * 時間を MM:SS.ms の形式にフォーマットする関数
 * @param {number} timeInSeconds - 秒単位の時間
 * @returns {string} フォーマットされた文字列
 */
function formatTime(timeInSeconds) {
    const totalMilliseconds = Math.max(0, timeInSeconds * 100);
    const minutes = Math.floor(totalMilliseconds / (60 * 100));
    const seconds = Math.floor((totalMilliseconds % (60 * 100)) / 100);
    const centiseconds = Math.floor(totalMilliseconds % 100);

    return `${Number(minutes).PadTo2Digits()}:${Number(seconds).PadTo2Digits()}.${Number(centiseconds).PadTo2Digits()}`;
}

/**
 * タイマーのカウントダウン処理（10ミリ秒ごとに呼び出される）
 */
function CountDown() {
    currentTime -= 0.01;
    updateDisplayElements(); // 表示を更新

    if (currentTime <= 0) {
        currentTime = 0;
        updateDisplayElements(); // 最終表示を更新
        t.clearInterval(interval); // タイマー停止
        interval = 0; // IDをリセット

        // フェーズ切り替え処理
        togglePhase();
    }
}

/**
 * フェーズを切り替える関数
 */
function togglePhase() {
    if (isTrainingPhase) {
        // 現在がトレーニングフェーズなら、休憩フェーズへ
        currentTitle = "休憩";
        currentTime = breakDuration;
        isTrainingPhase = false;
    } else {
        // 現在が休憩フェーズなら、トレーニングフェーズへ
        currentTitle = "トレーニング";
        currentTime = trainingDuration;
        isTrainingPhase = true;
        programCount++; // トレーニングフェーズに戻るときに回数を増やす
    }

    // 次のフェーズのタイマーを開始
    startTimerSequence();
}

/**
 * タイマーシーケンスを開始する関数
 */
function startTimerSequence() {
    if (interval) {
        t.clearInterval(interval);
    }
    interval = t.setInterval(CountDown, 10);
    console.log(`タイマー開始: ${currentTitle} #${programCount}, 残り時間: ${currentTime.toFixed(2)}s`);
}