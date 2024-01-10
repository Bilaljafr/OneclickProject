$('#module-1').addClass('active-page')
$('#sub-module-for-1-5').addClass('active')

$('#dated').val(moment().format('YYYY-MM-DD'))

// $(document).ready(function() {
//     checkingExpense();
// });

// $('#reportrange').change(function(){
//     checkingExpense()
// })

$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        checkingExpense();
    }
})

function checkingExpense(){
    $('#expensesDataCard').block()
    $.ajax({
        url: '/accounts/checkingExpenseByFilter',
        type: 'POST',
        dataType: 'json',
        data: {'dateFrom': moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'), 'dateTill': moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')},
        success: function(data) {
            var table = $('#manageExpenseDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                "scrollX": true,
                columns: [
                    {
                        data: null,
                        render: function(data, type, full, meta) {
                          return meta.row + 1 + `<input type="hidden" id="${meta.row}" value="${full.ID}">`;
                        }
                    },
                    { 
                        data: 'Date',
                        render: function(data, type, full, meta) {
                            return moment(full.Date).format('dddd, MMM DD, YYYY');
                        }
                    },
                    { 
                        data: 'ExpenseType',
                        render: function(data, type, full, meta) {
                            return full.ExpenseType + '<br><small>' + full.Description + '</small>';
                        }
                    },
                    { 
                        data: 'Amount',
                        render: function(data, type, full, meta) {
                            return 'PKR ' + full.Amount;
                        }
                    },
                    { 
                        data: 'Name',
                        render: function(data, type, full, meta) {
                            return full.Name;
                        }
                    },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', "Click to edit details")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();

            $('#expensesDataCard').block({timeout: 0.1});
        }
    });
}

$('#addNewExpense').click(function(){
    $('.addNewExpensePopup').modal('show')
})

$('#expenseForm').submit(function(e){
    e.preventDefault();
    if(document.getElementById('expenseForm').checkValidity() !== false){
        $.ajax({
            url: '/accounts/addNewExpense',
            type: 'POST',
            data: $('#expenseForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated expense record.', 'success');
                    checkingExpense()
                    $('.addNewExpensePopup').modal('hide')
                }
                else{
                    triggerAlert(data, 'error');
                }
            }
        })
    }
})

$('#manageExpenseDataTable tbody').on('click', 'tr', function () {
    var table = $('#manageExpenseDataTable').DataTable();
    var rowIdx = table.row(this).index();
    var expenseID = $("#" + rowIdx).val();
    $('#manageExpenseDataTable').block();

    $.ajax({
        url: '/accounts/getExpenseDetails',
        type: 'POST',
        data: {'expenseID': expenseID},
        success: function(data) {
            $('.editExpensePopup').modal('show')

            $('#editDated').val(moment(data[0].Date).format('YYYY-MM-DD'))
            $('#editExpenseTitle').val(data[0].ExpenseType)
            $('#editExpenseID').val(data[0].ID)
            $('#editExpenseAmount').val(data[0].Amount)
            $('#editExpenseDescription').val(data[0].Description)

            $('#manageExpenseDataTable').block({timeout: 0.1});
        }
    })
});


$('#editExpenseForm').submit(function(e){
    e.preventDefault();
    if(document.getElementById('editExpenseForm').checkValidity() !== false){
        $('#editExpenseForm').block()
        $.ajax({
            url: '/accounts/editExpense',
            type: 'POST',
            data: $('#editExpenseForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully edit expense record.', 'success');
                    checkingExpense()
                    $('.editExpensePopup').modal('hide')
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#editExpenseForm').block({timeout: 0.1})
            }
        })
    }
})

$('select').select2();