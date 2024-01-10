var manufacturerDetails = '';
var yearDetails = '';
$.ajax({
    url: '/getManufacturer',
    type: 'POST',
    data: {'ManufacturerID': $('#Manufacturer').val()},
    success: function(data) {
        manufacturerDetails = data;
        yearDetails = data;
        $('#manufacturer').html('<option value="">Select manufacturer</option>')
        data.forEach(element => {
            $('#manufacturer').append(`<option value="${element.ID}">${element.Brand}</option>`)
        });
        $('#manufacturer').select2();
        $('#engine').select2();
        $('#year').select2();
    }
});

$('#manufacturer').change(function(){
    if($('#Manufacturer').val() != ''){
        var engines = $.grep(manufacturerDetails, function(obj) { return obj.ID == $('#manufacturer').val(); })[0];
        $('#engine').html('<option value="">Select manufacturing year</option>')
        engines.Engine.split(',').forEach(element => {
            $('#engine').append(`<option value="${element}">${element}</option>`)
        });

        var year = $.grep(yearDetails, function(obj) { return obj.ID == $('#manufacturer').val(); })[0];
        $('#year').html('<option value="">Select year</option>')
        year.Year.split(',').forEach(element => {
            $('#year').append(`<option value="${element}">${element}</option>`)
        });
    }
    else{
        $('#engine').html('<option value="">Select manufacturing year</option>')
        $('#year').html('<option value="">Select year</option>')
    }
    $('#engine').select2();
    $('#year').select2();
});

$('#next').click(function() {
    $('#bikeDetails').fadeOut(200);
    $('#contactDetails').fadeIn(200);
});

$('#btnSubmit').click(function() {
    $('#contactDetails').fadeOut(200);
    $('#bikeDetails').fadeIn(200);
});

$('#myForm').submit(function(event) {
    event.preventDefault(); 
    var formData = new FormData(event.target);
    var jsonFormData = {};
    for (var [key, value] of formData.entries()) {
        jsonFormData[key] = value;
    }
    
    localStorage.setItem('formData', JSON.stringify(jsonFormData));
    event.target.reset();

    // Send form data to the backend
    $.ajax({
        url: '/submit', 
        type: 'POST',
        data: jsonFormData,
        success: function(response) {
          console.log(response);
        },
        error: function(xhr, status, error) {
          console.log('Error:', error);
        }
    });
});

console.log(localStorage.getItem('formData'));