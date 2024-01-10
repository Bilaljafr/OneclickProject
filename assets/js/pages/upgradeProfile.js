$('#module-2').addClass('active-page')
$('#sub-module-for-2-4').addClass('active')

$('#classofAdmission').change(function() {
    getStudentsByClass()
});

$('#academicSessions').change(function() {
    getClassesList($('#academicSessions').val(), "#classofAdmission")
    var table = $('#studentsList').DataTable();
    table.clear().draw();
    // if (table.hasClass('dataTable') ) {
    //     table.DataTable().destroy();
    // }
});

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('#academicSessions').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
            $('#upgradeToSession').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        getClassesList($('#academicSessions').val(), "#classofAdmission")
        $("#academicSessions").select2();
        $("#upgradeToSession").select2();
    }
});

$("#upgradeToSession").change(function(){
    getClassesList($('#upgradeToSession').val(), "#upgradeToClass")
})

$('#studentsList').DataTable({scrollX: true})
function getStudentsByClass(){
    $('#browseStudentsCard').block();
    $('#select-all-checkbox').prop('checked', false)
    $.ajax({
        url: '/general/getStudentsByClass',
        type: 'POST',
        data: {'presentClass': $('#classofAdmission').val(), 'academicSession': $('#academicSessions').val()},
        success: function(data) {
            $('#browseStudentsCard').block({timeout: 0.1});
            var table = $('#studentsList');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    {
                        data: null,
                        render: function (data, type, row, meta) {
                          return '<input type="checkbox" class="form-control row-checkbox customized-checkbox" value="' + row.GRNumber + '" id="' + row.GRNumber + '">';
                        },
                        targets: 'no-sort',
                        orderable: false
                    },
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
                "aaSorting": [[1,'asc']]
            }).clear().rows.add(data).draw();
        }
    });
}

$('#select-all-checkbox').on('change', function () {
    var isChecked = $(this).prop('checked');
    $('.row-checkbox').prop('checked', isChecked);
});

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

$('#studentsList tbody').on('click', 'tr', function (event) {
    var table = $('#studentsList').DataTable();
    var data = table.row(this).data();

    var clickedCell = table.cell(event.target);
    if (clickedCell && clickedCell.index()) {
        var clickedColumnIndex = clickedCell.index().column;
        if(clickedColumnIndex > 0 ){
            if ($('#' + data.GRNumber).prop('checked')) {
                $('#' + data.GRNumber).prop('checked', false);
            }
            else{
                $('#' + data.GRNumber).prop('checked', true);
            }
        }
    }
});

function getDetails(grNumber){
    $('#studentsList').block();
    $.ajax({
        url: '/general/getStudentDataByGR',
        type: 'POST',
        data: {'studentGRNumber': grNumber, 'academicSessions': $('#academicSessions').val()},
        success: function(data) {
            if(data.length > 0){
                $('#grNumber').val(data[0].GRNumber)
                $('#formNumber').val(data[0].FormNumber)
                $('#studentName').val(data[0].StudentsName)
                $('#fatherName').val(data[0].Name)
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
                $('.enableStudentDataPopup').modal('show');
            }
            else{
                triggerAlert('No record found. Please check session and GR number.', 'error');
            }
            $('#studentsList').block({timeout: 0.1});
        }
    });
}

function getClassesList(fetchFrom, destination){
    $(destination).attr('disabled', true)
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': fetchFrom},
        success: function(data) {
            $(destination).empty()
            $(destination).append('<option value="">Select a class to proceed</option>');
            JSON.parse(data[0].ClassesList).forEach(element => {
                $(destination).append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $(destination).select2();
            $(destination).attr('disabled', false)
        }
    });
}

var checkedValues = [];
$('#upgradeProfileBtn').click(function(){
    checkedValues = [];
    $('#studentsList input[type="checkbox"]:checked').each(function() {
        checkedValues.push($(this).val());
    });
    getClassesList($('#academicSessions').val(), "#upgradeToClass")
    $('.upgradeProfilePopup').modal('show');
})

$('#upgradeProfileForm').submit(function(e){
    if(document.getElementById('upgradeProfileForm').checkValidity() !== false){
        e.preventDefault()
        if(checkedValues.length > 0){
            if($('#upgradeToClass').val() == $('#classofAdmission').val()){
                triggerAlert('Your selected parameters are wrong. You cannot upgrade profile to same class.', 'error');
            }
            else{
                $('#upgradeProfileForm').block()
                $.ajax({
                    url: '/students/upgradeProfiles',
                    type: 'POST',
                    data:{'IDs': checkedValues, 'upgradeToClass': $('#upgradeToClass').val(), 'upgradeToSession': $('#upgradeToSession').val()},
                    success: function(data) {
                        if(data == 'Success'){
                            triggerAlert('Successfully upgrades profile.', 'success');
                            getStudentsByClass()
                            $('.upgradeProfilePopup').modal('hide');
                        }
                        else{
                            triggerAlert(data, 'error');
                        }
                        $('#upgradeProfileForm').block({timeout: 0.1})
                    }
                });
            }
        }
        else{
            triggerAlert('Please select atleast one profile to upgrade.', 'error');
        }
    }
})