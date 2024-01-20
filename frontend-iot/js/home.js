const onopenHandler = (event) => {
    console.log('Connected to server ...');
    socket.send(JSON.stringify({
        "from": "user",
        "token": localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz',
        "first": 1
    }));
}

const onerrorHandler = (event) => {
    console.error('WebSocket connection error:', error);
}

const onmessageHandler = (event) => {
    const data = JSON.parse(event.data);
    if (!data['message']) {
        // console.log(data);
        const dataShows = [
            null,
            document.querySelector('#temperature-result span'),
            document.querySelector('#humidity-result span'),
            document.querySelector('#light-result span'),
            document.querySelector('#earth-moisture-result span'),
        ];

        Object.keys(data).forEach((key, index) => {
            if (key != 'from') {
                dataShows[index].innerText = data[key];
            }
        });
        main(data['temperature'], data['humidity'], data['lightValue'], data['earthMoisture']);
    }
    else {
        // Gọi SweetAlert2 mà không chặn mã nguồn khác
        Swal.fire({
            title: data['message'],
            icon: 'error',
        }).then((result) => {
            // Xử lý sự kiện sau khi người dùng đóng thông báo
            // console.log("Sau khi thông báo");
        });
    }
}

const oncloseHandler = (event) => {
    console.log('Disconnected to server ...');
}

connectWebsocket('esp32/websocket', onopenHandler, onmessageHandler, oncloseHandler, onerrorHandler);
