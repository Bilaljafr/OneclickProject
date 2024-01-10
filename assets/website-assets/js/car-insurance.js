var carDetails = '';
$.ajax({
    url: '/getCarDetails',
    type: 'POST',
    data: {'manufacturerID': $('#manufacturer').val()},
    success: function(data) {
        carDetails = data;
        $('#manufacturer').html('<option value="">Select manufacturer</option>')
        data.forEach(element => {
            $('#manufacturer').append(`<option value="${element.ID}">${element.Brand}</option>`)
        });
        $('#manufacturer').select2();
        $('#model').select2();
        $('#year').select2();
        setValue();
        $('.insurance-form-inner-container').removeClass('loading');    
    }
});

$('#manufacturer').change(function(){
    $('#model').html('<option value="">Select model</option>')
    if($('#manufacturer').val() != ''){
        var selectedCar = carDetails.find(function(obj) { return obj.ID == $('#manufacturer').val(); })
        selectedCar.Model.split(',').forEach(element => {
            $('#model').append(`<option value="${element}">${element}</option>`)
        });
    }
    $('#year').html('<option value="">Select year</option>')

    // show validation
    if($(this).val() == ''){
        showValidation('.error-for-manufacturer', 'Please select car manufacturer.');
    }
    else{
        showValidation('.error-for-manufacturer', '');
    }
});

$('#model').change(function(){
    $('#year').html('<option value="">Select year</option>')
    if($('#model').val() != ''){
        var selectedCar = carDetails.find(function(obj) { return obj.ID == $('#manufacturer').val(); })
        selectedCar.ManufacturingYear.split(',').forEach(element => {
            $('#year').append(`<option value="${element}">${element}</option>`)
        });
    }

    // show validation
    if($(this).val() == ''){
        showValidation('.error-for-model', 'Please select model of car.');
    }
    else{
        showValidation('.error-for-model', '');
    }
});

$('#year').change(function() {
    if($(this).val() == ''){
        showValidation('.error-for-year', 'Please select model year.');
    }
    else{
        showValidation('.error-for-year', '');
    }
});

$('#price').on('input', function () {
    let numericValue = $(this).val().replace(/[^0-9]/g, '');
    if (!isNaN(parseFloat(numericValue))) {
        $('#amount-in-words').text(numberToWords(numericValue) + ' rupees.');
        $(this).val('Rs. ' + parseFloat(numericValue).toLocaleString('en-US') || '');
    }
    else {
        $(this).val('');
        $('#amount-in-words').text('');
    }

    // validation work
    if($(this).val() == ''){
        showValidation('.error-for-price', 'Please select car value.');
    }
    else{
        showValidation('.error-for-price', '');
    }
});

$('#userName').change(function() {
    if($(this).val() == ''){
        showValidation('.error-for-username', 'Please provide your name.');
    }
    else{
        showValidation('.error-for-username', '');
    }
});

$('#emailAddress').change(function() {
    if($(this).val() == ''){
        showValidation('.error-for-email', 'Please provide an email address.');
    }
    else{
        showValidation('.error-for-email', '');
    }
});

$('#phoneNumber').change(function() {
    if($(this).val() == ''){
        showValidation('.error-for-phone', 'Please provide a valid phone number.');
    }
    else{
        showValidation('.error-for-phone', '');
    }
});

let allowSubmit = true, allowNext = true;
$('#next').click(function() {
    allowNext = true;
    $('.field-error').text('');
    if($('#manufacturer').val() == ''){
        showValidation('.error-for-manufacturer', 'Please select car manufacturer.');
        allowNext = false;
    }

    if($('#model').val() == ''){
        showValidation('.error-for-model', 'Please select model of car.');
        allowNext = false;
    }

    if($('#year').val() == ''){
        showValidation('.error-for-year', 'Please select model year.');
        allowNext = false;
    }

    if($('#price').val() == ''){
        showValidation('.error-for-price', 'Please select car value.');
        allowNext = false;
    }

    if (allowNext) {
        $('#carDetails').fadeOut(1);
        $('#contactDetails').fadeIn(1);
    }
});

