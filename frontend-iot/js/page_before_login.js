callAPI('api/authen/me', 'GET', null, function() {
    if (this.readyState === 4) {
        data = JSON.parse(this.responseText);
        if (this.status == 200) {
            homePage();
        }
        else if (this.status == 401) {
            console.log('Login please !!!');
        }
    }
});