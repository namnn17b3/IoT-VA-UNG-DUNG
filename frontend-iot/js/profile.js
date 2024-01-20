// ui logic
const togglePassword = document.querySelectorAll('.togglePassword');
const password = document.querySelectorAll('.password');

togglePassword.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        if (password[index].type === 'password') {
            password[index].type = 'text';
            btn.classList.remove('fa-eye');
            btn.classList.add('fa-eye-slash');
        } else {
            password[index].type = 'password';
            btn.classList.remove('fa-eye-slash');
            btn.classList.add('fa-eye');
        }
    });
});

function getMe() {
    // call api logic
    callAPI('api/authen/me', 'GET', null, function () {
        if (this.readyState === 4) {
            data = JSON.parse(this.responseText);
            if (this.status == 200) {
                document.querySelector('.username-title').innerText = data['username'];
                document.querySelector('#username-description').value = data['username'];
                document.querySelector('#email').value = data['email'];
                document.querySelector('#phone').value = formatPhoneNumber(data['phone']);
                document.querySelector('#avatar-user').src = `http://${domain}:${port}/static/authen/avatar/${data['avatar']}`;
    
                const isAdmin = data['isAdmin'];
                if (isAdmin) {
                    document.querySelector('.role').innerText = 'Admin';
                    // document.querySelector('.avatar-img').src = '/assets/img/admin_avatar.jpg';
                } else {
                    document.querySelector('.role').innerText = 'Sinh viên Học Viện Công Nghệ Bưu Chính Viễn Thông';
                }
            }
            else if (this.status == 401) {
                unauthorizedPage();
            }
        }
    });
}

getMe();

function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

function formatPhoneNumberBeforeCallAPI(phone) {
    let res = '';
    for (let i = 0; i < phone.length; i++) {
        if (phone[i] != ' ') {
            res += phone[i];
        }
    }
    return res;
}

document.querySelector('#btn-change-pasword').onclick = () => {
    const currentPassword = document.querySelector('#current-password').value;
    const newPassword = document.querySelector('#new-password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;

    const data = JSON.stringify({
        "currentPassword": currentPassword,
        "newPassword": newPassword,
        "confirmPassword": confirmPassword,
    });

    callAPI('api/authen/change-password', 'POST', data, function () {
        if (this.readyState === 4) {
            response = JSON.parse(this.responseText);
            if (this.status == 201) {
                alert(response['message']);
            }
            else if (this.status == 400) {
                alert(response['message']);
            }
            else if (this.status == 401) {
                unauthorizedPage();
            }
        }
    });
}

document.querySelector('#file-input').onchange = () => {
    var fileSelected = document.querySelector('#file-input').files;
    if (fileSelected.length > 0) {
        var fileToLoad = fileSelected[0];
        var fileReader = new FileReader();
        fileReader.onload = (fileLoaderEvent) => {
            var srcData = fileLoaderEvent.target.result;
            document.querySelector('.avatar-img').src = srcData;
        }
        fileReader.readAsDataURL(fileToLoad);
    }
}

document.querySelector('#btn-update-info').onclick = async () => {
    const email = document.querySelector('#email').value;
    const username = document.querySelector('#username-description').value;
    const phone = document.querySelector('#phone').value;

    const jsonData = JSON.stringify({
        "email": email,
        "username": username,
        "phone": formatPhoneNumberBeforeCallAPI(phone),
    });

    var formData = new FormData();
    var files = document.querySelector('#file-input').files;
    if (files.length > 0) {
        var avatar = files[0];
        formData.append("avatar", avatar); // Đính kèm hình ảnh vào formData
    }
    formData.append("jsonData", jsonData); // Đính kèm JSON vào formData
    
    callAPI('api/authen/update-info', 'POST', formData, function () {
        if (this.readyState === 4) {
            response = JSON.parse(this.responseText);
            if (this.status == 201) {
                alert(response['message']);
                getMe();
            }
            else if (this.status == 400) {
                alert(response['message']);
            }
            else if (this.status == 401) {
                unauthorizedPage();
            }
        }
    });
}
