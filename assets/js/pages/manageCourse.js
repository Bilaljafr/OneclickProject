$('#module-5').addClass('active-page')
$('#sub-module-for-5-2').addClass('active')

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
        getClassesnSubjects()
    }
});

$('#academicSession').change(function(){
    getClassesnSubjects()
})

$('#addNewSubject').click(function(){
    $('#newSubjectForm .modal-body').empty()
    addNewRow()
    $('.addNewSubjectPopup').modal('show')
})

var subjectsDetails = '';
var classDetails = '';
var subjectsOptions = '';
var classesOptions = ''
function getClassesnSubjects(){
    classSelect = '';
    $('#subjectsDataTableContainer').block();
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data: {'AcademicSession': $('#academicSession').val()},
        success: function(classesList) {
            classDetails = classesList;
            $('#classes').empty()
            $('#classesToTeach').empty()
            $('#classes').append(`<option value=""></option>`)
            classesOptions = '<option></option>';
            $('#classesToTeach').append(`<option value=""></option>`)
            JSON.parse(classesList[0].ClassesList).forEach(element => {
                $('#classes').append(`<option value="${element.ClassID}">${element.ClassName}</option>`)
                $('#classesToTeach').append(`<option value="${element.ClassID}">${element.ClassName}</option>`)
                classesOptions += `<option value="${element.ClassID}">${element.ClassName}</option>`;
            });
            $('#classes').select2();
            $('#classesToTeach').select2();

            $.ajax({
                url: 'getSubjects',
                type: 'POST',
                data: {'academicSession': $('#academicSession').val()},
                success: function(subjects) {
                    $('#subjectToAssign').empty()
                    $('#subjectToAssign').append('<option></option>')
                    // $('#subjects').empty()
                    // $('#subjects').append('<option></option>')
                    subjectsOptions = '<option></option>';
                    subjectsDetails = subjects;
                    var table = $('#subjectsDataTable');
                    var counter = 1;
                    if (table.hasClass('dataTable') ) {
                        table.DataTable().destroy();
                        $('#subjectsDataTable tbody').empty();
                    }
                    subjects.forEach(element => {
                        var assignedClasses = '';
                        var a = 0;
                        element.Classes.split(',').forEach(element1 => {
                            var className = JSON.parse(classesList[0].ClassesList).find(function(obj) { return obj.ClassID == element1; })?.ClassName || ''
                            assignedClasses += `<span class="badge badge-secondary mr-1 mb-1">${className}</span>`

                            if(a == 2){
                                assignedClasses += '<br>'
                                a = 0;
                            }
                            a++;
                        });
                        $('#subjectsDataTable tbody').append(`
                            <tr>
                                <td>${counter}</td>
                                <td>${element.SubjectName}</td>
                                <td>${assignedClasses}</td>
                            </tr>
                        `)
                        $('#subjectToAssign').append(`<option value="${element.ID}">${element.SubjectName}</option>`)
                        // $('#subjects').append(`<option value="${element.ID}">${element.SubjectName}</option>`)
                        subjectsOptions += `<option value="${element.ID}">${element.SubjectName}</option>`;
                        counter++;
                    });
                    table.DataTable({
                        scrollX: true,
                    });

                    $('#subjectToAssign').select2();
                    $('#subjects').select2();
                    $('#subjectsDataTableContainer').block({timeout: 0.1});
                    getAssignedTeachers()
                }
            });
        }
    });
}

function getAssignedTeachers(){
    $('#assignedSubjectsDataTableContainer').block();
    $.ajax({
        url: 'getAssignedTeachers',
        type: 'POST',
        data: {'academicSession': $('#academicSession').val()},
        success: function(data) {
            $('#assignedSubjectsDataTable tbody').empty()
            var table = $('#assignedSubjectsDataTable');
            var counter = 1;
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
                $('#assignedSubjectsDataTable tbody').empty();
            }
            data.forEach(element => {
                var subjects = '';
                JSON.parse(element.AssignedSubject).forEach(element1 => {
                    subjects += `<div class="d-block"><span class="badge badge-info mr-1 mb-1">${subjectsDetails.find(function(obj) { return obj.ID == element1.SubjectID; })?.SubjectName || ''}</span></div>`
                    element1.Classes.split(',').forEach(element2 => {
                        var className = JSON.parse(classDetails[0].ClassesList).find(function(obj) { return obj.ClassID == element2; })?.ClassName || ''
                        subjects += `<span class="badge badge-secondary mr-1 mb-3">${className}</span>`
                    });
                });
                $('#assignedSubjectsDataTable tbody').append(`
                    <tr>
                        <td>${counter}</td>
                        <td>${element.Name}</td>
                        <td>${subjects}</td>
                    </tr>
                `)
                counter++
            });
            table.DataTable({
                scrollX: true
            });
            $('#assignedSubjectsDataTableContainer').block({timeout: 0.1});
        }
    });
}

