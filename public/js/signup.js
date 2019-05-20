function CheckSubmit() {
    var email = document.getElementById("txtemail");
    if (email.value == "")
    {
        alert("Yêu cầu nhập email!");
        email.focus();
        return false;
    }

    var name = document.getElementById("txtname");
    if (name.value == "")
    {
        alert("Yêu cầu nhập tên!");
        name.focus();
        return false;
    }

    var numberPhone= document.getElementById("txtnumberPhone");
    if (numberPhone.value == "")
    {
        alert("Yêu cầu nhập số điện thoại!");
        numberPhone.focus();
        return false;
    }
    
    var password = document.getElementById("txtpassword");
    if (password.value == "")
    {
        alert("Yêu cầu nhập mật khẩu!");
        password.focus();
        return false;
    }

    var confirm_password = document.getElementById("txtconfirm_password");
    if (confirm_password.value == "")
    {
        alert("Yêu cầu nhập kiểm tra mật khẩu!");
        confirm_password.focus();
        return false;
    }

    return true;
}