$('#module-6').addClass('active-page')
$('#sub-module-for-6-1').addClass('active')

var allClasses = '';
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

$("#academicSession").change(function(){
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
            getExams();
        }
    });
}

function getClassesList(){
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data: {'AcademicSession': $("#academicSession").val()},
        success: function(data) {
            $('#classForExam').html('<option></option>')
            allClasses = data[0].ClassesList;
            JSON.parse(data[0].ClassesList).forEach(element => {
                $('#classForExam').append(
                    '<option value="' + element.ClassID + '">' + element.ClassName + '</option>'
                );
            });
            $("#classForExam").select2();
        }
    });
}

$('#reportrange').on('apply.daterangepicker', function(ev, picker) {
    getExams();
});

$('#createExam').click(function(){
    $('.createExamPopup').modal('show');
})

function getExams(){
    $('#examsDataTable').block();
    $.ajax({
        url: '/exam-report/getExams',
        type: 'POST',
        data: {'AcademicSession': $("#academicSession").val(), 'examStartDate': moment($('.dateRange').text().split('-')[0], "MMMM DD, YYYY").format('YYYY-MM-DD'), 'examEndDate': moment($('.dateRange').text().split('-')[1], "MMMM DD, YYYY").format('YYYY-MM-DD')},
        success: function(data) {
            var table = $('#examsDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { 
                        data: null,
                        render: function(data, type, row, meta) {
                            return meta.row + 1;
                        }
                    },
                    { 
                        data: "From",
                        render: function(data, type, row, meta) {
                            return moment(data).format('dddd DD MMM, YYYY');
                        }
                    },
                    { 
                        data: null,
                        render: function(data, type, row, meta) {
                            var from = moment(data.From);
                            var till = moment(data.Till);
                            var duration = moment.duration(till.diff(from));
                            
                            var days = Math.floor(duration.asDays());
                            duration.subtract(moment.duration(days, 'days'));
                            var hours = Math.floor(duration.asHours());
                            duration.subtract(moment.duration(hours, 'hours'));
                            var minutes = Math.floor(duration.asMinutes());
                            
                            var timeDiff = '';
                            if (days > 0) {
                                timeDiff += days + ' days ';
                            }
                            if (hours > 0) {
                                timeDiff += hours + ' hours ';
                            }
                            if (minutes > 0) {
                                timeDiff += minutes + ' minutes';
                            }

                            var durationString = `${moment(data.From).format('hh:mm A')} - ${moment(data.Till).format('dddd DD MMM, YYYY hh:mm A')}<br><small>Duration: ${timeDiff.trim()}</small>`;
                            if(moment(data.From).format('dddd DD MMM, YYYY') == moment(data.Till).format('dddd DD MMM, YYYY')){
                                durationString = `${moment(data.From).format('hh:mm A')} - ${moment(data.Till).format('hh:mm A')}<br><small>Duration: ${timeDiff.trim()}</small>`;
                            }
                            return durationString;
                        }
                    },
                    { 
                        data: null,
                        render: function(data, type, row, meta) {
                            return data.ExamTitle + '<br><small>Announced by: ' + data.Name + '<small>';
                        }
                    },
                    {
                        data: null,
                        render: function (data, type, row, meta) {
                            var className = JSON.parse(allClasses).find(function(classObj) {
                                return classObj.ClassID == data.ExamClass;
                            })?.ClassName ?? 'Not found';
                            return className;
                        }
                    },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to preview details.')
                        .click(function() {
                            previewDateSheet(data.ExamID);
                        });
                }
            }).clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
            $('#examsDataTable').block({timeout: 0.1})
        }
    });
}

