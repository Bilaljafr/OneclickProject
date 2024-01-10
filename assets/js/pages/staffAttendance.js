$('#module-4').addClass('active-page')
$('#sub-module-for-4-2').addClass('active')

$('#dated').val(moment().format('YYYY-MM-DD'));

getStaffMembers();

$('#staffDataFilter').change(function(){
    getStaffMembers()
})

function getStaffMembers(){
    $('#staffMembersDataCard').block();
    $('#staffMembersDataTable').DataTable({scrollX: true})

    $.ajax({
        url: '/general/getStaffMembers',
        type: 'POST',
        data: {'filter': 'Active'},
        success: function(data) {
            $('#staffMembersDataCard').block({timeout: 0.1});
            var table = $('#staffMembersDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { 
                        data: 'StaffID', 
                        orderable: false, 
                        className: 'select-checkbox',
                        render: function(data, type, full, meta) {
                            if (type === 'display') {
                                return '<input type="checkbox" name="staffID" value="' + full.StaffID + '" class="customized-checkbox">';
                            }
                            else {
                                return data;
                            }
                        }
                    },
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
                    // {
                    //     data: 'AppointmentDate',
                    //     render: function(data, type, full, meta) {
                    //         if (type === 'display') {
                    //             return moment(data).format('dddd, MMM DD, YYYY')
                    //         }
                    //         else {
                    //             return data;
                    //         }
                    //     }
                    // },
                    // { data: 'Designation' },
                ],
                "aaSorting": [[1,'asc']],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to mark ' + data.Name + "'s attendance")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

$('#staffMembersDataTable tbody').on('click', 'tr', function (event) {
    var table = $('#staffMembersDataTable').DataTable();
    var data = table.row(this).data();
    // $('#zero-conf').block();
    var clickedCell = table.cell(event.target);
    if (clickedCell && clickedCell.index()) {
        var clickedColumnIndex = clickedCell.index().column;
        if(clickedColumnIndex > 0 ){
            var checkbox = $('input[type="checkbox"][name="staffID"][value="' + data.StaffID + '"]');
            checkbox.prop('checked', !checkbox.prop('checked'));
        }
    }
    $('#attendanceSummary').text($('input[type="checkbox"][name="staffID"]:checked').length + ' out of ' + $('input[type="checkbox"][name="staffID"]').length + ' is present')
});

$('#select-all-checkbox').on('change', function () {
    var isChecked = $(this).prop('checked');
    $('.customized-checkbox').prop('checked', isChecked);
    $('#attendanceSummary').text($('input[type="checkbox"][name="staffID"]:checked').length + ' out of ' + $('input[type="checkbox"][name="staffID"]').length + ' is present')
});

$('#uploadAttendance').click(function(){
    const checkedValues = [];
    $('input[type=checkbox]:checked').each(function() {
        checkedValues.push($(this).val());
    });
    if(checkedValues.length > 0){
        $('#staffMembersDataTable').block();
        $.ajax({
            url: '/administrator/uploadStaffAttendance',
            type: 'POST',
            data: {'presentStudents': checkedValues, 'dated': moment().format('YYYY-MM-DD')},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully uploaded attendance.', 'success');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#staffMembersDataTable').block({timeout: 0.1});
            }
        });
    }
    else{
        triggerAlert('System cannot upload blank attendance.', 'error');
    }
})

$('select').select2();