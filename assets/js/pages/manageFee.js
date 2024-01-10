$('#module-1').addClass('active-page')
$('#sub-module-for-1-3').addClass('active')

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
        getFeeDetails()
    }
});

$('#academicSession').change(function(){
    getFeeDetails()
})

$('#addFeeType').click(function(){
    $('.addFeeTypePopup').modal('show')
})

$('#newFeeTypeForm').submit(function(e){
    if(document.getElementById('newFeeTypeForm').checkValidity() !== false){
        e.preventDefault()
        $('#newFeeTypeForm').block()
        if (!feeTypes.find(feeType => feeType.Title === $('#newFeeTypeTitle').val())) {
            const newId = (parseInt(feeTypes[feeTypes.length - 1].ID) + 1).toString();
            feeTypes.push({
                "ID": newId,
                "Title":  $('#newFeeTypeTitle').val()
            });
        }

        $.ajax({
            url: './addNewFeeType',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'feeTypes': feeTypes},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully added new fee type.', 'success');
                    // getFeeDetails()
                    location.reload()
                    $('.addFeeTypePopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#newFeeTypeForm').block({timeout: 0.1})
            }   
        })     
    }
})

function setUpManageFeePopup(){
    $('#classes').empty()
    $('#feeType').empty()

    classesList.forEach(element => {
        $('#classes').append('<option value="' + element.ClassID + '">' + element.ClassName + '</option>')
    });

    feeTypes.forEach(element => {
        $('#feeType').append('<option value="' + element.ID + '">' + element.Title + '</option>')
    });

    $('#classes').select2({
        tags: false,
        tokenSeparators: [',']
    })

    $('#feeType').select2({
        tags: false,
        tokenSeparators: [',']
    })
}

$('#addFeeAmount').click(function(){
    setUpManageFeePopup()

    $('.editAmount').show()
    $('#deleteFeeType').hide()
    $('.manageFeePopup').modal('show')
})

$('#removeFeeType').click(function(){
    setUpManageFeePopup()

    $('.editAmount').hide()
    $('#deleteFeeType').show()
    $('.manageFeePopup').modal('show')
})

$('#deleteFeeType').click(function(){
    $('#manageAmountForm').block()
    $.ajax({
        url: './deleteFeetype',
        type: 'POST',
        data: {'academicSession': $('#academicSession').val(), 'feeType': $('#feeType').val()},
        success: function(data) {
            if(data == 'Success'){
                triggerAlert('Successfully deleted fee type.', 'success');
                // getFeeDetails()
                location.reload()
                $('.manageFeePopup').modal('hide');
            }
            else{
                triggerAlert(data, 'error');
            }
            $('#manageAmountForm').block({timeout: 0.1})
        }   
    }) 
})

$('#manageAmountForm').submit(function(e){
    if(document.getElementById('manageAmountForm').checkValidity() !== false){
        e.preventDefault()
        $('#manageAmountForm').block()
        $.ajax({
            url: './manageFeeAmount',
            type: 'POST',
            data: {'academicSession': $('#academicSession').val(), 'classes': $('#classes').val(), 'feeType': $('#feeType').val(), 'amount': $('#amount').val()},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated amount.', 'success');
                    getFeeDetails()
                    $('.manageFeePopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#manageAmountForm').block({timeout: 0.1})
            }   
        })   
    }
})

var feeTypes = '', classesList = '', feeDetails = '', table = $('#feeDataTable');
function getFeeDetails(){
    $('#feeDataTable').block();
    $.ajax({
        url: './getFeeTypes',
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
                        url: './getFeeDetails',
                        type: 'POST',
                        data: {'academicSession': $('#academicSession').val()},
                        success: function(data) {
                            feeDetails = data;

                            // now setup table using data
                            $('#feeDataTable thead tr').empty()
                            $('#feeDataTable thead tr').append('<th>Class</th>')
                            feeTypes.forEach(element => {
                                $('#feeDataTable thead tr').append(function(){
                                    return `<th>${element.Title}</th>`
                                })
                            });

                            const feesData = {};
                            feeTypes.forEach((fee) => {
                                feesData[fee.ID] = {title: fee.Title};
                            });

                            feeDetails.forEach((fee) => {
                                feesData[fee.ClassID] = feesData[fee.ClassID] || {}; // Initialize the feesData object if it doesn't exist
                                feesData[fee.ClassID][`fee_${fee.FeeType}`] = fee.Amount;
                            });
                            
                            classesList.forEach((cls) => {
                                feesData[cls.ClassID] = feesData[cls.ClassID] || {}; // Initialize the feesData object if it doesn't exist
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
                            
                            // if (table.hasClass('dataTable') ) {
                            //     table.DataTable().destroy();
                            // }
                            if ($.fn.DataTable.isDataTable('#feeDataTable')) {
                                $('#feeDataTable').DataTable().destroy();
                            }

                            $('#feeDataTable').DataTable({
                                // data: Object.values(feesData),
                                data: Object.values(feesData).filter(row => {
                                    // Filter out rows with all fee columns empty
                                    return Object.keys(row).some(key => key.startsWith("fee")) && row.ClassName;
                                }),
                                columns: columns,
                                paging: false,
                                searching: false,
                                info: false,
                                "scrollX": true,
                            });
                            
                            $('#feeDataTable').block({timeout: 0.1});
                        }
                    });
                }
            });
        }
    });
}