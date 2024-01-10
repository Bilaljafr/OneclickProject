$('#module-4').addClass('active-page')
$('#sub-module-for-4-1').addClass('active')

$('#dated').val(moment().format('YYYY-MM-DD'))

$('#classofAdmission').change(function() {
    getStudentsByClass()
});

$('#academicSessions').change(function() {
    getStudentsByClass()
});

$('#dated').change(function() {
    getStudentsByClass()
});

$('#studentsData').DataTable({scrollX: true})
function getStudentsByClass(){
    $('#browseStudentsCard').block();
    $.ajax({
        url: '/general/getStudentsByClass',
        type: 'POST',
        data: {'presentClass': $('#classofAdmission').val(), 'academicSession': $('#academicSessions').val()},
        success: function(data) {
            $('#browseStudentsCard').block({timeout: 0.1});
            var table = $('#studentsData');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { 
                        data: 'GRNumber', 
                        orderable: false, 
                        className: 'select-checkbox',
                        render: function(data, type, full, meta) {
                            if (type === 'display') {
                                return '<input type="checkbox" name="studentGR" value="' + full.GRNumber + '" class="customized-checkbox">';
                            }
                            else {
                                return data;
                            }
                        }
                    },
                    { data: 'GRNumber' },
                    { data: 'StudentsName' },
                    { data: 'FatherName' },
                    // { 
                    //     data: 'ContactNumber',
                    //     render: function(data, type, full, meta) {
                    //         if (type === 'display') {
                    //             return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10);
                    //         }
                    //         else {
                    //             return data;
                    //         }
                    //     }
                    // },
                    // { data: 'ResidentialAddress' },
                ],
                select: {
                    style: 'multi'
                },
                "aaSorting": [[1,'asc']],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to mark ' + data.StudentsName + "'s attendance")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();

            getAttendance()
        }
    });
}

$('#select-all-checkbox').on('change', function () {
    var isChecked = $(this).prop('checked');
    $('.customized-checkbox').prop('checked', isChecked);
    $('#attendanceSummary').text($('input[type="checkbox"][name="studentGR"]:checked').length + ' out of ' + $('input[type="checkbox"][name="studentGR"]').length + ' is present')
});

function getAttendance(){
    $.ajax({
        url: '/administrator/getStudentAttendance',
        type: 'POST',
        data: {'dated': moment($('#dated').val()).format('YYYY-MM-DD'), 'classID': $('#classofAdmission').val()},
        success: function(data) {
            if(data.length > 0){
                data[0].StudentGR.split(',').forEach(element => {
                    $('input[type="checkbox"][value="' + element + '"]').prop('checked', true);
                });
                $('#attendanceSummary').text(data[0].StudentGR.split(',').length + ' out of ' + $('input[type="checkbox"][name="studentGR"]').length + ' is present.')
            }
        }
    });
}

$('#uploadAttendance').click(function(){
    const checkedValues = [];
    $('input[type=checkbox]:checked').each(function() {
        checkedValues.push($(this).val());
    });
    if(checkedValues.length > 0){
        $('#studentsData').block();
        $.ajax({
            url: '/attendance/uploadStudentAttendance',
            type: 'POST',
            data: {'presentStudents': checkedValues, 'dated': moment($('#dated').val()).format('YYYY-MM-DD'), 'session': $('#academicSessions').val(), 'classID': $('#classofAdmission').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully uploaded attendance.', 'success');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#studentsData').block({timeout: 0.1});
            }
        });
    }
    else{
        triggerAlert('System cannot upload blank attendance.', 'error');
    }
})

$('#studentsData tbody').on('click', 'tr', function (event) {
    var table = $('#studentsData').DataTable();
    var data = table.row(this).data();
    // $('#studentsData').block();
    var clickedCell = table.cell(event.target);
    if (clickedCell && clickedCell.index()) {
        var clickedColumnIndex = clickedCell.index().column;
        if(clickedColumnIndex > 0 ){
            var checkbox = $('input[type="checkbox"][name="studentGR"][value="' + data.GRNumber + '"]');
            checkbox.prop('checked', !checkbox.prop('checked'));
        }
    }
    $('#attendanceSummary').text($('input[type="checkbox"][name="studentGR"]:checked').length + ' out of ' + $('input[type="checkbox"][name="studentGR"]').length + ' is present')
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

$('#attendanceReport').click(function(){
    $('.attendanceReportPopup').modal('show')
})

$('#attendanceReportForm').submit(function(e){
    if(document.getElementById('attendanceReportForm').checkValidity() !== false){
        e.preventDefault();
        $('#attendanceReportForm').block()
        $.ajax({
            url: '/attendance/getStudentAttendanceReport',
            type: 'POST',
            data: {'generateFor': $('#generateFor').val(), 'classes': $('#classes').val(), 'students': $('#students').val(), 'dateFrom': moment($('#reportrange span').text().split(' - ')[0], "MMMM dd, yyyy").format('YYYY-MM-DD'), 'dateTill': moment($('#reportrange span').text().split(' - ')[1], "MMMM dd, yyyy").format('YYYY-MM-DD')},
            success: function(data) {
                $('.showAttendanceReportPopup').modal('show')
                $('.attendanceReportPopup').modal('show')
                $('#attendanceReportForm').block({timeout: 0.1})
            }
        });
    }
})

$('#generateFor').change(function(){
    $('#students').val('')
    $('#classes').val('').select2().trigger('change')

    if($('#generateFor').val() == 'classes'){
        $('.students').hide()
        $('.classes').show()
    }
    else{
        $('.classes').hide()
        $('.students').show()
    }
})

$('.academicSessions').change(function(){
    getClassesList()
})

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            $("#classofAdmission").empty()
            $("#classes").empty()
            $('#classofAdmission').append('<option value="">Select class to fetch data</option>'); 
            $('#classes').append('<option value="">Select a class</option>'); 
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classofAdmission').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
                $('#classes').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $("#classofAdmission").select2();
            $('#classes').select2();
        }
    });
}

$('#generateFor').select2();