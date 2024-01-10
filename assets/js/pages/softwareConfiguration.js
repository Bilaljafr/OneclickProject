$('#softwareConfiguration').addClass('active-page')
getSessions()

var academicSessions = ''
function getSessions(){
    $.ajax({
        url: '/general/getSessions',
        type: 'GET',
        success: function(data) {
            academicSessions = data;
            $('#academicSession').empty()
            $('#importSession').empty()
            data.forEach(element => {
                $('#academicSession').append(
                    '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
                ); 
                $('#importSession').append(
                    '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
                ); 
            });
            $("#academicSession").select2();
            $("#importSession").select2();
            getClassesList()
        }
    });
}

$('#academicSession').change(function(){
    getClassesList()
})

var classesList = {}
function getClassesList(){
    $('#classesListTable').block();
    $.ajax({
        url: '/general/getClassesList',
        type: 'GET',
        data: {'AcademicSession': $('#academicSession').val()},
        success: function(data) {
            classesList = JSON.parse(data[0].ClassesList)
            $('#classesListTable tbody').empty()
            classesList.forEach(element => {
                var sections = ''
                element.Section.split(',').forEach(element => {
                    sections += '<span class="badge badge-secondary mr-1">' + element + '</span>'
                });
                $('#classesListTable tbody').append(
                    `<tr data-toggle="tooltip" data-placement="right" title="Click to edit ` + element.ClassName + `" onclick="editClass(` + element.ClassID + `)">
                        <th>` + element.ClassName + `</th>
                        <td>` + sections + `</td>
                        <!--<td style="cursor:pointer;" onclick="editClass(` + element.ClassID + `)"><i class="material-icons">edit</i></td>-->
                    </tr>`
                )
            });
            $('#classesListTable').block({timeout: 0.1});
            $('[data-toggle="tooltip"]').tooltip();
            getSeatsDetails()
        }
    })
}

function getSeatsDetails(){
    $('#seatsManagementTable').block();
    $.ajax({
        url: '/administrator/getSeatsDetails',
        type: 'GET',
        data: {'academicSession': $('#academicSession').val()},
        success: function(data) {
            $('#seatsManagementTable tbody').empty()
            data.forEach(element => {
                var className = classesList.find(obj => obj.ClassID == element.ClassID)?.ClassName;
                $('#seatsManagementTable tbody').append(
                    `<tr data-toggle="tooltip" data-placement="left" title="Click to edit ` + className + `" onclick="editSeats(` + element.ClassID + `)">
                        <th>` + className + `</th>
                        <td>` + element.Section + `</td>
                        <td>` + element.TotalSeats + `</td>
                        <td>` + '-' + `</td>
                        <!--<td style="cursor:pointer;" onclick="editSeats(` + element.ClassID + `)"><i class="material-icons">edit</i></td>-->
                    </tr>`
                )
            });
            $('[data-toggle="tooltip"]').tooltip();
            $('#seatsManagementTable').block({timeout: 0.1});
            // JSON.parse(data[0].ClassesList).forEach(element => {
            //     var sections = ''
            //     element.Section.split(',').forEach(element => {
            //         sections += '<span class="badge badge-secondary mr-1">' + element + '</span>'
            //     });
            //     $('#classesListTable tbody').append(
            //         `<tr>
            //             <th>` + element.ClassName + `</th>
            //             <td>` + sections + `</td>
            //             <td style="cursor:pointer;" onclick="editClass(` + element.ClassID + `)"><i class="material-icons">edit</i></td>
            //         </tr>`
            //     )
            // });
        }
    })
}

function editClass(classID){
    const classObj = classesList.find(item => item.ClassID == classID);
    var sections = classObj.Section.split(',');
    if(sections == ''){
        sections = null;
    }
    $('#updateClassTitle').val(classObj.ClassName)
    $('#updateClassID').val(classID)
    $('#modifySections').empty()
    $('#modifySections').select2({
        data: sections,
        tags: true,
        tokenSeparators: [',']
    }).val(classObj.Section.split(',')).trigger('change')
    $('.editClassPopup').modal('show')
}

function editSeats(classID){
    $('#editSeatsDetailsForm').block()
    $.ajax({
        url: '/administrator/getSeatsDetailsByClassID',
        type: 'POST',
        data: {'academicSession': $('#academicSession').val(), 'classID': classID},
        success: function(data) {
            $('#classIDToEdit').val(classID)
            $('#classTitleForEditSeat').val(classesList.find(item => item.ClassID == classID)?.ClassName)
            $('#sectionsForEditSeat').val(data[0].Section)
            $('#editSeatsDetailsForm').block({timeout: 0.1})
        }
    })
    $('.editSeatsDetailsPopup').modal('show')
}

