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
    // HTML要素の参照をDOMContentLoaded内でconstで取得
    const titleElement = d.getElementById("title");
    const timeElement = d.getElementById("time");
    const clickCountElement = d.getElementById("clickCount");

    // URLパラメータの取得とバリデーション
    const urlParams = new URLSearchParams(d.location.search);
    const paramTrainingTime = parseFloat(urlParams.get("time"));
    const paramBreakTime = parseFloat(urlParams.get("break"));

    // 取得した値を秒単位に変換してグローバル変数に格納
    trainingDuration = paramTrainingTime * 60;
    breakDuration = paramBreakTime * 60;

    // パラメータが無効な場合のバリデーション
    if (isNaN(trainingDuration) || isNaN(breakDuration) || trainingDuration <= 0 || breakDuration <= 0) {
        d.location.href = "./"; // 無効な場合はリダイレクト
        return; // リダイレクト後、これ以上処理しない
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

    // タイマーの表示を更新する関数をDOMContentLoaded内で定義（要素をクロージャで捕捉）
    // CountDown関数やtogglePhase関数からも呼び出せるようにする
    const updateDisplayElements = () => {
        if (titleElement) {
            titleElement.innerText = `${currentTitle} #${programCount}`;
        }
        if (timeElement) {
            timeElement.innerText = formatTime(currentTime);
        }
    };

    // CountDown関数もDOMContentLoaded内で定義することで、
    // titleElement, timeElement などをクロージャで利用できるようにする
    const CountDown = () => {
        currentTime -= 0.01;
        updateDisplayElements(); // 表示を更新

        if (currentTime <= 0) {
            currentTime = 0;
            updateDisplayElements(); // 最終表示を更新
            t.clearInterval(interval); // タイマー停止
            interval = 0; // IDをリセット

            // フェーズ切り替え処理を呼び出す
            togglePhase();
        }
    };

    // togglePhase関数もDOMContentLoaded内で定義することで、
    // CountDown関数やupdateDisplayElements関数などをクロージャで利用できるようにする
    const togglePhase = () => {
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
    };

    // startTimerSequence関数もDOMContentLoaded内で定義
    const startTimerSequence = () => {
        if (interval) {
            t.clearInterval(interval); // 既にタイマーが動いていればクリア
        }
        interval = t.setInterval(CountDown, 10);
        console.log(`タイマー開始: ${currentTitle} #${programCount}, 残り時間: ${currentTime.toFixed(2)}s`);
    };

    // クリックイベントリスナー (クリックされた回数をカウントし、表示)
    t.addEventListener("click", (e) => {
        clickCountElement.innerText = ++clickCount;
    });

    // 初期表示を更新
    updateDisplayElements();

    // タイマーシーケンスを自動的に開始 (別ページからの遷移時)
    startTimerSequence();

    // URL履歴の置き換え
    t.history.replaceState("", "", "./timer.html?")
}));

/**
 * 時間を MM:SS.ms の形式にフォーマットする関数 (この関数は依存性がないためグローバルでもOK)
 * @param {number} timeInSeconds - 秒単位の時間
 * @returns {string} フォーマットされた文字列
 */
function formatTime(timeInSeconds) {
    const totalMilliseconds = Math.max(0, timeInSeconds * 100);
    const minutes = Math.floor(totalMilliseconds / (60 * 100));
    const seconds = Math.floor((totalMilliseconds % (60 * 100)) / 100);
    const centiseconds = Math.floor(totalMilliseconds % 100);

    // Number.prototype.PadTo2Digits が定義されている前提
    return `${Number(minutes).PadTo2Digits()}:${Number(seconds).PadTo2Digits()}.${Number(centiseconds).PadTo2Digits()}`;
}