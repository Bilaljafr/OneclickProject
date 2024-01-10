$('#module-3').addClass('active-page')
$('#sub-module-for-3-1').addClass('active')

getStaffMembers();

$('#staffDataFilter').change(function(){
    getStaffMembers()
})

function getStaffMembers(){
    $('#staffMembersDataCard').block();
    if (!$('#staffMembersDataTable').hasClass('dataTable') ) {
        $('#staffMembersDataTable').DataTable().destroy();
    }
    // $('#staffMembersDataTable').DataTable({scrollX: true})

    $.ajax({
        url: '/general/getStaffMembers',
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
                        data: 'AppointmentDate',
                        render: function(data, type, full, meta) {
                            if (type === 'display') {
                                return moment(data).format('dddd, MMM DD, YYYY')
                            }
                            else {
                                return data;
                            }
                        }
                    },
                    { data: 'Designation' },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to edit ' + data.Name + "'s data")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

$('#staffMembersDataTable tbody').on('click', 'tr', function () {
    var table = $('#staffMembersDataTable').DataTable();
    var data = table.row(this).data();
    $('#staffMembersDataTable').block();
    $.ajax({
        url: '/general/getDatabyStaffID',
        type: 'POST',
        data: {'staffID': data.StaffID},
        success: function(data) {
            $('#staffDetailsForm').removeClass('was-validated')

            $('#staffID').val(data[0].StaffID)
            $('#designation').val(data[0].Designation)
            $('#accessType').val(data[0].AccessType)
            $('#staffName').val(data[0].Name)
            $('#fatherName').val(data[0].FatherName)
            $('#appointmentDate').val(moment(data[0].AppointmentDate).format('YYYY-MM-DD'))
            $('#cityOfBirth').val(data[0].CityOfBirth)
            $('#contactNumber').val(data[0].ContactNumber)
            $('#email').val(data[0].UserEmail)
            $('#residentialAddress').val(data[0].ResidentialAddress)
            $('input[name="gender"][value="' + data[0].Gender + '"]').prop('checked', true);
            $('#dateOfBirth').val(moment(data[0].DateOfBirth).format('YYYY-MM-DD'))
            $('#qualification').val(data[0].Qualification).trigger('change')
            $('#nationality').val(data[0].Nationality)
            $('#religion').val(data[0].Religion)
            $('#motherTongue').val(data[0].MotherTongue)
            $('#maritalStatus').val(data[0].MaritalStatus).trigger('change')

            // $('select').select2();
            $('#staffMembersDataTable').block({timeout: 0.1});
            $('.staffDetailsPopup').modal('show');
        }
    });
});

$('#staffDetailsForm').submit(function(e){
    if(document.getElementById('staffDetailsForm').checkValidity() !== false){
        e.preventDefault()
        $('#staffDetailsForm').block();
        $.ajax({
            url: '/staff/updateStaffData',
            type: 'POST',
            data: $('#staffDetailsForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated data.', 'success');
                    getStaffMembers()
                    $('.staffDetailsPopup').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#staffDetailsForm').block({timeout: 0.1});
            }
        });
    }
})

$('#disableProfile').click(function(){
    $('#disableStaffID').val($('#staffID').val())
    $('#profileDisableDate').val(moment().format('YYYY-MM-DD'))
    $('.disableStaffPopup').modal('show');
})

$('#staffDisableForm').submit(function(e){
    if(document.getElementById('staffDisableForm').checkValidity() !== false){
        e.preventDefault()
        $('#staffDisableForm').block();
        $.ajax({
            url: '/staff/disableStaffProfile',
            type: 'POST',
            data: $('#staffDisableForm').serialize(),
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
        $('#staffDisableForm').block({timeout: 0.1});
    }
})

$('select').select2();