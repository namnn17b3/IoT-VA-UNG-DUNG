document.querySelector('#login-btn').onclick = () => {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    data = JSON.stringify({
        email, password
    });

    callAPI('api/authen/login', 'POST', data, function () {
        if (this.readyState === 4) {
            data = JSON.parse(this.responseText);
            if (this.status == 200) {
                localStorage.setItem('accessToken', data['accessToken']);
                redirect('../home.html');
            }
            else if (this.status == 401) {
                alert(data['message']);
            }
        }
    });
}

document.querySelector('#register-btn').onclick = () => {
    const email = document.querySelector('#register-email').value;
    const username = document.querySelector('#register-username').value;
    const phone = document.querySelector('#register-phone').value;
    const password = document.querySelector('#register-password').value;
    const confirmPassword = document.querySelector('#register-confirm-password').value;
    data = JSON.stringify({
        'email': email,
        'username': username,
        'password': password,
        'phone': phone,
        'confirm-password': confirmPassword
    });

    callAPI('api/authen/register', 'POST', data, function () {
        if (this.readyState === 4) {
            data = JSON.parse(this.responseText);
            if (this.status == 201) {
                localStorage.setItem('accessToken', data['accessToken']);
                redirect('../home.html');
            }
            else if (this.status == 400) {
                alert(data['message']);
            }
        }
    });
}

const eyesPasswordVisible = document.querySelectorAll('.eyes-password-visible');
const eyesPasswordUnVisible = document.querySelectorAll('.eyes-password-unvisible');
const passwordFields = document.querySelectorAll('.password');

eyesPasswordVisible.forEach((item, index) => {
    item.onclick = () => {
        eyesPasswordUnVisible[index].style.display = 'block';
        passwordFields[index].type = 'text';
        item.style.display = 'none';
    }
});

eyesPasswordUnVisible.forEach((item, index) => {
    item.onclick = () => {
        eyesPasswordVisible[index].style.display = 'block';
        passwordFields[index].type = 'password';
        item.style.display = 'none';
    }
});
