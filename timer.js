'use strict';
const d = document, t = window;
let interval = 0;

window.addEventListener("DOMContentLoaded", ((e)=>{
    let count = 0, param = new URLSearchParams(d.location.href);
    const Traningtime = param.get("time") * 60, breakTime = param.get("break") * 60;
    let time = 0;
    const contentElement = d.getElementById("content"),
    timeElement = d.getElementById("time"),
    countElement = d.getElementById("count");
    if (isNaN(Traningtime) || isNaN(breakTime)){d.location.href = "./"}

    /** 関数
     * @function Number.prototype.PadTo2Digits
     * @memberof Number.prototype
     * @returns {string}
     */
    Object.defineProperty(Number.prototype, "PadTo2Digits",
        { value: /** @this {Number}*/function() {return String(this).padStart(2, "0"); }, writable: false
    });

    t.addEventListener("click", (e)=>{
        countElement.innerText = ++count;
    })
    interval = t.setInterval(CountDown, 10, [timeElement, time]);

    //
}));

/** It's count down function.
 * @param {HTMLElement} elm 
 * @param {Number} time 
 */
function CountDown(elm, time) {
    time -= 0.01
    elm.innerText =
    `${Math.floor(Math.trunc(time) / 60).PadTo2Digits()}:${
     (Math.trunc(time) % 60).PadTo2Digits()}.${
     ((time - Math.trunc(time)) * 100).PadTo2Digits()}`;
}