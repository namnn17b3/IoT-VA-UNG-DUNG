callAPI('api/authen/me', 'GET', null, function() {
    if (this.readyState === 4) {
        data = JSON.parse(this.responseText);
        if (this.status == 200) {
            const isAdmin = data['isAdmin'];
            document.querySelectorAll('.fn-admin').forEach(item => {
                if (isAdmin) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }
        else if (this.status == 401) {
            unauthorizedPage();
        }
    }
});