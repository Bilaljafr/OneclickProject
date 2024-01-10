$('#module-2').addClass('active-page')
$('#sub-module-for-2-1').addClass('active')

$('#classofAdmission').change(function() {
    getStudentsByClass()
});

$('#academicSessions').change(function() {
    getStudentsByClass()
});

$('#zero-conf').DataTable({scrollX: true})
function getStudentsByClass(){
    $('#browseStudentsCard').block();
    $.ajax({
        url: '/general/getStudentsByClass',
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
                    { data: 'ResidentialAddress' },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to edit ' + data.StudentsName + "'s data")
                }
            }).clear().rows.add(data).draw();
            // table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

$('#studentDetailsForm').submit(function(e){
    if(document.getElementById('studentDetailsForm').checkValidity() !== false){
        e.preventDefault()
        $('#studentDetailsForm').block();
        $.ajax({
            url: '/students/updateStudentData',
            type: 'POST',
            data: $('#studentDetailsForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    $('#studentDetailsForm')[0].reset();
                    triggerAlert('Successfully updated data.', 'success');
                    getStudentsByClass()
                    $('.modal').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#studentDetailsForm').block({timeout: 0.1});
            }
        });
    }
})

$('#zero-conf tbody').on('click', 'tr', function () {
    var table = $('#zero-conf').DataTable();
    var data = table.row(this).data();
    $('#zero-conf').block();
    $.ajax({
        url: '/general/getStudentDataByGR',
        type: 'POST',
        data: {'studentGRNumber': data.GRNumber, 'academicSessions': $('#academicSessions').val()},
        success: function(data) {
            $('#grNumber').val(data[0].GRNumber)
            $('#formNumber').val(data[0].FormNumber)
            $('#studentName').val(data[0].StudentsName)
            $('#fatherName').val(data[0].FatherName)
            $('#cityOfBirth').val(data[0].CityOfBirth)
            $('#contactNumber').val(data[0].ContactNumber)
            $('#alternateContact').val(data[0].AlternateContactNumber)
            $('#residentialAddress').val(data[0].ResidentialAddress)
            $('input[name="gender"][value="' + data[0].Gender + '"]').prop('checked', true);
            $('#dateOfBirth').val( moment(data[0].DateOfBirth).format('YYYY-MM-DD'))
            $('#classofAdmission').val(data[0].ClassOfAdmission)
            $('#academicSessions').val(data[0].AcademicSession)
            $('#nationality').val(data[0].Nationality)
            $('#religion').val(data[0].Religion)
            $('#motherTongue').val(data[0].MotherTongue)

            $('#zero-conf').block({timeout: 0.1});
            $('.updateStudentDataPopup').modal('show');
        }
    });
});

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('.academicSessions').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        getClassesList()
        $(".academicSessions").select2();
    }
});

$('.academicSessions').change(function(){
    getClassesList()
})

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            $(".classofAdmission").empty()
            $('#classofAdmission').append('<option value="">Select class to fetch data</option>'); 
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('.classofAdmission').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $(".classofAdmission").select2();
        }
    });
}

$('#profileDisable').click(function(){
    $('#disableStudentID').val($('#grNumber').val())
    $('#studentDisableDate').val(moment().format('YYYY-MM-DD'))
    $('.disableStudentPopup').modal('show');
})

$('#studentDisableForm').submit(function(e){
    if(document.getElementById('studentDisableForm').checkValidity() !== false){
        e.preventDefault()
        $('#studentDisableForm').block();
        $.ajax({
            url: '/students/disableStudentProfile',
            type: 'POST',
            data: $('#studentDisableForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully disabled profile.', 'success');
                    getStaffMembers();
                    $('.modal').modal('hide');
                } else{
                    triggerAlert(data, 'error');
                }
            }
        });
        $('#studentDisableForm').block({timeout: 0.1});
    }
})