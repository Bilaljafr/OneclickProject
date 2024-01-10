$('#module-1').addClass('active-page')
$('#sub-module-for-1-4').addClass('active')

$('#incrementDate').val(moment().format('YYYY-MM-DD'))

getStaffMembers();

$('#staffDataFilter').change(function(){
    getStaffMembers()
})

function getStaffMembers(){
    $('#staffMembersDataCard').block();
    $('#staffMembersDataTable').DataTable()

    $.ajax({
        url: '/accounts/getStaffPayDetails',
        type: 'POST',
        data: {'filter': $('#staffDataFilter').val()},
        success: function(data) {
            $('#staffMembersDataCard').block({timeout: 0.1});
            var table = $('#staffMembersDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { data: 'StaffID' },
                    {
                        data: 'Name',
                        render: function(data, type, full, meta) {
                            var prefix = 'D/O'
                            if(full.Gender == 'Male'){
                                prefix = 'S/O'
                            }
                            return data + '<br><small>' + prefix + ' ' + full.FatherName + '</small>';
                        }
                    },
                    { 
                        data: 'ContactNumber',
                        render: function(data, type, full, meta) {
                            return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10) + '<br><small>' + full.UserEmail + '<br>' + full.ResidentialAddress + '</small>';
                        }
                    },
                    { 
                        data: 'Salary',
                        render: function(data, type, full, meta) {
                            var toDate = moment(full.TillDate, 'YYYY-MM-DD').format('dddd, MMM DD, YYYY')
                            if(full.TillDate == '0000-00-00'){
                                toDate = 'Now'
                            }
                            return data + ' PKR' + '<br><small> From ' + moment(full.FromDate, 'YYYY-MM-DD').format('dddd, MMM DD, YYYY') + ' Till ' + toDate + '</small>';
                        }
                    },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to view ' + data.Name + "'s increment record.")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

var openedStaffID = '';
$('#staffMembersDataTable tbody').on('click', 'tr', function () {
    var table = $('#staffMembersDataTable').DataTable();
    var data = table.row(this).data();
    openedStaffID = data.StaffID;
    $('#staffMembersDataTable').block();
    $.ajax({
        url: '/accounts/getStaffPayRecords',
        type: 'POST',
        data: data,
        success: function(data) {
            var table = $('#staffDetailsDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { data: 'StaffID' },
                    {
                        data: 'Name',
                        render: function(data, type, full, meta) {
                            var prefix = 'D/O'
                            if(full.Gender == 'Male'){
                                prefix = 'S/O'
                            }
                            return data + '<br><small>' + prefix + ' ' + full.FatherName + '</small>';
                        }
                    },
                    { 
                        data: 'AppointmentDate',
                        render: function(data, type, full, meta) {
                            return '' + moment(full.AppointmentDate, 'YYYY-MM-DD').format('dddd, MMM DD, YYYY') + '';
                        }
                    },
                    { 
                        data: 'Salary',
                        render: function(data, type, full, meta) {
                            var toDate = moment(full.TillDate).format('dddd, MMM DD, YYYY')
                            if(full.TillDate == '0000-00-00'){
                                toDate = 'Now'
                            }
                            return data + ' PKR' + '<br><small> From ' + moment(full.FromDate, 'YYYY-MM-DD').format('dddd, MMM DD, YYYY') + ' Till ' + toDate + '</small>';
                        }
                    },
                ]
            });
            table.DataTable().clear().rows.add(data).draw();
            // $('select').select2();
            $('#staffMembersDataTable').block({timeout: 0.1});
            $('.staffSalaryDetailsPopup').modal('show');
        }
    });
});

$('#updateSalary').click(function(){
    $.ajax({
        url: '/accounts/getStaffCurrentPay',
        type: 'POST',
        data: {'staffID': openedStaffID},
        success: function(data) {
            $('#staffID').val(data[0].StaffID)
            $('#staffName').val(data[0].Name)
            $('#currentSalary').val(data[0].Salary)
        }
    })
    $('.disableStaffPopup').modal('show');
})

$('#staffSalaryIncrementForm').submit(function(e){
    if(document.getElementById('staffSalaryIncrementForm').checkValidity() !== false){
        e.preventDefault()
        $('#staffSalaryIncrementForm').block();
        $.ajax({
            url: '/accounts/updateStaffPay',
            type: 'POST',
            data: $('#staffSalaryIncrementForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated pay.', 'success');
                    getStaffMembers()
                    $('.modal').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#staffSalaryIncrementForm').block({timeout: 0.1});
            }
        });
    }
})

$('#newSalary').change(function() {
    if($('#newSalary').val() != null){
        $('#increamentInPercent').val(((($('#newSalary').val() - $('#currentSalary').val()) / $('#currentSalary').val()) * 100).toFixed(2) + '%')
    }
    else{
        $('#increamentInPercent').val(0)
    }
});

// $('#staffDetailsForm').submit(function(e){
//     if(document.getElementById('staffDetailsForm').checkValidity() !== false){
//         e.preventDefault()
//         $('#staffDetailsForm').block();
//         $.ajax({
//             url: './updateStaffData',
//             type: 'POST',
//             data: $('#staffDetailsForm').serialize(),
//             success: function(data) {
//                 if(data == 'Success'){
//                     triggerAlert('Successfully updated data.', 'success');
//                     getStaffMembers()
//                     $('.staffDetailsPopup').modal('hide');
//                 }
//                 else{
//                     triggerAlert(data, 'error');
//                 }
//                 $('#staffDetailsForm').block({timeout: 0.1});
//             }
//         });
//     }
// })

// $('#disableProfile').click(function(){
//     $('#disableStaffID').val($('#staffID').val())
//     $('#profileDisableDate').val(moment().format('YYYY-MM-DD'))
//     $('.disableStaffPopup').modal('show');
// })

// $('#staffDisableForm').submit(function(e){
//     if(document.getElementById('staffDisableForm').checkValidity() !== false){
//         e.preventDefault()
//         $('#staffDisableForm').block();
//         $.ajax({
//             url: './disableStaffProfile',
//             type: 'POST',
//             data: $('#staffDisableForm').serialize(),
//             success: function(data) {
//                 if(data == 'Success'){
//                     triggerAlert('Successfully disabled profile.', 'success');
//                     getStaffMembers();
//                     $('.modal').modal('hide');
//                 } else{
//                     triggerAlert(data, 'error');
//                 }
//             }
//         });
//         $('#staffDisableForm').block({timeout: 0.1});
//     }
// })

$('select').select2();