$('#subjectToAssign').change(function(){
    var classes = subjectsDetails.find(obj => obj.ID == $('#subjectToAssign').val())?.Classes || ''; // Retrieve the "Classes" for the given ID
    $('#classes').val(classes.split(',').map(Number));
    $('#classes').trigger('change');
})

function addNewRow(){
    var row = $('<div class="form-row">' +
                    '<div class="col-10 mb-3">' +
                        '<label for="subjectTitle">Subject title</label>' +
                        '<input type="text" class="form-control" name="subjectTitle" required>' +
                        '<div class="invalid-feedback">' +
                            'Please provide a valid title.' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-2 mb-3">' +
                        '<br>' +
                        '<input type="button" class="btn btn-secondary pt-3 pb-3 mt-2 d-block addNewSlot" style="width: 100%;" onclick="addNewSlot(this)" value="+">' +
                    '</div>' +
                '</div>');
    $('#newSubjectForm .modal-body').append(row);
    $('.assignedClasses').select2();
}

function addNewSlot(button){
    if ($(button).val() === '+') {
        addNewRow()
        $(button).val('x')
    }
    else{
        $(button).closest('.form-row').remove();
    }
};

$('#newSubjectForm').submit(function(e){
    if(document.getElementById('newSubjectForm').checkValidity() !== false){
        e.preventDefault()
        $('#newSubjectForm').block()
        $.ajax({
            url: 'addNewSubject',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'subjectTitle': $('#newSubjectForm').serialize()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully added subjects(s).', 'success');
                    getClassesnSubjects()
                    $('.addNewSubjectPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#newSubjectForm').block({timeout: 0.1})
            }
        })
    }
})

$('#assignToClass').click(function(){
    $('.assignToClassPopup').modal('show');
})

$('#assignToClassForm').submit(function(e){
    if(document.getElementById('assignToClassForm').checkValidity() !== false){
        e.preventDefault()
        $('#assignToClassForm').block()
        $.ajax({
            url: 'assignToClass',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'details': $('#assignToClassForm').serialize()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully assigned subject to class(es).', 'success');
                    getClassesnSubjects()
                    $('.assignToClassPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#assignToClassForm').block({timeout: 0.1})
            }
        })
    }
})

$('#manageCourse').click(function(){
    $('#manageCourse').val('Please wait')
    $('.subjectsOptions').html('<div class="form-row"></div>')
    $.ajax({
        url: 'getTeachersList',
        type: 'GET',
        success: function(data) {
            $('#teacher').empty()
            $('#teacher').append(`<option></option>`)
            data.forEach(element => {
                $('#teacher').append(`<option value="${element.StaffID}">${element.Name}</option>`)
            });
            $('#teacher').select2();
            $('#manageCourse').val('Manage')
            $('.manageCoursePopup').modal('show');
        }
    })
})

$('#teacher').change(function(){
    newSubjects = 0;
    newSubjectsArray = [];
    $('.subjectsOptions').empty();
    $('.subjectsOptions').append('<div class="form-row"></div>');
    $('#manageCourseForm').block();
    $.ajax({
        url: 'getTeachersSubjects',
        type: 'POST',
        data: {'TeacherID': $('#teacher').val()},
        success: function(data) {
            if(data.length == 0){
                newSubjects++;
                var row = $(
                    '<div class="form-row">' +
                        '<div class="col-md-5 mb-3">' +
                            '<label for="newSubject-' + newSubjects + '">Subject</label>' +
                            '<select class="form-control" id="newSubject-' + newSubjects + '" name="newSubject-' + newSubjects + '" style="width: 100%; display: none;" required>' + subjectsOptions + '</select>' +
                            '<div class="invalid-feedback">' +
                                'Please select a Subject.' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-md-6 mb-3">' +
                            '<label for="newSubjectClasses-' + newSubjects + '">Class(es)</label>' +
                            '<select class="form-control" id="newSubjectClasses-' + newSubjects + '" name="newSubjectClasses-' + newSubjects + '" multiple="multiple" style="width: 100%; display: none;" required>' + classesOptions + '</select>' +
                            '<div class="invalid-feedback">' +
                                'Please select at least one class.' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-md-1 mb-3">' +
                            '<input type="button" class="btn btn-secondary addNewSlot removeSubject-' + newSubjects + '" name="addNewSlot" style="margin-top: 33px;" value="+">' +
                        '</div>' +
                    '</div>');

                // Append the row to the form
                $('.form-row:last').after(row);
                $('#newSubject-' + newSubjects).select2();
                $('#newSubjectClasses-' + newSubjects).select2();
                newSubjectsArray.push(newSubjects);
            }
            else{
                var counter = 1;
                JSON.parse(data[0].AssignedSubject).forEach(element => {
                    newSubjects++;
                    var btnValue = 'x';
                    if(JSON.parse(data[0].AssignedSubject).length == counter){
                        btnValue = '+'
                    }
                    var row = $(
                        '<div class="form-row">' +
                            '<div class="col-md-5 mb-3">' +
                                '<label for="newSubject-' + newSubjects + '">Subject</label>' +
                                '<select class="form-control" id="newSubject-' + newSubjects + '" name="newSubject-' + newSubjects + '" style="width: 100%; display: none;" required>' + subjectsOptions + '</select>' +
                                '<div class="invalid-feedback">' +
                                    'Please select a Subject.' +
                                '</div>' +
                            '</div>' +
                            '<div class="col-md-6 mb-3">' +
                                '<label for="newSubjectClasses-' + newSubjects + '">Class(es)</label>' +
                                '<select class="form-control" id="newSubjectClasses-' + newSubjects + '" name="newSubjectClasses-' + newSubjects + '" multiple="multiple" style="width: 100%; display: none;" required>' + classesOptions + '</select>' +
                                '<div class="invalid-feedback">' +
                                    'Please select at least one class.' +
                                '</div>' +
                            '</div>' +
                            '<div class="col-md-1 mb-3">' +
                                '<input type="button" class="btn btn-secondary addNewSlot removeSubject-' + newSubjects + '" name="addNewSlot" style="margin-top: 33px;" value="' + btnValue + '">' +
                            '</div>' +
                        '</div>');

                        // Append the row to the form
                        $('.subjectsOptions .form-row:last-child').after(row);
                        $('#newSubject-' + newSubjects).select2();
                        $('#newSubjectClasses-' + newSubjects).select2();
                        newSubjectsArray.push(newSubjects);
                        $('#newSubject-' + newSubjects).val(element.SubjectID).trigger("change");
                        $('#newSubjectClasses-' + newSubjects).val(element.Classes.split(",")).trigger("change");
                        counter ++;
                });
            }
            $('#manageCourseForm').block({timeout: 0.1});
        }
    })
})

