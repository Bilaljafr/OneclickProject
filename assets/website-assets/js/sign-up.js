$('#signup-form').submit(function(e){
    e.preventDefault();

    var allFieldsFilled = true;
    $('#signup-form input').each(function() {
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
            url: '/sign-up',
            type: 'POST',
            data: $('#signup-form').serialize(),
            success: function(data) {
                if(data ==  'Success'){
                    window.location.href = "/";
                }
                else{
                    alert(data)
                }
            }
        });
    }
});