$('#subjectsForExam').change(function(){
    $('.marksDetailsContainer').empty();
    $('#subjectsForExam').val().forEach(element => {
        $('.marksDetailsContainer').append(`
            <div class="col-md-3 mb-3">
                <label for="examStartDate${element}">${(allSubjects.find(function(obj) { return obj.ID == element; })?.SubjectName ?? 'Not found')} Exam starts at</label>
                <input type="datetime-local" class="form-control" id="examStartDate${element}" name="examStartDate${element}" onchange="validateDuration(${element})" required>
                <div class="invalid-feedback">
                    Please select a date & time.
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <label for="examEndDate${element}">${(allSubjects.find(function(obj) { return obj.ID == element; })?.SubjectName ?? 'Not found')} Exam ends at</label>
                <input type="datetime-local" class="form-control" id="examEndDate${element}" name="examEndDate${element}" onchange="validateDuration(${element});" required>
                <div class="invalid-feedback">
                    Please select a date & time.
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <label for="examPassingMarksFor-${element}">Passing marks for ${(allSubjects.find(function(obj) { return obj.ID == element; })?.SubjectName ?? 'Not found')}</label>
                <input type="number" class="form-control" id="examPassingMarks${element}" name="examPassingMarks${element}" required>
                <div class="invalid-feedback">
                    Please provide passing marks.
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <label for="examTotalMarksFor-${element}">Total marks for ${(allSubjects.find(function(obj) { return obj.ID == element; })?.SubjectName ?? 'Not found')}</label>
                <input type="number" class="form-control" id="examTotalMarks${element}" name="examTotalMarks${element}" required>
                <div class="invalid-feedback">
                    Please provide total marks.
                </div>
            </div>

            <div class="col-md-12 mb-3">
                <small id="durationPreview${element}"></small>
                <small class="text-danger" id="durationError${element}"></small>
            </div>
        `);
    });
})

$('#classForExam').change(function(){
    $('#subjectsForExam').html('<option></option>')
    $.ajax({
        url: '/general/getClassesBySubject',
        type: 'POST',
        data: {'classID': $('#classForExam').val(), 'AcademicSession': $("#academicSession").val()},
        success: function(data) {
            data.forEach(element => {
                $('#subjectsForExam').append(
                    '<option value="' + element.ID + '">' + element.SubjectName + '</option>'
                ); 
            });
            $("#subjectsForExam").select2();
        }
    });
});

$('#createExamForm').submit(function(e){
    if(document.getElementById('createExamForm').checkValidity() !== false){
        e.preventDefault();
        if(allowExamCreate){
            $('#createExamForm').block();
            $.ajax({
                url: '/exam-report/createExam',
                type: 'POST',
                data: {'data': $('#createExamForm').serialize(), 'AcademicSession': $("#academicSession").val(), 'classID': $("#classForExam").val()},
                success: function(data) {
                    if(data == 'Success'){
                        triggerAlert('Successfully created exam.', 'success');
                        getExams();
                    }
                    else{
                        triggerAlert(data, 'error');
                    }
                    $('.createExamPopup').modal('hide');
                    $('#createExamForm').block({timeout: 0.1});
                }
            });
        }
    }
})

