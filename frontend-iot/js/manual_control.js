const leds = [
    document.querySelector('#led-background-1'),
    document.querySelector('#led-background-2')
]

const ledResults = [
    document.querySelector('#led-result-1'),
    document.querySelector('#led-result-2')
];

const ledColors = ['#c2e207', '#1d9ec5'];

const ledCount = [0, 0];

leds.forEach((item, index) => {
    item.onclick = () => {
        ledCount[index] = (ledCount[index] + 1) % 2;
        if (ledCount[index] == 0) {
            item.style.backgroundColor = 'unset';
            ledResults[index].innerText = 'Tắt';
        }
        else {
            item.style.backgroundColor = ledColors[index];
            ledResults[index].innerText = 'Bật';
        }
        socket.send(JSON.stringify({
            "from": "user",
            "token": localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz',
            "first": 0,
            "ledMode": ledCount[0],
            "pumpMode": ledCount[1],
            "drive": index == 0 ? "LED" : "PUMP"
        }));
    }
});
