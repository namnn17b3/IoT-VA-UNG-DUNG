document.querySelector('#missing-password-btn').onclick = () => {
    const email = document.querySelector('#email').value;
    let data = JSON.stringify({
        email: email
    });
    callAPI('api/authen/missing-password', 'POST', data, function() {
        try {
            if (this.readyState === 4) {
                data = JSON.parse(this.responseText);
                alert(data['message']);
            }
        } catch (error) {
            badGetWay();
        }
    });
}