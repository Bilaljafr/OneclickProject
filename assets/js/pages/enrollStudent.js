$('#module-2').addClass('active-page')
$('#sub-module-for-2-3').addClass('active')
getUpComingGR()

function getUpComingGR(){
    $.ajax({
        url: '/students/getUpcomingGR',
        type: 'GET',
        success: function(data) {
            var UpcomingGR = data[0].GRNumber + 1
            if(UpcomingGR == null){
                UpcomingGR = 1;
            }
            $('#grNumber').val(UpcomingGR)
        }
    });
}

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSession').val()},
        success: function(data) {
            $("#classofAdmission").empty()
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classofAdmission').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                ); 
            });
            $("#classofAdmission").select2();
        }
    });
}

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('#academicSession').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        $("#academicSession").select2();
    }
});

$("#academicSession").change(function(){
    getClassesList()
})

$('#studentAdmissionForm').submit(function(e){
    e.preventDefault()

    if(document.getElementById('studentAdmissionForm').checkValidity() !== false){
        $('#studentAdmissionForm').block();
        $.ajax({
            url: '/students/enrollNewStudent',
            type: 'POST',
            data: $('#studentAdmissionForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    $('#studentAdmissionForm')[0].reset();
                    $('#academicSession').val([]).trigger('change');
                    $('#classofAdmission').val([]).trigger('change');
                    $('#studentAdmissionForm').removeClass('was-validated');

                    triggerAlert('Successfully entered record to database.', 'success');
                    getUpComingGR();
                    $('#studentAdmissionForm').block({timeout: 0.1});
                }
                else{
                    triggerAlert(data, 'error');
                }
            }
        });
    }

})

$('select').select2();    
// $(".js-example-basic-multiple-limit").select2({
//     maximumSelectionLength: 2
// });
// $(".js-example-tokenizer").select2({
//     tags: true,
//     tokenSeparators: [',', ' ']
// });