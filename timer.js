((d, t)=>{
    let count = 0, param = new URLSearchParams(d.location.href), time = param.get("time");
    const contentElement = d.getElementById("content"),
    timeElement = d.getElementById("time"),
    countElement = d.getElementById("count");

    if (time === null){d.location.href = "./"}

    t.addEventListener("click", (e)=>{
        countElement.innerText = ++count;
    })

    t.addEventListener("beforeunload", (e)=>{history.replaceState("", "", "./timer.html")})
    
    history.replaceState("", "", "./timer.html/#")
})(document, window)