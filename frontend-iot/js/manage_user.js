// callAPI('api/authen/me', 'GET', '', function() {
//     if (this.readyState === 4) {
//         if (this.status == 401) {
//             unauthorizedPage();
//         }
//     }
// });

const piwv = 5;
const iip = 5;
let currentPageGlobal = 1;

let data = null;

function renderTable(response, currentPage) {
    currentPageGlobal = currentPage;
    data = response['dataOfPage'];
    const panelNoData = document.querySelector('#panel-no-data');
    const phanTrang = document.querySelector('.phanTrang');
    const btnPaginations = document.querySelector('.phanTrang ul');
    const tbody = document.querySelector('tbody');
    if (data.length == 0) {
        panelNoData.style.display = 'block';
        document.querySelector('#esp32-info-panel').style.display = 'flex';
        document.querySelector('#esp32-info-panel span').innerText = 'Không tìm thấy dữ liệu';
        tbody.innerHTML = '';
        phanTrang.style.display = 'none';
        return;
    }
    let htmlTable = '';
    for (item of data) {
        htmlTable = htmlTable + `
            <tr>
                <td>${item.STT}</td>
                <td>
                    <img src="${prefixUrl}${item.avatar}" style="width: 150px; height: 150px; object-fit: cover;"/>
                </td>
                <td>${item.username}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>
                    <div style="width: 100%; height: 100%; display: flex; justify-content: space-around;">
                        <div class="btn-action" style="background-color: #0866ff; color: #fff; display: flex; width: 80px; height: 30px; border-radius: 6px; cursor: pointer;" onclick="editUser(${item.id})">
                            <span style="margin: auto;">
                                Edit &nbsp;<i class="fa-solid fa-pen-to-square"></i>
                            </span>
                        </div>
                        <div class="btn-action" style="background-color: #f00; color: #fff; display: flex; width: 80px; height: 30px; border-radius: 6px; cursor: pointer;" onclick="deleteUser(${item.id})">
                            <span style="margin: auto;">
                                Delete &nbsp;<i class="fa-solid fa-trash"></i>
                            </span>
                        </div>
                    </div>
                </td>
            </tr>`;
    }
    
    tbody.innerHTML = htmlTable;
    panelNoData.style.display = 'none';
    const totalPages = response['totalPages'];

    if (totalPages == 1) {
        return;
    }

    phanTrang.style.display = 'block';
    const startPage = response['startPage'];
    const endPage = response['endPage'];

    let htmlPagination = currentPage == 1 ? '' :
    `<li class="numb item-${currentPage - 1} nutPaginate" style="color: white">
        <span><i class="fas fa-angle-left"></i></span>
    </li>`;
 
    for (let i = startPage; i <= endPage; i++) {
        if (i != currentPage) {
            htmlPagination = htmlPagination +
            `<li class="numb item-${i} inactive"><span>${i}</span></li>`;
        }
        else {
            htmlPagination = htmlPagination +
            `<li class="numb item-${i} active"><span>${i}</span></li>`;
        }
    }

    htmlPagination =
    `<span class="soTrang">
        ${htmlPagination}
    </span>`;

    htmlPagination = htmlPagination + (
        currentPage == totalPages ? '' :
        `<li class="numb item-${currentPage + 1} nutPaginate" style="color: white">
            <span><i class="fas fa-angle-right"></i></span>
        </li>`
    );

    btnPaginations.innerHTML = htmlPagination;
    console.log(currentPage);

    document.querySelectorAll('.numb').forEach(record => {
        const index = parseInt(record.classList[1].split('-')[1]);
        record.onclick = () => {
            let url = `api/admin/crud-user?piwv=${piwv}&iip=${iip}&page=${index}`;
            const queryText = document.querySelector('#query-text').value;

            if (queryText) {
                url = url + `&queryText=${queryText}`;
            }

            callAPI(url, 'GET', '', function() {
                if (this.readyState === 4) {
                    let data = JSON.parse(this.responseText);
                    if (this.status == 200) {
                        console.log(data);
                        renderTable(data, index);
                    }
                    else if (this.status == 400 || this.status == 403) {
                        alert(data['message']);
                    }
                    else if (this.status == 401) {
                        unauthorizedPage();
                    }
                }
            });
        }
    });
}

