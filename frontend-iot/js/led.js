function getLedStatus(ledNumber, ledStatus) {
    var ledBackground = document.querySelector("#led-background-" + ledNumber)
    var ledResult = 'Bật'
    var classes = 'o-vuong'
    if (ledStatus == 1) {
        classes += ' led-on-' + ledNumber
    }
    else if (ledStatus == 0) {
        ledResult = 'Tắt'
        classes += ' led-off'
    }

    document.querySelector("#led-result-" + ledNumber).innerHTML = ledResult
    ledBackground.setAttribute('class', classes)
}

async function led_on_off(ledNumber) {
    // console.log(ledNumber)
    const data = {}
    if (ledNumber == 1) {
        if (ledStatus[0] == 1) {
            data.led1 = 0;
            ledStatus[0] = 0;
        }
        else {
            data.led1 = 1
            ledStatus[0] = 1;
        }
    }
    else {
        if (ledStatus[1] == 1) {
            data.led2 = 0
            ledStatus[1] = 0;
        }
        else {
            data.led2 = 1
            ledStatus[1] = 1;
        }
    }
    await sendLedControl(ledNumber, data)
}

async function sendLedControl(ledNumber, data) {
    console.log(ledNumber, ledStatus[ledNumber - 1])
    getLedStatus(ledNumber, ledStatus[ledNumber - 1])
}