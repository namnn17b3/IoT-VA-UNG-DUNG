const temperatures = [0, 0, 0, 0, 0, 0, 0];
const humidities = [0, 0, 0, 0, 0, 0, 0];
const lights = [0, 0, 0, 0, 0, 0, 0];
const airPressures = [0, 0, 0, 0, 0, 0, 0];
const graphName = "temperatureGraph"
let ledStatus = [0, 0]
let timeReload = 0;
var labels = ['', '', '', '', '', '', '']
var myChart2;
drawGraph();

async function main(temperature, humidity, lightStatus, airPressureStatus) {
    // setInterval(async () => {
    await getTemperature(temperature)
    await getHumidity(humidity)
    await getLightStatus(lightStatus)
    await getAirPressureStatus(airPressureStatus)

    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    labels.shift()
    labels.push(time)

    myChart2.update()
    // }, 2000);
}
// main()

async function fetchData(url) {
    const response = await fetch(url)
    return await response.json()
}