var openedExamsDetails = '';
var scheduleToPrint = 0;
function previewDateSheet(examID){
    $('#schedulePreview').block();
    $('#schedulePreview tbody').empty()
    $('.examDetailsPreview').modal('show');

    $.ajax({
        url: '/exam-report/getExamDetailsByExamID',
        type: 'POST',
        data: {'ExamID': examID},
        success: function(data) {
            openedExamsDetails = data[0];
            $('#examTitlePreview').text(data[0].ExamTitle + ' for ' + JSON.parse(allClasses).find(function(classObj) { return classObj.ClassID == data[0].ExamClass; })?.ClassName ?? 'Not found')
            var tableData = [];
            JSON.parse(data[0].SubExams).forEach(function(subExam) {
                tableData.push({
                    "SubjectID": subExam.SubjectID,
                    "StartDate": subExam.StartDate,
                    "EndDate": subExam.EndDate,
                    "ExamID": data[0].ExamID
                });
            });

            var table = $('#schedulePreview');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }

            table.DataTable({
                columns: [
                    {
                        data: null,
                        render: function (data, type, full, meta) {
                            return meta.row + 1;
                        }
                    },
                    {
                        data: "StartDate",
                        render: function (data, type, full, meta) {
                            return moment(data).format('dddd DD MMM, YYYY')
                        }
                    },
                    { 
                        data: null,
                        render: function(data, type, row, meta) {
                            var from = moment(data.StartDate);
                            var till = moment(data.EndDate);
                            var duration = moment.duration(till.diff(from));
                            
                            var days = Math.floor(duration.asDays());
                            duration.subtract(moment.duration(days, 'days'));
                            var hours = Math.floor(duration.asHours());
                            duration.subtract(moment.duration(hours, 'hours'));
                            var minutes = Math.floor(duration.asMinutes());
                            
                            var timeDiff = '';
                            if (days > 0) {
                                timeDiff += days + ' days ';
                            }
                            if (hours > 0) {
                                timeDiff += hours + ' hours ';
                            }
                            if (minutes > 0) {
                                timeDiff += minutes + ' minutes';
                            }

                            var durationString = `${moment(data.StartDate).format('hh:mm A')} - ${moment(data.EndDate).format('dddd DD MMM, YYYY hh:mm A')}<br><small>Duration: ${timeDiff.trim()}</small>`;
                            if(moment(data.StartDate).format('dddd DD MMM, YYYY') == moment(data.EndDate).format('dddd DD MMM, YYYY')){
                                durationString = `${moment(data.StartDate).format('hh:mm A')} - ${moment(data.EndDate).format('hh:mm A')}<br><small>Duration: ${timeDiff.trim()}</small>`;
                            }
                            return durationString;
                            // return '<small>Form ' + moment(data.StartDate).format('dddd DD MMM, YYYY hh:mm A') +
                            // '<br>Till '+ moment(data.EndDate).format('dddd DD MMM, YYYY hh:mm A') + 
                            // '<br>Duration: ' + timeDiff.trim() + '</small>';
                        }
                    },
                    { 
                        data: "SubjectID",
                        render: function (data, type, full, meta) {
                            return allSubjects.find(function(obj) { return obj.ID == data; })?.SubjectName ?? 'Not found'
                        }
                    },
                ],
                data: tableData,
                scrollX: true,
            }).clear().rows.add(tableData).draw();
            $('#schedulePreview').block({timeout: 0.1});

            scheduleToPrint = examID;
        }
    });
}

