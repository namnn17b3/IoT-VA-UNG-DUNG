async function getTemperature(newTemperature) {
    temperatures.shift()
    temperatures.push(newTemperature)

    //chỉnh màu nền cho ô này tùy theo nhiệt độ
    var temperatureBackground = document.querySelector("#temperatureBackground")
    var classes = "stretch-card width-24"
    if (newTemperature >= 70)
        classes += " temperature-70"
    else if (newTemperature >= 50)
        classes += " temperature-50"
    else if (newTemperature >= 30)
        classes += " temperature-30"
    else
        classes += " temperature-0"
    temperatureBackground.setAttribute("class", classes)
}