$('#deleteSeatsRecord').click(function(){
    if(confirm("You are about to delete record of " + $('#classTitleForEditSeat').val() + "\nPress OK to proceed.")){
        $.ajax({
            url: '/administrator/deleteSeatsRecord',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'classID': $('#classIDToEdit').val(), 'section': $('#sectionsForEditSeat').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully deleted record.', 'success');
                    getSeatsDetails()
                    $('.editSeatsDetailsPopup').modal('hide')
                }
                else{
                    triggerAlert(data, 'error');
                }
            }
        })
    }
})

$('#editSeatsDetailsForm').submit(function(e){
    if(document.getElementById('editSeatsDetailsForm').checkValidity() !== false){
        e.preventDefault()
        $.ajax({
            url: '/administrator/editSeatsDetails',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'classID': $('#classIDToEdit').val(), 'section': $('#sectionsForEditSeat').val(), 'seatsCount': $('#totalSeatsToEdit').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated seat count.', 'success');
                    getSeatsDetails()
                    $('.editSeatsDetailsPopup').modal('hide')
                }
                else{
                    triggerAlert(data, 'error');
                }
            }
        })
    }
})

$('#setupNewSessionForm').submit(function(e){
    if(document.getElementById('setupNewSessionForm').checkValidity() !== false){
        e.preventDefault()
        if(!academicSessions.find(s => s.AcademicSession === $('#newSessionTitle').val())){
            $('#setupNewSessionForm').block()
            $.ajax({
                url: '/administrator/setupNewSession',
                type: 'POST',
                data: {'academicSession': $('#importSession').val(), 'newSessionTitle': $('#newSessionTitle').val()},
                success: function(data) {
                    if(data == 'Success'){
                        triggerAlert('Successfully setup new session.', 'success');
                        getSessions()
                        $('.setupNewSessionPopup').modal('hide')
                    }
                    else{
                        triggerAlert(data, 'error');
                    }
                    $('#setupNewSessionForm').block({timeout: 0.1})
                }
            })
        }
        else{
            triggerAlert('Title for new session cannot be same as of older session.', 'error');
        }
    }
})

function getFeeDetails(){
    $('#feeTableCard').block();
    var feeTypes = '', classesList = '', feeDetails = '', table = $('#feeDataTable');
    $.ajax({
        url: '/administrator/getFeeTypes',
        type: 'GET',
        data: {'academicSession': $('#academicSession').val()},
        success: function(data) {
            feeTypes = JSON.parse(data[0].FeeTypes);

            //now get classes list
            $.ajax({
                url: '/general/getClassesList',
                type: 'GET',
                data:{'AcademicSession': $('#academicSession').val()},
                success: function(data) {
                    classesList = JSON.parse(data[0].ClassesList)

                    // now get fee details
                    $.ajax({
                        url: '/administrator/getFeeDetails',
                        type: 'POST',
                        data: {'academicSession': $('#academicSession').val()},
                        success: function(data) {
                            feeDetails = data;

                            // now setup table using data
                            feeTypes.forEach(element => {
                                $('#feeDataTable thead tr').append(function(){
                                    return '<th>' + element.Title + '</th>'
                                })
                            });

                            // console.log(feeTypes)
                            // console.log(classesList)
                            // console.log(feeDetails)

                            const feesData = {};
                            feeTypes.forEach((fee) => {
                                feesData[fee.ID] = {title: fee.Title};
                            });
                            
                            classesList.forEach((cls) => {
                                feesData[cls.ClassID]["ClassName"] = cls.ClassName;
                                feesData[cls.ClassID]["Section"] = cls.Section;

                                // Set default values for each fee type
                                feeTypes.forEach((fee) => {
                                    feesData[cls.ClassID][`fee_${fee.ID}`] = "-";
                                });
                            });
                            
                            feeDetails.forEach((fee) => {
                                feesData[fee.ClassID][`fee_${fee.FeeType}`] = fee.Amount;
                            });
                            
                            const columns = [
                                { data: "ClassName" },
                            ];
                            
                            feeTypes.forEach((fee) => {
                                columns.push({ data: `fee_${fee.ID}`, title: fee.Title });
                            });
                            
                            if (table.hasClass('dataTable') ) {
                                table.DataTable().destroy();
                            }

                            table.DataTable({
                                // data: Object.values(feesData),
                                data: Object.values(feesData).filter(row => {
                                    // Filter out rows with all fee columns empty
                                    return Object.keys(row).some(key => key.startsWith("fee")) && row.ClassName;
                                }),
                                columns: columns,
                                paging: false,
                                searching: false,
                                info: false,
                            });
                            
                            $('#feeTableCard').block({timeout: 0.1});
                        }
                    });
                }
            });
        }
    });
}

