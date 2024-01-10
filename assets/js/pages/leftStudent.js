$('#module-2').addClass('active-page')
$('#sub-module-for-2-2').addClass('active')

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('#academicSessions').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
            $('#academicSessionsForEnable').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        getClassesList()
        $("#academicSessions").select2();
        $("#academicSessionsForEnable").select2();
    }
});

$('#academicSessions').change(function(){
    getClassesList()
})

$('#academicSessionsForEnable').change(function(){
    getClassesListForEnable()
})

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            $("#classofAdmission").html('<option value="">Select class to fetch data</option>')
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classofAdmission').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $("#classofAdmission").select2();
        }
    });
}

function getClassesListForEnable(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSessionsForEnable').val()},
        success: function(data) {
            $("#classofAdmissionForEnable").html('<option value="">Select class of admission</option>')
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classofAdmissionForEnable').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $("#classofAdmissionForEnable").select2();
        }
    });
}

$('#classofAdmission').change(function() {
    getStudentsByClass()
});

$('#zero-conf').DataTable({scrollX: true})
function getStudentsByClass(){
    $('#browseStudentsCard').block();
    $.ajax({
        url: '/students/getLeftStudentsByClass',
        type: 'POST',
        data: {'presentClass': $('#classofAdmission').val(), 'academicSession': $('#academicSessions').val()},
        success: function(data) {
            $('#browseStudentsCard').block({timeout: 0.1});
            var table = $('#zero-conf');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { data: 'GRNumber' },
                    { data: 'StudentsName' },
                    { data: 'FatherName' },
                    { 
                        data: 'ContactNumber',
                        render: function(data, type, full, meta) {
                            if (type === 'display') {
                                return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10);
                            }
                            else {
                                return data;
                            }
                        }
                    },
                    { data: 'DisableReason' },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to enable ' + data.StudentsName + "'s profile")
                }
            }).clear().rows.add(data).draw();
            // table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

$('#enableStudenProfileForm').submit(function(e){
    if(document.getElementById('enableStudenProfileForm').checkValidity() !== false){
        e.preventDefault()
        $('#enableStudenProfileForm').block();
        $.ajax({
            url: '/students/enableStudentProfile',
            type: 'POST',
            data: $('#enableStudenProfileForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    $('#enableStudenProfileForm')[0].reset();
                    triggerAlert('Successfully updated data.', 'success');
                    getStudentsByClass()
                    $('.modal').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#enableStudenProfileForm').block({timeout: 0.1});
            }
        });
    }
})

$('#zero-conf tbody').on('click', 'tr', function () {
    var table = $('#zero-conf').DataTable();
    var data = table.row(this).data();
    getDetails(data.GRNumber)
});

function getDetails(grNumber){
    $('#zero-conf').block();
    $.ajax({
        url: '/general/getStudentDataByGR',
        type: 'POST',
        data: {'studentGRNumber': grNumber, 'academicSessions': $('#academicSessions').val()},
        success: function(data) {
            if(data.length > 0){
                $('#grNumber').val(data[0].GRNumber)
                $('#studentName').html('<b>' + data[0].StudentsName.toUpperCase() + '<b> ' + ((data[0].Gender === 'Male') ? 'S/o' : 'D/o') + ' ' + data[0].FatherName)
                $('#classofAdmissionForEnable').val(data[0].ClassOfAdmission).trigger('change')
                $('#academicSessionsForEnable').val(data[0].AcademicSession).trigger('change')
                $('#studentImage').attr('src', '/assets/images/profilePictures/' + data[0].Image)
                $('.enableStudentDataPopup').modal('show');
            }
            else{
                triggerAlert('No record found. Please check session and GR number.', 'error');
            }
            $('#zero-conf').block({timeout: 0.1});
        }
    });
}

$('#searchByGRBtn').click(function(){
    $('.searchByGRPopup').modal('show');
})

$('#searchByGRForm').submit(function(e){
    if(document.getElementById('searchByGRForm').checkValidity() !== false){
        e.preventDefault()
        getDetails($('#enableStudentID').val())
        $('.searchByGRPopup').modal('hide');
    }
})