function filterData(page = null) {
    let url = `api/admin/crud-user?piwv=${piwv}&iip=${iip}&&page=${page ? page : 1}`;
    const queryText = document.querySelector('#query-text').value;

    if (queryText) {
        url = url + `&queryText=${queryText}`;
    }

    callAPI(url, 'GET', '', function() {
        if (this.readyState === 4) {
            let dataResponse = JSON.parse(this.responseText);
            if (this.status == 200) {
                renderTable(dataResponse, 1);
            }
            else if (this.status == 400 || this.status == 403) {
                alert(dataResponse['message']);
            }
            else if (this.status == 401) {
                unauthorizedPage(); 
            }
        }
    });
}

document.querySelector('#btn-loc-du-lieu').onclick = () => {
    filterData();
}

document.querySelector('#btn-export-excel').onclick = () => {
    let url = 'api/admin/export-users';

    callAPIDowload(url, 'GET', '', async function() {
        if (this.status === 200) {
            // Kiểm tra xem trình duyệt có hỗ trợ createObjectURL không
            if (window.URL && window.URL.createObjectURL) {
                // Tạo đường dẫn tạm thời để tải tệp
                var url = window.URL.createObjectURL(this.response);

                // Tạo một thẻ 'a' để tải tệp
                var a = document.createElement('a');
                a.href = url;
                a.download = `history_predict_disease_${new Date().getTime()}.xlsx`;

                // Thêm thẻ 'a' vào body và kích hoạt nó
                document.body.appendChild(a);
                a.click();

                // Loại bỏ đường dẫn tạm thời và thẻ 'a'
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.log('Trình duyệt không hỗ trợ createObjectURL.');
            }
        }
        else if (this.status == 400 || this.status == 403) {
            const dataRes = JSON.parse(await this.response.text());
            alert(dataRes['message']);
        }
        else if (this.status == 401) {
            unauthorizedPage();
        }
    });
}

const handleWheelEvent = function (e) {
    e.preventDefault();
}

function hiddenScrollBar() {
    document.body.addEventListener('wheel', handleWheelEvent, { passive: false });

    document.querySelector('head').insertAdjacentHTML('beforeend', `
    <style>
        body::-webkit-scrollbar {
            width: 0px;
        }
    </style>
    `);
}

function showScrollBar() {
    document.body.removeEventListener('wheel', handleWheelEvent, { passive: false });
    const head = document.querySelector('head');
    head.removeChild(head.lastElementChild);
}

function turnOffUserForm() {
    const divBlur = document.querySelector('#div-blur');
    const wapper = document.querySelector('#wapper');
    
    divBlur.style.display = 'none';
    wapper.style.display = 'none';

    showScrollBar();
}

function turnOnUserForm() {
    const divBlur = document.querySelector('#div-blur');
    const wapper = document.querySelector('#wapper');

    document.querySelector('#user-email').value = '';
    document.querySelector('#user-username').value = '';
    document.querySelector('#user-password').value = '';
    document.querySelector('#user-phone').value = '';
    document.querySelector('#user-avatar').value = '';

    setCheckBtn(document.querySelector('#doan-benh'), 1);
    setCheckBtn(document.querySelector('#xem-export-lich-su-doan-benh'), 1);
    setCheckBtn(document.querySelector('#xem-export-du-lieu-moi-truong'), 1);
    setCheckBtn(document.querySelector('#bat-tat-led'), 1);
    setCheckBtn(document.querySelector('#bat-tat-pump'), 1);
    
    divBlur.style.display = 'block';
    wapper.style.display = 'block';
    hiddenScrollBar();
}