$('#addNewClass').click(function(){
    // $('#addNewClassForm')[0].reset();
    $('#classTitle').val('').trigger('change')
    $('#sections').val('').trigger('change')


    $('.addNewClassPopup').modal('show')
})

$('#setupNewSession').click(function(){
    $('.setupNewSessionPopup').modal('show')
})

$('#addSeatsDetails').click(function(){
    $('#addSeatsDetailsForm')[0].reset();
    classesList.forEach(element => {
        $('#classTitleForSeatManagement').append('<option value="' + element.ClassID + '">' + element.ClassName + '</option>')
    });
    $('#classTitleForSeatManagement').select2({
        tags: true,
        tokenSeparators: [',']
    })
    $('.addSeatsDetailsPopup').modal('show')
})

$('#addSeatsDetailsForm').submit(function(e){
    if(document.getElementById('addSeatsDetailsForm').checkValidity() !== false){
        e.preventDefault()
        $('#addSeatsDetailsForm').block()
        $.ajax({
            url: '/administrator/addSeatsDetails',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'classID': $('#classTitleForSeatManagement').val(), 'section': $('#sectionsForSeatManagement').val(), 'totalSeats': $('#totalSeatsToAdd').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully added seats details.', 'success');
                    getSeatsDetails()
                    $('.addSeatsDetailsPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#addSeatsDetailsForm').block({timeout:0.1})
            }
        })
    }
})

$('#classTitleForSeatManagement').change(function(){
    $('#sectionsForSeatManagement').empty()
    classesList.find(item => item.ClassID == $('#classTitleForSeatManagement').val()).Section.split(',').forEach(element => {
        $('#sectionsForSeatManagement').append('<option value="' + element + '">' + element + '</option>')
    });
    $('#sectionsForSeatManagement').select2({
        tags: true,
        tokenSeparators: [',']
    })
})

$('#addNewClassForm').submit(function(e){
    if(document.getElementById('addNewClassForm').checkValidity() !== false){
        e.preventDefault()
        $('#addNewClassForm').block()
        $.ajax({
            url: '/administrator/addNewClass',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'classTitle': $('#classTitle').val(), 'sections': $('#sections').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully added new class.', 'success');
                    getClassesList()
                    getSeatsDetails()
                    $('.addNewClassPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#addNewClassForm').block({timeout:0.1})
            }
        })
    }
})

$('#modifyClassForm').submit(function(e){
    if(document.getElementById('modifyClassForm').checkValidity() !== false){
        e.preventDefault()
        $('#modifyClassForm').block()
        classesList.find(obj => obj.ClassID == $('#updateClassID').val()).ClassName = $('#updateClassTitle').val();
        classesList.find(obj => obj.ClassID == $('#updateClassID').val()).Section = $('#modifySections').val().join(",");
        $.ajax({
            url: '/administrator/modifyClassDetails',
            type: 'POST',
            data: {'classesList': classesList, 'academicSession': $('#academicSession').val()},
            success: function(data) {
                if(data == 'Success'){
                    $('#modifyClassForm')[0].reset();
                    triggerAlert('Successfully edit class details.', 'success');
                    getClassesList()
                    getSeatsDetails()
                    $('.editClassPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#modifyClassForm').block({timeout:0.1})
            }
        })
    }
})

$('#deleteClass').click(function(){
    if(confirm('You are about to delete this class. Press ok to continue.')) {
        $('#modifyClassForm').block()
        const newClassesList = classesList.filter(obj => obj.ClassID != $('#updateClassID').val());
        $.ajax({
            url: '/administrator/deleteClass',
            type: 'POST',
            data: {'classesList': newClassesList, 'academicSession': $('#academicSession').val(), 'classToDelete': $('#updateClassID').val()},
            success: function(data) {
                if(data == 'Success'){
                    $('#modifyClassForm')[0].reset();
                    triggerAlert('Successfully deleted class.', 'success');
                    getClassesList()
                    $('.editClassPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#modifyClassForm').block({timeout:0.1})
            }
        })
    }
})

$('#classTitle').select2({
    tags: true,
    tokenSeparators: [',']
})

$('#sections').select2({
    tags: true,
    tokenSeparators: [',']
})