const port = location.port;
const domain = document.domain;
const http = window.location.href.includes('https') ? 'https' : 'http';
const prefixUrl = `${http}://${domain}:${port}/`;

function redirect(url) {
    console.log(url);
    const aTag = document.createElement('a');
    aTag.href = url;
    document.querySelector('body').insertAdjacentElement('afterbegin', aTag);
    aTag.click();
}

function callAPI(url, method,  data=null, handler) {
    if (data instanceof FormData) {
        console.log(data.get('jsonData'));
    }
    const apiUrl = `${prefixUrl}${url}`;
    const accessToken = localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz';

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", handler);

    xhr.open(method, apiUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    if (data instanceof FormData) {
        console.log(data.get('jsonData'));
    }
    else {
        xhr.setRequestHeader("Content-Type", "*/*");
    }
    xhr.send(data);
}

function callAPIDowload(url, method,  data=null, handler) {
    const apiUrl = `${prefixUrl}${url}`;
    const accessToken = localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : 'abcxyz';

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("load", handler);

    xhr.open(method, apiUrl, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.send(data);
}

function unauthorizedPage() {
    redirect(`http://${document.domain}:${location.port}/N17-IoT/error/401_unauthorized.html`);
}

function badGetWay() {
    redirect(`http://${document.domain}:${location.port}/N17-IoT/error/502_badgetway.html`);
}

function homePage() {
    redirect(`http://${document.domain}:${location.port}/N17-IoT/home.html`)
}

function logout() {
    redirect(`http://${document.domain}:${location.port}/N17-IoT/authen/login.html`)
}

const wsURLPrefix = `ws://${domain}:${port}/`;
let socket = null;
function connectWebsocket(url, onopenHandler, onmessageHandler, oncloseHandler, onerrorHandler) {
    socket = new WebSocket(`${wsURLPrefix}${url}`);
    socket.onopen = onopenHandler;
    socket.onmessage = onmessageHandler;
    socket.onclose = oncloseHandler;
    socket.onerror = onerrorHandler;
}
