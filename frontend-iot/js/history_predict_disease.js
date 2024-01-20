// callAPI('api/authen/me', 'GET', '', function() {
//     if (this.readyState === 4) {
//         if (this.status == 401) {
//             unauthorizedPage();
//         }
//     }
// });

const piwv = 5;
const iip = 5;

function renderTable(response, currentPage) {
    const data = response['dataOfPage'];
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
                <td>${item.sentAt}</td>
                <td>${item.tree}</td>
                <td>
                    <img src="${prefixUrl}${item.image}" style="width: 150px; height: 150px; object-fit: cover;"/>
                </td>
                <td>${item.disease}</td>
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
            let url = `api/disease-detection/history-predict-disease?piwv=${piwv}&iip=${iip}&page=${index}`;
            const startDate = document.querySelector('#start-date').value;
            const endDate = document.querySelector('#end-date').value;

            if (startDate) {
                url = url + `&startDate=${startDate}`;
            }

            if (endDate) {
                url = url + `&endDate=${endDate}`;
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

document.querySelector('#btn-loc-du-lieu').onclick = () => {
    let url = `api/disease-detection/history-predict-disease?piwv=${piwv}&iip=${iip}&&page=1`;
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;

    if (startDate) {
        url = url + `&startDate=${startDate}`;
    }

    if (endDate) {
        url = url + `&endDate=${endDate}`;
    }
    callAPI(url, 'GET', '', function() {
        if (this.readyState === 4) {
            let data = JSON.parse(this.responseText);
            if (this.status == 200) {
                console.log(data);
                renderTable(data, 1);
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

document.querySelector('#btn-export-excel').onclick = () => {
    let url = `api/disease-detection/history-predict-disease/export-excel`;
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;

    if (startDate && endDate) {
        url = url + `?startDate=${startDate}&endDate=${endDate}`;
    }

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
