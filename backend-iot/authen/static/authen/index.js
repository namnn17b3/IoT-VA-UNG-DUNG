// Tạo kết nối WebSocket
const socket = new WebSocket(`ws://${document.domain}:${location.port}/recognize-face`);

// Bắt sự kiện kết nối thành công
socket.addEventListener("open", async (event) => {
    console.log("Connected to Django server!");
    // await sendToServer();
});

// Bắt sự kiện lỗi
socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
});

// Bắt sự kiện đóng kết nối
socket.addEventListener("close", (event) => {
    console.log("Disconnected from Django server.");
});


var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
const video = document.querySelector("#videoElement");

video.width = 400;
video.height = 300;

const timer = ms => new Promise(res => setTimeout(res, ms))

async function initCamera() {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
            video: true,
        })
        .then(async function (stream) {
            window.cameraStream = stream;
            video.srcObject = stream;
            await video.play();
        })
        .catch(function (err) {
            console.log(err);
        });
    }
    else console.log('camera not availability');
}

function stopCamera() {
    if (window.cameraStream) {
        const tracks = window.cameraStream.getTracks();
        tracks.forEach(function (track) {
          track.stop(); // Dừng luồng video
        });
        window.cameraStream = null;
        video.srcObject = null;
        // socket.close();
    }
}

async function sendToServer() {
    await initCamera();
    for (var i = 0; i < 50; i++) {
        width = video.width;
        height = video.height;
        context.drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL("image/jpeg", 0.5);
        context.clearRect(0, 0, width, height);
        socket.send(data);
        await timer(100);
    }
    stopCamera();
}

document.querySelector('#start-stream').onclick = sendToServer;
document.querySelector('#stop-stream').onclick = stopCamera;
