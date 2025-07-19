'use strict';
const d = document, t = window;
let interval = 0;

t.addEventListener("DOMContentLoaded", ((e) => {
    let count = 0, param = new URLSearchParams(d.location.href);
    const traningTime = param.get("time") * 60, breakTime = param.get("break") * 60;
    let title = "", time = 0;
    const titleElement = d.getElementById("title"),
    timeElement = d.getElementById("time"),
    countElement = d.getElementById("count");
    if ( isNaN(traningTime * breakTime) || traningTime * breakTime === 0){d.location.href = "./"}

    Object.defineProperty(Number.prototype, "PadTo2Digits",
        { value: /** @this {Number}*/function() {return String(this).padStart(2, "0"); }, writable: false
    });

    t.addEventListener("click", (e) => {
        countElement.innerText = ++count;
    })
    interval = t.setInterval(CountDown, 10, [timeElement, time]);

    // TODO: 切り替え処理

    t.history.replaceState("", "", "./timer.html?")
}));

/** It's count down function.
 * @param {HTMLElement} elm 
 * @param {Number} time 
 */
function CountDown(elm, time) {
    time -= 0.01;
    elm.innerText =
    `${Math.floor(Math.trunc(time) / 60).PadTo2Digits()}:${
     (Math.trunc(time) % 60).PadTo2Digits()}.${
     ((time - Math.trunc(time)) * 100).PadTo2Digits()}`;
    if (time <= 0) {t.clearInterval(interval); interval = 0;}
}