$('#printSchedule').click(function(){
    $('#schedulePreview').block();
    $.ajax({
        url: '/general/getStudentsByClass',
        type: 'POST',
        data: {'academicSession': $("#academicSession").val(), 'presentClass': openedExamsDetails.ExamClass},
        success: function(data) {
            $('.printDataContainer').empty();
            var dateSheetHTMLVariable = '';
            var counter = 1;
            JSON.parse(openedExamsDetails.SubExams).forEach(element => {
                var from = moment(element.StartDate);
                var till = moment(element.EndDate);
                var duration = moment.duration(till.diff(from));
                
                var days = Math.floor(duration.asDays());
                duration.subtract(moment.duration(days, 'days'));
                var hours = Math.floor(duration.asHours());
                duration.subtract(moment.duration(hours, 'hours'));
                var minutes = Math.floor(duration.asMinutes());
                
                var timeDiff = '';
                if (days > 0) {
                    timeDiff += days + ' days ';
                }
                if (hours > 0) {
                    timeDiff += hours + ' hours ';
                }
                if (minutes > 0) {
                    timeDiff += minutes + ' minutes';
                }

                var durationString = `${moment(element.StartDate).format('dddd DD MMM., YYYY hh:mm A')} - ${moment(element.EndDate).format('dddd DD MMM., YYYY hh:mm A')}`
                if(moment(element.StartDate).format('YYYY-MM-DD') == moment(element.EndDate).format('YYYY-MM-DD')){
                    durationString = `${moment(element.StartDate).format('hh:mm A')} - ${moment(element.EndDate).format('hh:mm A')}`
                }
                dateSheetHTMLVariable += `
                    <tr>
                        <td class="align-middle">${counter}</td>
                        <td class="align-middle">${moment(element.StartDate).format('dddd, DD MMM, YYYY')}</td>
                        <td class="align-middle">
                            ${durationString}
                            <br>
                            <h6>Duration: ${timeDiff}</h6>
                        </td>
                        <td class="align-middle">${(allSubjects.find(function(obj) { return obj.ID == element.SubjectID; })?.SubjectName ?? 'Not found')}</td>
                        <td></td>
                    </tr>
                `
                counter ++;
            });
            $('#printDataContainer').empty()
            data.forEach(element => {
                $('#printDataContainer').append(`
                    <div class="voucher-body mb-5">
                        <div class="d-flex flex-row voucher-header">
                            <div class="justify-content-start">
                                <img src="../../assets/images/eiMS - Defualt Logo.png" width="170">
                            </div>
                            <div class="d-flex justify-content-center text-center" style="width: 100%;">
                                <div class="flex-wrap">
                                    <div class="flex-grow-1 text-uppercase">
                                        <h3>Institute Name will be shown here</h3>
                                    </div>
                                    <small>Address of the Institution will be shown here</small>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex flex-row">
                            <div style="flex-grow: 1;">
                                <h5 id="examTitle-print" class="text-center text-uppercase">${openedExamsDetails.ExamTitle}</h5>
                                <div class="d-flex flex-row">
                                    <div class="p-2">
                                        <img src="../../assets/images/profilePictures/${element.Image}" class="rounded" width="140">
                                    </div>
                                    <div class="p-2">
                                        <div class="d-flex">
                                            <div class="p-2">
                                                <table class="table table-borderless table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td>Name</td>
                                                            <th>${element.StudentsName}</th>
                                                        </tr>
                                                        <tr>
                                                            <td>Father's name</td>
                                                            <th>${element.FatherName}</th>
                                                        </tr>
                                                        <tr>
                                                            <td>General registration #</td>
                                                            <th>${element.GRNumber}</th>
                                                        </tr>
                                                        <tr>
                                                            <td>Class</td>
                                                            <th>${JSON.parse(allClasses).find(function(classObj) { return classObj.ClassID == element.PresentClass; })?.ClassName}</th>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br>
                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>S#</th>
                                    <th>Dated</th>
                                    <th>Duration</th>
                                    <th>Subject</th>
                                    <th>Sign. of Invigilator</th>
                                </tr>
                            </thead>
                            <tbody>${dateSheetHTMLVariable}</tbody>
                        </table>
                        <br>
                        <div class="row">
                            <small style="margin: 0 auto;">This is computer generated Exam schedule and nothing is overwritten on it.</small>
                        </div>
                    </div>
                    <!--<br>
                    <br>
                    <br>
                    <hr>
                    <br>
                    <br>
                    <br>-->
                `);
            });
            $('.examDetailsPreview').modal('hide');
            if (window.innerWidth >= 1024) {
                $('.printSchedulePopup').modal('show');
            }
            else{
                $('#print').click()
            }
            $('#schedulePreview').block({timeout: 0.1});
        }
    });
});

$("#print").click(function(){
    var printOptions = {
        mode: 'iframe',
        standard: 'html5',
        paperWidth: '210mm',
        paperHeight: '297mm',
        styles: [
            {
                href: "../../assets/css/voucher-print.css",
                media: "print"
            }
        ]
    };

    $("#printDataContainer").printArea(printOptions);
});

var allowExamCreate = true;
function validateDuration(id) {
    allowExamCreate = true;
    const durationPreview = $('#durationPreview' + id);
    const errorPreview = $('#durationError' + id);
    const startDate = new Date($('#examStartDate' + id).val());
    const endDate = new Date($('#examEndDate' + id).val());

    if (isNaN(startDate) || isNaN(endDate)) {
        errorPreview.text('Invalid start or end date.');
        durationPreview.text('');
        allowExamCreate = false;
        return;
    }
    
    if (endDate < startDate) {
        errorPreview.text('End date cannot be before the start date.');
        durationPreview.text('');
        allowExamCreate = false;
        return;
    }

    const durationInMinutes = Math.round((endDate - startDate) / (1000 * 60));
    if (durationInMinutes < 1) {
        errorPreview.text('Exam duration must be at least 1 minute.');
        durationPreview.text('');
        allowExamCreate = false;
        return;
    }

    const duration = moment.duration(endDate - startDate);
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();

    let durationText = 'Exam duration is ';
    if (days > 0) {
        durationText += days + ' day' + (days > 1 ? 's' : '') + ', ';
    }
    if (hours > 0) {
        durationText += hours + ' hour' + (hours > 1 ? 's' : '') + ', ';
    }
    durationText += minutes + ' minute' + (minutes > 1 ? 's' : '');
    errorPreview.text('');
    durationPreview.text(durationText);
}

$('select').select2();