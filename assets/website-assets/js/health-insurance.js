$('#healthInsuranceForm').submit(function(e) {
    e.preventDefault();
    var allowSubmit = true;
    $('#healthInsuranceForm input[type="text"], #healthInsuranceForm input[type="email"], #healthInsuranceForm input[type="number"]').each(function() {
        if ($(this).val().trim() === '') {
            $(this).addClass('error');
            allowSubmit = false;
        }
        else {
            $(this).removeClass('error');
        }
    });

    $('#healthInsuranceForm select').each(function() {
        if ($(this).val() === '' || $(this).val() === null && $(this).attr('id') != 'childAges') {
            $(this).next('.select2-container').addClass('error');
            allowSubmit = false;
        }
        else {
            $(this).next('.select2-container').removeClass('error');
        }
    });

    if(allowSubmit){
        $('.insurance-form-inner-container').addClass('loading');
        var formData = new FormData(e.target);
        var jsonFormData = {};
        for (var [key, value] of formData.entries()) {
            jsonFormData[key] = value;
        }

        $.ajax({
            url: '/uploadLifeInsuranceLead', 
            type: 'POST',
            data: jsonFormData,
            success: function(response) {
                if(response == 'Success'){
                    jsonFormData.leadID = response.leadID;
                    localStorage.setItem('lifeInsuranceFormData', JSON.stringify(jsonFormData));
                    showQuestion();
                    // window.location.href = '/thank-you';
                }
                else{
                    alert(response)
                }
                $('.insurance-form-inner-container').removeClass('loading');
            }
        });
    }
});

function setValue(){
    if(localStorage.getItem('lifeInsuranceFormData')){
        var preFilledData = JSON.parse(localStorage.getItem('lifeInsuranceFormData'));
        $('#manufacturer').val(preFilledData.manufacturer).trigger('change')
        $('#engine').val(preFilledData.engine).trigger('change')
        $('#year').val(preFilledData.year).trigger('change')
        $('#price').val(preFilledData.price)

        $('#userName').val(preFilledData.userName)
        $('#emailAddress').val(preFilledData.emailAddress)
        $('#phoneNumber').val(preFilledData.phoneNumber)
    }
}

$("#dateOfBirth").datepicker({
    // minDate: 0,
    maxDate: "+0M +0D"
});

$('#dateOfBirth').change(function() {
    var selectedDate = new Date($(this).val());
    var now = new Date();
    var ageInMilliseconds = now - selectedDate;
    var ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    var remainingDays = (ageInYears - Math.floor(ageInYears)) * 365.25;
    var remainingMonths = remainingDays / 30.4375;
    var years = Math.floor(ageInYears);
    var months = Math.floor(remainingMonths);
    var days = Math.floor(remainingDays - months * 30.4375);

    $('#display-date-of-birth').text(`${years} years, ${months} months, ${days} days old.`);
    $(this).val(selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
});

$('#maritalStatus').change(function(){
    if($(this).val() != 'Single'){
        $('.child-ages-container').fadeIn(500);
    }
    else{
        $('.child-ages-container').fadeOut(500);
    }

    if ($(this).val() !== "") {
        $(this).addClass("has-value");
    }
    else {
        $(this).removeClass("has-value");
    }
})

$("#incomeSource").select2({
    placeholder: "Income source",
});

$("#maritalStatus").select2({
    placeholder: "Marital status",
});

$("#childAges").select2({
    placeholder: "Ages(s) of child",
    tags: true,
    tokenSeparators: [',']
});

// $('select').select2();