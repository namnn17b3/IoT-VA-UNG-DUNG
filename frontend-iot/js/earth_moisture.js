async function getAirPressureStatus(newAirPressure) {
    airPressures.shift()
    airPressures.push(newAirPressure)

    var classess = "stretch-card width-24 "
    var airPressureBackground = document.querySelector("#earth-moisture-background")
    if (newAirPressure >= 100) {
        classess += "earth-moisture-100"
    }
    else if (newAirPressure >= 75) {
        classess += "earth-moisture-75"
    }
    else if (newAirPressure >= 50) {
        classess += "earth-moisture-50"
    }
    else if (newAirPressure >= 25) {
        classess += "earth-moisture-25"
    }
    else {
        classess += "earth-moisture-0"
    }
    airPressureBackground.setAttribute("class", classess)
}