function setCheckBtn(checkBtn, value) {
    if (value == true) {
        checkBtn.checked = true;
        checkBtn.value = 1;
    }
    else {
        checkBtn.checked = false;
        checkBtn.value = 0;
    }
}

document.querySelector('.btn-cancel').onclick = turnOffUserForm;

function handlePostOrPut(url, id) {
    const jsonData = JSON.stringify({
        'id': id,
        'email': document.querySelector('#user-email').value,
        'username': document.querySelector('#user-username').value,
        'password': document.querySelector('#user-password').value,
        'phone': document.querySelector('#user-phone').value,
        'doanBenh': document.querySelector('#doan-benh').checked ? 1 : 0,
        'xemExportLichSuDoanBenh': document.querySelector('#xem-export-lich-su-doan-benh').checked ? 1 : 0,
        'xemExportDuLieuMoiTruong': document.querySelector('#xem-export-du-lieu-moi-truong').checked ? 1 : 0,
        'batTatLed': document.querySelector('#bat-tat-led').checked ? 1 : 0,
        'batTatPump': document.querySelector('#bat-tat-pump').checked ? 1 : 0
    });
    
    const formData = new FormData();
    var files = document.querySelector('#user-avatar').files;
    if (files.length > 0) {
        var avatar = files[0];
        formData.append("avatar", avatar); // Đính kèm hình ảnh vào formData
    }
    console.log(jsonData);
    formData.append('jsonData', jsonData);

    callAPI(url, 'POST', formData, function() {
        if (this.readyState === 4) {
            response = JSON.parse(this.responseText);
            if (this.status == 201 || this.status == 200) {
                alert(response['message']);
                turnOffUserForm();
                if (id == -1) {
                    filterData();            
                }
                else {
                    filterData(currentPageGlobal);
                }
            }
            else if (this.status == 400 || this.status == 403) {
                alert(response['message']);
            }
            else if (this.status == 401) {
                unauthorizedPage();
            }
        }
    });
}

let apiURL = 'api/admin/crud-user';
let userId = -1;

function editUser(id) {
    turnOnUserForm();
    apiURL = 'api/admin/update-user';
    userId = id;

    let user = null;
    for (item of data) {
        if (item.id == id) {
            user = item;
            break;
        }
    }

    document.querySelector('#user-email').value = user.email;
    document.querySelector('#user-username').value = user.username;
    document.querySelector('#user-phone').value = user.phone;

    setCheckBtn(document.querySelector('#doan-benh'), user.doanBenh);
    setCheckBtn(document.querySelector('#xem-export-lich-su-doan-benh'), user.xemExportLichSuDoanBenh);
    setCheckBtn(document.querySelector('#xem-export-du-lieu-moi-truong'), user.xemExportDuLieuMoiTruong);
    setCheckBtn(document.querySelector('#bat-tat-led'), user.batTatLed);
    setCheckBtn(document.querySelector('#bat-tat-pump'), user.batTatPump);
}

document.querySelector('#btn-add-new').onclick = () => {
    apiURL = 'api/admin/crud-user';
    userId = -1;
    turnOnUserForm();
}

document.querySelector('.btn-ok').onclick = () => {
    handlePostOrPut(apiURL, userId);
}

function deleteUser(id) {
    let user = null;
    for (item of data) {
        if (item.id == id) {
            user = item;
            break;
        }
    }

    alert(`Are you sure delete user with email: ${user.email}`);

    const dataRequest = JSON.stringify({
        'id': user.id
    });

    callAPI('api/admin/crud-user', 'DELETE', dataRequest, function() {
        if (this.readyState === 4) {
            response = JSON.parse(this.responseText);
            if (this.status == 200) {
                alert(response['message']);
                filterData(data['currentPage']);
            }
            else if (this.status == 400 || this.status == 403) {
                alert(response['message']);
            }
            else if (this.status == 401) {
                unauthorizedPage();
            }
        }
    });
}