$('#previous').click(function() {
    $('#contactDetails').fadeOut(1);
    $('#carDetails').fadeIn(1);
});

function showValidation(destination, message){
    $(destination).text(message);
}

$('#price').on('input', function () {
    let numericValue = $(this).val().replace(/[^0-9]/g, '');
    if (!isNaN(parseFloat(numericValue))) {
        $('#amount-in-words').text(numberToWords(numericValue) + ' rupees.');
        $(this).val('Rs. ' + parseFloat(numericValue).toLocaleString('en-US') || '');
    }
    else {
        $(this).val('');
        $('#amount-in-words').text('');
    }
});

// $('#carInsuranceForm').submit(function(e) {
//     e.preventDefault();
//     if(allowSubmit){
//         var formData = new FormData(e.target);
//         var jsonFormData = {};
//         for (var [key, value] of formData.entries()) {
//             jsonFormData[key] = value;
//         }

//         localStorage.setItem('formData', JSON.stringify(jsonFormData));
//         e.target.reset();
//         window.location.href = '/insurance-offers';
//     }
//     else{
//         alert('Please provide all required details.')
//     }
// });

$('#carInsuranceForm').submit(function(e) {
    e.preventDefault();
    allowSubmit = true;
    if($('#userName').val() == ''){
        showValidation('.error-for-username', 'Please provide your name.');
        allowSubmit = false;
    }

    if($('#emailAddress').val() == ''){
        showValidation('.error-for-email', 'Please provide an email address.');
        allowSubmit = false;
    }

    if($('#phoneNumber').val() == ''){
        showValidation('.error-for-phone', 'Please provide a valid phone number.');
        allowSubmit = false;
    }

    if(allowNext && allowSubmit){
        $('#contactDetails').addClass('loading');
        var formData = new FormData(e.target);
        var jsonFormData = {};
        for (var [key, value] of formData.entries()) {
            jsonFormData[key] = value;
        }
        jsonFormData.carMake = $('#manufacturer').find(":selected").text();

        $.ajax({
            url: '/uploadCarInsuranceLead', 
            type: 'POST',
            data: jsonFormData,
            success: function(response) {
                if(response.message == 'Success'){
                    jsonFormData.leadID = response.leadID;
                    localStorage.setItem('carInsuranceformData', JSON.stringify(jsonFormData));
                    window.location.href = '/car-insurance-offers';
                }
                else{
                    alert(response)
                }
                $('#contactDetails').removeClass('loading');
            }
        });
    }
    else{
        alert('Please provide all required details.')
    }
});

function setValue(){
    if(localStorage.getItem('formData')){
        var preFilledData = JSON.parse(localStorage.getItem('formData'));
        $('#manufacturer').val(preFilledData.manufacturer).trigger('change')
        $('#model').val(preFilledData.model).trigger('change')
        $('#year').val(preFilledData.year).trigger('change')
        $('#price').val(preFilledData.price)

        $('#userName').val(preFilledData.userName)
        $('#emailAddress').val(preFilledData.emailAddress)
        $('#phoneNumber').val(preFilledData.phoneNumber)
    }
}

function numberToWords(num) {
    // Function to convert a number to words
    const units = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['thousand', 'million', 'billion', 'trillion'];
  
    function convertGroup(num) {
        if (num === 0) return '';
        if (num < 10) return units[num];
        if (num < 20) return teens[num - 11];
        if (num < 100) return tens[Math.floor(num / 10) - 1] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
        if (num < 1000) return units[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + convertGroup(num % 100) : '');
    }
  
    if (isNaN(num)) return 'Invalid Number';
  
    let number = parseFloat(num);
    if (number === 0) return 'Zero';
  
    let i = 0;
    let words = '';
    while (number > 0) {
      if (number % 1000 !== 0) {
            words = convertGroup(number % 1000) + (i > 0 ? ' ' + thousands[i - 1] + ' ' : '') + words;
      }
      number = Math.floor(number / 1000);
      i++;
    }
  
    // Convert the result to sentence case
    return words.trim().replace(/^\w/, l => l.toUpperCase());
}  