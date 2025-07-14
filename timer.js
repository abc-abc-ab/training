((d, t)=>{
    let count = 0;
    const timeElement = d.getElementById("time"),
    countElement = d.getElementByid("count");

    t.addEventListener("click", (e)=>{
        countElement.innerText = ++count;
    })

    timeElement.innerText// = [URLパラメータ]
})(document, window)
