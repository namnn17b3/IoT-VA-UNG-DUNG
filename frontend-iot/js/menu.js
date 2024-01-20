document.querySelector('#logout-btn').onclick = () => {
    callAPI('api/authen/logout', 'GET', null, function() {
        if (this.readyState === 4) {
            data = JSON.parse(this.responseText);
            if (this.status == 200) {
                localStorage.removeItem('accessToken');
                logout();
            }
            else if (this.status == 400) {
                redirect('./error/401_unauthorized.html');
            }
        }
    });
}