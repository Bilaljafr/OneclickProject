$(document).ready(function(){
    $('#submit').click(function(event){
        event.preventDefault();
        var arr = $('input'), allow = true;
        for(var i = 0; i < arr.length; i++){
            if(arr[i].value == "") {
                $(arr[i]).css("border-color", "red");
                allow = false
            }
            else{
                $(arr[i]).css("border-color", "#e8e8e8");
            }
        }

        if($('#loginType').val() == "") {
            triggerAlert('Please select login type.', 'error');
            allow = false
        }
        else{
            $('.select2-selection').css("border-color", "#e8e8e8");
        }

        // triggerAlert('This is an ERROR notification');
        // triggerAlert('This is an ERROR notification', 'success');
        if(allow){
            $(this).prepend(`<div class="spinner-border spinner-border-sm" role="status"></div>&emsp;`).prop('disabled', true)
            $.ajax({
                url: "/",
                type: 'POST',
                data: {'email': $('#useremail').val(), 'password': $('#password').val(), 'loginType': $('#loginType').val()},
                success: function(result){
                    $('#submit').text('Sign in').attr('disabled', false)
                    if(result == 'Success'){
                        window.location.href = '/dashboard'
                    }
                    else{
                        triggerAlert(result, 'error');
                    }
                }
            });
        }
    })

    const inputs = document.getElementsByClassName('form-control');
    Array.from(inputs).forEach((input) => {
        const label = input.nextElementSibling;
        input.addEventListener('focus', () => {
            label.classList.add('active');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                label.classList.remove('active');
            }
        });
    });

    $('select').select2()
    $('#useremail').focus()
})
