$('#module-6').addClass('active-page')
$('#sub-module-for-6-3').addClass('active')

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('#academicSessions').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        $("#academicSessions").select2();
        getClasses();
        getSubjects()
    }
});

var classesList = '';
function getClasses(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data: {'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            classesList = JSON.parse(data[0].ClassesList);
        }
    });
}

var allSubjects = '';
function getSubjects(){
    $.ajax({
        url: '/general/getSubjectsList',
        type: 'POST',
        data: {'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            allSubjects = data;
        }
    });
}

var studentDetails = '';
$('#searchProgressHistoryByGRForm').submit(function(e){
    if(document.getElementById('searchProgressHistoryByGRForm').checkValidity() !== false){
        e.preventDefault()
        $('#searchProgressHistoryByGRForm').block();
        $('#progressRecord').block();

        $.ajax({
            url: '/general/getStudentDataByGR',
            type: 'POST',
            data: {'studentGRNumber': $('#studentGRNumber').val(), 'academicSessions': $('#academicSessions').val()},
            success: function(data) {
                if(data.length > 0){
                    studentDetails = data[0];
                    $('.studentsBioData tbody').empty()
                    $('.studentsBioData tbody').append(`
                        <tr>
                            <td rowspan="5" style="max-width: 54px;">
                                <img src="../../assets/images/profilePictures/` + data[0].Image + `" class="img img-fluid" width="120" draggable="false">
                            </td>
                        </tr>
                        <tr>
                            <td style="max-width: 60px;">GR number</td>
                            <th>` + data[0].GRNumber + `</th>
                        </tr>
                        <tr>
                            <td style="max-width: 60px;">Student's name</td>
                            <th>` + data[0].StudentsName + `</th>
                        </tr>
                        <tr>
                            <td style="max-width: 60px;">Father's name</td>
                            <th>` + data[0].FatherName + `</th>
                        </tr>
                        <tr>
                            <td style="max-width: 60px;">Present class</td>
                            <th>` + classesList.find(item => item.ClassID == data[0].PresentClass).ClassName + `</th>
                        </tr>
                    `)

                    getProgressHistory();
                }
                else{
                    triggerAlert('No record found', 'error');
                }
            }
        })
    }
})

$('#progressRecord').DataTable({scrollX: true})
function getProgressHistory(){
    $.ajax({
        url: '/exam-report/getSessionExams',
        type: 'POST',
        data: {'classID': studentDetails.PresentClass, 'AcademicSession': $('#academicSessions').val()},
        success: function(data) {
            if(data.length > 0){
                var table = $('#progressRecord');
                if (table.hasClass('dataTable') ) {
                    table.DataTable().destroy();
                }
                table.DataTable({
                    data: data,
                    columns: [
                        {
                            data: null,
                            render: function (data, type, row, meta) {
                                return meta.row + 1;
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row, meta) {
                                if(moment(data.From).format('dddd DD MMM, YYYY') == moment(data.Till).format('dddd DD MMM, YYYY')){
                                    return data.ExamTitle + `<br><small>On ${moment(data.From).format('dddd DD MMM, YYYY')}</small>`;
                                }
                                else{
                                    return data.ExamTitle + `<br><small>From ${moment(data.From).format('dddd DD MMM, YYYY')}<br>Till ${moment(data.Till).format('dddd DD MMM, YYYY')}</small>`;
                                }
                            }
                        },
                        {
                            data: "SubExams",
                            render: function (data) {
                                var subExams = JSON.parse(data);
                                var subjectRows = subExams.map(function (subExam) {
                                    return allSubjects.find(function(obj) { return obj.ID == subExam.SubjectID; }).SubjectName ?? 'Subject Not Found';
                                });
                                return subjectRows.join("<br>");
                            }
                        },
                        {
                            data: "SubExams",
                            render: function (data) {
                              var subExams = JSON.parse(data);
                              var startDateRows = subExams.map(function (subExam) {
                                    if(moment(subExam.StartDate).format('dddd DD MMM, YYYY') == moment(subExam.EndDate).format('dddd DD MMM, YYYY')){
                                        return moment(subExam.StartDate).format('hh:mm A') + ' - ' + moment(subExam.EndDate).format('hh:mm A');
                                    }
                                    else{
                                        return `From ${moment(subExam.StartDate).format('dddd DD MMM, YYYY hh:mm A')} till ${moment(subExam.EndDate).format('dddd DD MMM, YYYY hh:mm A')}`;
                                    }
                              });
                              return startDateRows.join("<br>");
                            }
                        },
                        {
                            data: "SubExams",
                            render: function (data, type, row, meta) {
                                var subExams = JSON.parse(data);
                                var marksRows = subExams.map(function (subExam) {
                                    return '<span id="obtainedMarksFor' + meta.row + '-' + subExam.SubjectID + '">0</span> out of ' + subExam.TotalMarks;
                                });
                                return marksRows.join("<br>");
                            }
                        },
                        {
                            data: "SubExams",
                            render: function (data) {
                                var subExams = JSON.parse(data);
                                var passingMarksRows = subExams.map(function (subExam) {
                                    return subExam.PassingMarks;
                                });
                                return passingMarksRows.join("<br>");
                            }
                        }
                    ],
                    scrollX: true
                });
                // table.DataTable({
                //     scrollX: true,
                //     columns: [
                //         { data: 'GRNumber' },
                //         { data: 'StudentsName' },
                //         { data: 'FatherName' },
                //         { 
                //             data: null,
                //             render: function(data, type, full, meta) {
                //                 if (type === 'display') {
                //                     return '<input type="number" class="form-control obtainedMarksField" id="for-GR-' + data.GRNumber + '" value="" min="0" max="' + totalMarks + '">';
                //                 }
                //                 else {
                //                     return data;
                //                 }
                //             }
                //         },
                //     ]
                // }).clear().rows.add(data).draw();
            }
            else{
                triggerAlert('No exam is scheduled till now.', 'error');
            }
            $('#searchProgressHistoryByGRForm').block({timeout: 0.1});
            $('#progressRecord').block({timeout: 0.1});
        }
    })
}
