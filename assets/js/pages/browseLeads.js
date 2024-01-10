$('#module-1').addClass('active-page')
$('#sub-module-for-1-1').addClass('active')

$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        getLeads();
    }
})

$.ajax({
    url: '/leads-management/getAggregates',
    type: 'POST',
    success: function(data) {
        $('.aggregate').html('<option value="0">No aggrigate selected</option>')
        data.forEach(element => {
            $('.aggregate').append(`<option value="${element.ID}">${element.InsuranceCompany}</option>`)
        });
        $('.aggregate').select2();
    }
});

var carDetails = '';
$.ajax({
    url: '/getCarDetails',
    type: 'POST',
    success: function(data) {
        carDetails = data;
    }
});

$('#leadsDataTable').DataTable({scrollX: true})
function getLeads(){
    $('#leadsDataCard').block();
    $.ajax({
        url: '/leads-management/getLeadsByDate',
        type: 'POST',
        data: {'dateFrom': moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'), 'dateTill': moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')},
        success: function(data) {
            var table = $('#leadsDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }
            table.DataTable({
                scrollX: true,
                columns: [
                    { 
                        data: null,
                        render: function(data, type, full, meta) {
                            return meta.row + 1;
                        }
                    },
                    { 
                        data: 'Name',
                        render: function(data, type, full, meta) {
                            return full.Name + `<br><small>${moment(full.Dated).format('dddd, DD MMM, YYYY hh:mm A')}</small>`;
                        }
                    },
                    { 
                        data: 'PhoneNumber',
                        render: function(data, type, full, meta) {
                            return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10) + `<br><small>${full.EmailAddress}</small>`;
                        }
                    },
                    { data: 'CoverageType' },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to view ' + data.Name + "'s details.")
                }
            }).clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
            $('#leadsDataCard').block({timeout: 0.1});
        }
    });
}

var openedLeadID = '';
$('#leadsDataTable tbody').on('click', 'tr', function () {
    var table = $('#leadsDataTable').DataTable();
    var data = table.row(this).data();
    $('#leadsDataTable').block();
    $.ajax({
        url: '/leads-management/getLeadDetails',
        type: 'POST',
        data: {'leadID': data.ID},
        success: function(data) {
            if(data.length > 0){
                if(data[0].InsuranceType == 1){
                    $('#leadID').val(data[0].ID)
                    $('#insuranceType').val(data[0].CoverageType)
                    $('#aggrigateForCarInsurance').val(data[0].AggregateID).trigger('change')
                    $('#tracker').val(data[0].Tracker)
                    $('#applicantName').val(data[0].Name)
                    $('#phone').val(data[0].PhoneNumber)
                    $('#emailAddress').val(data[0].EmailAddress)
                    $('#carManufacturer').val(carDetails.filter((item) => item.ID == data[0].ManufacturerID)[0].Brand)
                    $('#carModel').val(data[0].CarModel)
                    $('#carManufacturingYear').val(data[0].ManufacturingYear)
                    $('#carMarketValue').val(data[0].CarPrice)
                    $('#insuranceAgentRemarksForCarInsurance').val(data[0].Remarks)
                    $('.motorComprehensiveLeadPopup').modal('show');

                    $('#motorComprehensiveLeadForm').removeClass('was-validated');
                }
                else if(data[0].InsuranceType == 2){
                    $('#leadIDForBikeInsurance').val(data[0].ID)
                    $('#insuranceTypeForBikeInsurance').val(data[0].CoverageType)
                    $('#aggrigateForBikeInsurance').val(data[0].AggregateID).trigger('change')
                    $('#applicantNameForBikeInsurance').val(data[0].Name)
                    $('#phoneForBikeInsurance').val(data[0].PhoneNumber)
                    $('#emailAddressForBikeInsurance').val(data[0].EmailAddress)
                    $('#bikeManufacturer').val(carDetails.filter((item) => item.ID == data[0].ManufacturerID)[0].Brand)
                    $('#bikeEngine').val(data[0].CarModel)
                    $('#bikeManufacturingYear').val(data[0].ManufacturingYear)
                    $('#bikeMarketValue').val(data[0].CarPrice)
                    $('#insuranceAgentRemarksForBikeInsurance').val(data[0].Remarks)
                    $('.bikeInsuranceLeadPopup').modal('show');

                    $('#bikeInsuranceLeadForm').removeClass('was-validated');
                }
                openedLeadID = data[0].ID;
            }
            $('#leadsDataTable').block({timeout: 0.1});
        }
    });
});

$('#motorComprehensiveLeadForm').submit(function(e){
    if(document.getElementById('motorComprehensiveLeadForm').checkValidity() !== false){
        e.preventDefault()
        $('#motorComprehensiveLeadForm').block();
        $.ajax({
            url: '/leads-management/updateCarInsuranceLeadDetails',
            type: 'POST',
            data: $('#motorComprehensiveLeadForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    $('#motorComprehensiveLeadForm')[0].reset();
                    triggerAlert('Successfully updated data.', 'success');
                    getLeads();
                    $('.modal').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#motorComprehensiveLeadForm').block({timeout: 0.1});
            }
        });
    }
})

$('#bikeInsuranceLeadForm').submit(function(e){
    if(document.getElementById('bikeInsuranceLeadForm').checkValidity() !== false){
        e.preventDefault()
        $('#bikeInsuranceLeadForm').block();
        $.ajax({
            url: '/leads-management/updateBikeInsuranceLeadDetails',
            type: 'POST',
            data: $('#bikeInsuranceLeadForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    $('#bikeInsuranceLeadForm')[0].reset();
                    triggerAlert('Successfully updated data.', 'success');
                    getLeads();
                    $('.modal').modal('hide');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#bikeInsuranceLeadForm').block({timeout: 0.1});
            }
        });
    }
})

$('#deleteLead').click(function(){
    const result = window.confirm('Are you sure you want to delete this lead?');
    if (result) {
        $.ajax({
            url: '/leads-management/deleteLead',
            type: 'POST',
            data: {'leadID': openedLeadID},
            success: function(data) {
                if(data == 'Success'){
                    getLeads();
                    $('.modal').modal('hide');
                }
            }
        });
    }
});