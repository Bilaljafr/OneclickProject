$('#signin-form').submit(function(e){
    e.preventDefault();

    var allFieldsFilled = true;
    $('#signin-form input').each(function() {
        if ($(this).val().trim() === '') {
            $(this).addClass('error');
            allFieldsFilled = false;
        }
        else {
            $(this).removeClass('error');
        }
    });

    if (allFieldsFilled) {
        $.ajax({
            url: '/sign-in',
            type: 'POST',
            data: $('#signin-form').serialize(),
            success: function(data) {
                if(data ==  'Success'){
                    window.location.href = "/dashboard";
                }
                else{
                    alert(data)
                }
            }
        });
    }
});