$(document).on('change', '[id^="newSubject-"]', function() {
    var selectedOptions = [];
    // Iterate over all select elements with IDs starting with "newSubject-"
    $('[id^="newSubject-"]').each(function() {
        var selectedOption = $(this).val();
        
        if (selectedOption !== null) {
            // Check if the selected option is already in the selectedOptions array
            if (selectedOptions.includes(selectedOption)) {
                triggerAlert('Duplicate selection detected.', 'error');
                // Set the selected option to ""
                $(this).val('').trigger('change');
            }
            else {
                // Add the selected option to the selectedOptions array
                selectedOptions.push(selectedOption);
            }
        }
    });
});

$('#manageCourseForm').submit(function(e){
    if(document.getElementById('manageCourseForm').checkValidity() !== false){
        e.preventDefault()
        $('#manageCourseForm').block()
        $.ajax({
            url: 'assignCourseToTeachers',
            type: 'POST',
            data: {'subjects': newSubjectsArray, 'details': $('#manageCourseForm').serialize(), 'academicSession': $('#academicSession').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully assigned subject(s) to Teacher.', 'success');
                    getClassesnSubjects()
                    $('.manageCoursePopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#manageCourseForm').block({timeout: 0.1})
            }
        })
    }
})

var newSubjects = 0;
var newSubjectsArray = [];
$(document).on('click', '.addNewSlot', function() {
    var button = $(this);
    var value = button.val();
    newSubjects++;
    if (value === '+') {
        // Add Subject and addNewSlot below to respective elements
        var row = $(
            '<div class="form-row">' +
                '<div class="col-md-5 mb-3">' +
                    '<label for="newSubject-' + newSubjects + '">Subject</label>' +
                    '<select class="form-control" id="newSubject-' + newSubjects + '" name="newSubject-' + newSubjects + '" style="width: 100%; display: none;" required>' + subjectsOptions + '</select>' +
                    '<div class="invalid-feedback">' +
                        'Please select a Subject.' +
                    '</div>' +
                '</div>' +
                '<div class="col-md-6 mb-3">' +
                    '<label for="newSubjectClasses-' + newSubjects + '">Class(es)</label>' +
                    '<select class="form-control" id="newSubjectClasses-' + newSubjects + '" name="newSubjectClasses-' + newSubjects + '" multiple="multiple" style="width: 100%; display: none;" required>' + classesOptions + '</select>' +
                    '<div class="invalid-feedback">' +
                        'Please select at least one class.' +
                    '</div>' +
                '</div>' +
                '<div class="col-md-1 mb-3">' +
                    '<input type="button" class="btn btn-secondary addNewSlot removeSubject-' + newSubjects + '" name="addNewSlot" style="margin-top: 33px;" value="+">' +
                '</div>' +
            '</div>');

            // Append the row to the form
            $('.form-row:last').after(row);
            $('#newSubject-' + newSubjects).select2();
            $('#newSubjectClasses-' + newSubjects).select2();
            newSubjectsArray.push(newSubjects)
            button.val('x');
        }
        else if (value === 'x') {
            var SubjectToRemove = button.attr('class').match(/removeSubject-(\d+)/)[1];
            newSubjectsArray = newSubjectsArray.filter(function(element) {
                return element !== SubjectToRemove;
            });
            button.closest('.form-row').remove();
        }
});

// $('.addNewSlot').click(function(){

// })