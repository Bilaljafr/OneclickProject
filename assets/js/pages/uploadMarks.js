$('#module-6').addClass('active-page')
$('#sub-module-for-6-5').addClass('active')

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
        getClassesList();
        getAllSubjects();
    }
});

$('#academicSession').change(function(){
    getClassesList();
    getAllSubjects();
})

var allSubjects = '';
function getAllSubjects(){
    $.ajax({
        url: '/general/getSubjectsList',
        type: 'POST',
        data: {'AcademicSession': $("#academicSession").val()},
        success: function(data) {
            allSubjects = data;
        }
    });
}

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data:{'AcademicSession': $('#academicSession').val()},
        success: function(data) {
            $('#classofAdmission').html('<option value="">Select class to fetch data</option>'); 
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classofAdmission').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $("#classofAdmission").select2();
        }
    });
}

var examDetails = '';
$('#classofAdmission').change(function() {
    $.ajax({
        url: '/exam-report/getSessionExams',
        type: 'POST',
        data: {'classID': $('#classofAdmission').val(), 'AcademicSession': $("#academicSession").val()},
        success: function(data) {
            examDetails = data;
            $('#exams').html('<option value=""></option>'); 
            data.forEach(element => {
                var optionData = '<optgroup label="' + element.ExamTitle + '">';
                JSON.parse(element.SubExams).forEach(element1 => {
                    optionData += '<option value=\'[{"examID": ' + element.ExamID + ', "subjectID": ' + element1.SubjectID + '}]\'>' + (allSubjects.find(function(obj) { return obj.ID == element1.SubjectID; })?.SubjectName ?? 'Not found') + '</option>'
                });
                optionData += "</optgroup>"
                $('#exams').append(optionData);
            });
            $("#exams").select2();
        }
    });
});

var totalMarks = '';
$('#exams').change(function(){
    totalMarks = examDetails.find(item => item.ExamID == JSON.parse($('#exams').val())[0].examID).TotalMarks ?? null;
    getStudentsByClass()
})

$('#studentsDataTable').DataTable({scrollX: true})
function getStudentsByClass(){
    $('#browseStudentsCard').block();
    $.ajax({
        url: '/general/getStudentsByClass',
        type: 'POST',
        data: {'presentClass': $('#classofAdmission').val(), 'academicSession': $('#academicSession').val()},
        success: function(data) {
            var table = $('#studentsDataTable');
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
                        data: null,
                        render: function(data, type, full, meta) {
                            if (type === 'display') {
                                return '<input type="number" class="form-control obtainedMarksField" id="for-GR-' + data.GRNumber + '" value="" min="0" max="' + totalMarks + '">';
                            }
                            else {
                                return data;
                            }
                        }
                    },
                ]
            }).clear().rows.add(data).draw();

            getUploadedMarks()
        }
    });
}

function getUploadedMarks(){
    // var examID = 'sub-exam-for-subject-' + element1.SubjectID + '-exam-' + element.ExamID
    $.ajax({
        url: '/exam-report/getUploadedMarks',
        type: 'POST',
        data: {'presentClass': $('#classofAdmission').val(), 'examID': JSON.parse($('#exams').val())[0].examID, 'subjectID': JSON.parse($('#exams').val())[0].subjectID},
        success: function(data) {
            data.forEach(element => {
                $('#for-GR-' + element.StudentGR).val(element.ObtainedMarks !== 'Absent' ? element.ObtainedMarks : '');
                // $('#for-GR-' + element.StudentGR).val(element.ObtainedMarks)
            });

            if(data.length > 0){
                $('#uploadMarks').val('Update marks')
            }
            else{
                $('#uploadMarks').val('Upload marks')
            }
            $('#browseStudentsCard').block({timeout: 0.1});
        }
    })
}

$('#uploadMarks').on('click', function() {
    $('#browseStudentsCard').block();
    var data = [];
    $('#studentsDataTable tbody tr').each(function() {
        var row = $(this);
        var inputVal = row.find('.obtainedMarksField').val();
        var fieldID = row.find('.obtainedMarksField').attr('id');
        var rowData = {};
        rowData[fieldID] = inputVal;
        data.push(rowData);
    });
    
    $.ajax({
        url: '/exam-report/uploadMarks',
        type: 'POST',
        data: {'examID': JSON.parse($('#exams').val())[0].examID, 'subjectID': JSON.parse($('#exams').val())[0].subjectID, 'data': data},
        success: function(data) {
            if(data == 'Success'){
                triggerAlert('Successfully updated to database.', 'success');
            }
            else{
                triggerAlert(data, 'error');
            }
            $('#browseStudentsCard').block({timeout: 0.1});
        }
    });
});