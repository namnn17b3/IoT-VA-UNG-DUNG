const paginationElement = document.querySelector(".soTrang");

function createPaginationUI(totalPages, currentPage) {
    let liTag = '';
    let active;
    let beforePage = currentPage - 1;
    let afterPage = currentPage + 1;
    if(currentPage > 2 && totalPages > 4){
        liTag += `<li class="first numb" onclick="nutTrang(1)"><span>1</span></li>`;
        if(currentPage > 3 && totalPages!==5){
            liTag += `<li class="dots"><span>...</span></li>`;
        }
    }
    if (currentPage === totalPages) {
        beforePage = beforePage - 2;
    } else if (currentPage === totalPages - 1) {
        beforePage = beforePage - 1;
    }
    if (currentPage === 1) {
        beforePage=1;
        afterPage = afterPage + 2;
    } else if (currentPage === 2) {
        beforePage = 1;
        afterPage = afterPage + 1;
    }
    for (var plength = beforePage; plength <= afterPage; plength++) {
        if (plength > totalPages) {
            continue;
        }
        if (plength === 0) {
            plength = plength + 1;
        }
        if(currentPage === plength){
            active = "active";
        }else{
            active = "";
        }
        liTag = liTag + `<li class="numb ` + active + `" onclick="nutTrang(` + plength + `)" ><span>` + plength + `</span></li>`;
    }
    if(currentPage < totalPages - 1 && totalPages>4){
        if(currentPage < totalPages - 2  && totalPages!==5){
            liTag += `<li class="dots"><span>...</span></li>`;
        }
        liTag = liTag + `<li class="last numb" onclick="nutTrang(` + totalPages + `)"><span>` + totalPages + `</span></li>`;
    }
    paginationElement.innerHTML = liTag;
}