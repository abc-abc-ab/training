((d, t)=>{
    let time = param.get("time"), count = 0, param = new URLSearchParams(d.location.href);
    const contentElement = d.getElementById("content"),
    timeElement = d.getElementById("time"),
    countElement = d.getElementById("count");

    if (time === null){d.location.href = "./"}

    t.addEventListener("click", (e)=>{
        countElement.innerText = ++count;
    })

    
    history.replaceState("", "", "./timer.html/#")
})(document, window)