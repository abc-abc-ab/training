'use strict';
/** 関数
 *  @function Number.prototype.PadTo2Digits
 *  @memberof Number.prototype
 *  @returns {string}
 */
Object.defineProperty(Number.prototype, "PadTo2Digits", {
    value: /** @this {Number}*/function (){return String(this).padStart(2, "0"); },
    writable: false
});
((d, t)=>{
    let count = 0, param = new URLSearchParams(d.location.href), time = Number(param.get("time") || 0);
    const contentElement = d.getElementById("content"),
    timeElement = d.getElementById("time"),
    countElement = d.getElementById("count");
    if (time === null){d.location.href = "./"}

    t.addEventListener("click", (e)=>{
        countElement.innerText = ++count;
    })
    t.addEventListener("beforeunload", (e)=>{history.replaceState("", "", "../timer.html")})
    t.setInterval(CountDown, 1, [timeElement, time])

    //

    history.replaceState("", "", "./timer.html/#")
})(document, window)

/** It's count down function.
 * @param {HTMLElement} elm 
 * @param {Number} time 
 */
function CountDown(elm, time){
    time -= 0.01
    elm.innerText = `${Math.floor(time / 60).PadTo2Digits()}:${(Math.trunc(time) % 60).PadTo2Digits()}.00`;
}
