const onopenHandler = (event) => {
    console.log('Connected to server ...');
    socket.send(JSON.stringify({
        "from": "admin",
        "token": localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz',
        "first": 1
    }));
}

const onerrorHandler = (event) => {
    console.error('WebSocket connection error:', error);
}

const onmessageHandler = (event) => {
    const dataResponse = JSON.parse(event.data);
    if (dataResponse['message']) {
        // Gọi SweetAlert2 mà không chặn mã nguồn khác
        Swal.fire({
            title: dataResponse['message'],
            icon: 'error',
        }).then((result) => {
            // Xử lý sự kiện sau khi người dùng đóng thông báo
            // console.log("Sau khi thông báo");
        });
    }
    else {
        const nextStatus = [dataResponse['ledAutoMode'], dataResponse['pumpAutoMode'], dataResponse['maintenanceMode']];
        
        sliders.forEach((item, index) => {
            sliderAction(item, mode[index], nextStatus[index]);
        });
    }
}

const oncloseHandler = (event) => {
    console.log('Disconnected to server ...');
}

connectWebsocket('esp32/websocket', onopenHandler, onmessageHandler, oncloseHandler, onerrorHandler);

const mode = [0, 0, 0]
const sliders = document.querySelectorAll('.slider');
const toggleButtons = document.querySelectorAll('.toggleButton');

function sliderAction(item, currentStatus, nextStatus) {
    if (currentStatus != nextStatus) {
        item.click();
    }
}

function eventPreventDefault(event) {
    event.preventDefault();
    Swal.fire({
        title: 'ESP32 đang ở chế độ bảo trì',
        icon: 'error',
    }).then((result) => {
        // Xử lý sự kiện sau khi người dùng đóng thông báo
        // console.log("Sau khi thông báo");
    });
}

toggleButtons.forEach((item, index) => {
    item.onchange = () => {
        console.log(index, mode[index], (mode[index] + 1) % 2);
        mode[index] = (mode[index] + 1) % 2;
        if (index == 2 && mode[2] == 1) {
            for (let i = 0; i < 2; i++) {
                if (mode[i] == 1) {
                    sliderAction(toggleButtons[i], 1, 0);
                }
                toggleButtons[i].addEventListener('click', eventPreventDefault);
                mode[i] = 0;
            }
        }
        if (index == 2 && mode[2] == 0) {
            for (let i = 0; i < 2; i++) {
                toggleButtons[i].removeEventListener('click', eventPreventDefault);
            }
        }
        if (index < 2 && mode[2] == 1) {
            mode[index] = 0;
            return;
        }
        accessToken = localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz';
        dataRequest = JSON.stringify({
            "from": "admin",
            "token": accessToken,
            "first": 0,
            "ledAutoMode": mode[0],
            "pumpAutoMode": mode[1],
            "maintenanceMode": mode[2]
        });

        socket.send(dataRequest);
    }
});

