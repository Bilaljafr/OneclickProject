$('#module-3').addClass('active-page')
$('#sub-module-for-3-1').addClass('active')

$('#appointmentDate').val(moment().format('YYYY-MM-DD'))

getUpcomingStaffID();

$('#appointStaffForm').submit(function(e){
    e.preventDefault()
    if(document.getElementById('appointStaffForm').checkValidity() !== false){
        $.ajax({
            url: '/staff/appointNewStaff',
            type: 'POST',
            data: $('#appointStaffForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully entered record to database.', 'success');
                    $('#appointStaffForm')[0].reset();
                    $('#qualification').val([]).trigger('change');
                    $('#maritalStatus').val([]).trigger('change');
                    $('#appointStaffForm').removeClass('was-validated');

                    getUpcomingStaffID()
                }
                else{
                    triggerAlert(data, 'error');
                }
            }
        });
    }
})

function getUpcomingStaffID(){
    $.ajax({
        url: '/staff/getUpcomingStaffID',
        type: 'GET',
        success: function(data) {
            if(data[0].StaffID){
                $('#StaffID').val((data[0].StaffID + 1))
            }
            else{
                $('#StaffID').val('1')
            }
        }
    });
}

$("select").select2();