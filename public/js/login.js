function CheckSubmit() {
    var username = document.getElementById("txtusername");
    if (username.value == "")
    {
        alert("Yêu cầu nhập tên đăng nhập!");
        username.focus();
        return false;
    }

    var password = document.getElementById("txtpassword");
    if (password.value == "")
    {
        alert("Yêu cầu nhập mật khẩu!");
        password.focus();
        return false;
    }

    return true;
}