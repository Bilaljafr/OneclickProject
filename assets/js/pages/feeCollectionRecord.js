$('#module-1').addClass('active-page')
$('#sub-module-for-1-2').addClass('active')

$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        getGeneratedReceipts();
    }
})

function getGeneratedReceipts(){
    $('#receiptDataTable').block()
    $.ajax({
        url: '/accounts/getGeneratedReceipts',
        type: 'POST',
        dataType: 'json',
        data: {'dateFrom': moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'), 'dateTill': moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')},
        success: function(data) {
            var table = $('#receiptDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                "scrollX": true,
                columns: [
                    { 
                        data: null,
                        render: function (data, type, full, meta) {
                            return meta.row + 1;
                        }
                    },
                    { 
                        data: 'VoucherNumber',
                        render: function(data, type, full, meta) {
                            return 'Voucher # ' + full.VoucherNumber + '<br><small>Generated on ' + moment(full.Dated).format('dddd, MMM DD, YYYY hh:mm A') + '</small>';
                        }
                    },
                    { 
                        data: 'ReceivedAmount',
                        render: function(data, type, full, meta) {
                            return 'PKR ' + full.ReceivedAmount;
                        }
                    },
                    { 
                        data: 'StudentsName',
                        render: function(data, type, full, meta) {
                            return full.StudentsName + '<br>S/D/o: ' + full.FatherName;
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
                        .attr('title', "Click to view/print receipt")
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();

            $('#receiptDataTable').block({timeout: 0.1});
        }
    });
}
