$('#module-1').addClass('active-page')
$('#sub-module-for-1-1').addClass('active')

$.ajax({
    url: '/general/getSessions',
    type: 'GET',
    success: function(data) {
        data.forEach(element => {
            $('#academicSessions').append(
                '<option value="' + element.AcademicSession + '">' + element.AcademicSession + '</option>'
            ); 
        });
        $("#academicSessions").select2();
        getFeeBySession()
    }
});

var feeDetails = '', feeTypes = '', classesList = '', studentDetails = '', feeMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Sptember', 'October', 'November', 'December'];
function getFeeBySession(){
    $.ajax({
        url: './getFeeBySession',
        type: 'POST',
        data: {'academicSession': $('#academicSessions').val()},
        success: function(data) {
            feeDetails = data;
        }
    });

    $.ajax({
        url: './getFeeTypesAndClassesList',
        type: 'GET',
        data: {'academicSession': $('#academicSessions').val()},
        success: function(data) {
            feeTypes = JSON.parse(data[0].FeeTypes);
            classesList = JSON.parse(data[0].ClassesList);
        }
    });
}

$('#generateVoucher').click(function(){
    if(payableAmount > 0){
        $.ajax({
            url: './generateVoucher',
            type: 'POST',
            data: {'dated': moment().format('YYYY-MM-DD'), 'generatedFor': studentDetails.GRNumber, 'paidFor': generateJSON(), 'payableAmount': payableAmount, 'discount': discount, 'academicSession': $('#academicSessions').val()},
            success: function(data) {
                generateReceipt(data.VoucherNumber, data.operatorName)
                $('#studentGRNumber').val(studentDetails.GRNumber)
                $('#searchFeeHistoryByGRForm').submit()
            }
        });
    }
    else{
        triggerAlert('System cannot generate blank receipt.', 'error');
    }
})

function generateJSON() {
    var fineAmount = document.getElementById("fineAmount").value;
  
    // Create an array to hold the JSON objects
    var jsonArray = [];
  
    // Loop through the payForMonth array and add objects to the JSON array
    $('#payForMonth').val().forEach(function(month) {
        var json = {
            "Month": month,
            "Amount": feeDetails.filter(item => item.FeeType == '1' && item.ClassID == studentDetails.PresentClass).map(item => item.Amount)[0],
            "FeeType": "1"
        };
        jsonArray.push(json);
    });
  
    // Loop through the otherCharges array and add objects to the JSON array
    $('#otherCharges').val().forEach(function(feeType) {
        var json = {
            "Amount": feeDetails.filter(item => item.FeeType == feeType && item.ClassID == studentDetails.PresentClass).map(item => item.Amount)[0],
            "FeeType": feeType
        };
        jsonArray.push(json);
    });
    
    // Add the fineAmount object to the JSON array
    if (fineAmount != "" && fineAmount != 0) {
        var json = {
            "Amount": fineAmount,
            "FeeType": "70"
        };
        jsonArray.push(json);
    }
    
    // Convert the JSON array to a string
    var jsonString = JSON.stringify(jsonArray);
    return jsonString;
}

function generateReceipt(voucherNumber, operatorName){
    $('#receiptDetails tbody').empty()
    $('#paymentSummary tbody').empty()
    $('#receiptSummary tbody').empty()
    $('#receiptSummary tfoot').empty()

    $('#voucherNumber').text('Voucher # ' + voucherNumber)
    $('#voucherDated').text('Dated: ' + moment().format('dddd, MMMM Do YYYY, h:mm:ss a'))
    $('#receiptDetails tbody').append(`
        <tr>
            <td>GR #</td>
            <th>` + studentDetails.GRNumber + `</th>
        </tr>
        <tr>
            <td>Name</td>
            <th>` + studentDetails.StudentsName + `</th>
        </tr>
        <tr>
            <td>Fater's name</td>
            <th>` + studentDetails.FatherName + `</th>
        </tr>
        <tr>
            <td>Class</td>
            <th>` + classesList.find(item => item.ClassID == studentDetails.PresentClass).ClassName + `</th>
        </tr>
    `)

    $('#paymentSummary tbody').append(`
        <tr>
            <td width="170px">Payable amount</td>
            <th>PKR ` + payableAmount + `</th>
        </tr>
        <tr>
            <td>Received amount</td>
            <th>PKR ` + (payableAmount - discount) + ` by ` + operatorName + `</th>
        </tr>
    `)

    $('#payForMonth').val().forEach(function(month) {
        $('#receiptSummary tbody').append(`
            <tr>
                <td width="170px">` + month + `</td>
                <th>PKR ` + feeDetails.filter(item => item.FeeType == '1' && item.ClassID == studentDetails.PresentClass).map(item => item.Amount)[0] + `</th>
            </tr>
        `)
    });
  
    $('#otherCharges').val().forEach(function(feeType) {
        $('#receiptSummary tbody').append(`
            <tr>
                <td width="170px">` + feeTypes.find(item => item.ID == feeType).Title + `</td>
                <th>PKR ` + feeDetails.filter(item => item.FeeType == feeType && item.ClassID == studentDetails.PresentClass).map(item => item.Amount)[0] + `</th>
            </tr>
        `)
    });
    
    if ($('#fineAmount').val() != "" && $('#fineAmount').val() != 0) {
        $('#receiptSummary tbody').append(`
            <tr>
                <td width="170px">Fine</td>
                <th>PKR ` + $('#fineAmount').val() + `</th>
            </tr>
        `)
    }

    if (discount !== 0) {
        $('#receiptSummary tbody').append(`
            <tr>
                <td width="170px">Waived</td>
                <th>(PKR ` + discount + `)</th>
            </tr>
        `)
    }

    $('#receiptSummary tfoot').append(`
        <tr>
            <td width="170px">Total amount</td>
            <th>PKR ` + payableAmount + `</th>
        </tr>
    `)

    if (window.innerWidth >= 1024) {
        $('.receiptContainer').modal('show');
    }
    else{
        $('#printRecipt').click()
    }
}

$('#academicSessions').change(function() {
    getFeeBySession()
});

function reset(){
    discount = 0;
    fine = 0;
    $('.editor').show()
    $('#payableAmount').show()
    $('.reset').hide()
    $('.discountedPayableAmount').hide()
    $('#payForMonth').val([]).trigger('change');
    $('#otherCharges').val([]).trigger('change');
    $('#fineAmount').val(0);
}

$('#searchFeeHistoryByGRForm').submit(function(e){
    reset()
    e.preventDefault();
    if(document.getElementById('searchFeeHistoryByGRForm').checkValidity() !== false){
        $('#searchFeeHistoryByGRForm').block();
        $.ajax({
            url: './getStudentDataByGR',
            type: 'POST',
            data: $('#searchFeeHistoryByGRForm').serialize(),
            success: function(data) {
                if(data.length > 0){
                    studentDetails = data[0]
                    $('.studentsBioData tbody').empty()
                    $('.studentsBioData tbody').append(`
                            <tr>
                            <td colspan="2">
                                <img src="../../assets/images/profilePictures/` + data[0].Image + `" class="img img-fluid" width="120" draggable="false">
                            </td>
                        </tr>
                        <tr>
                            <td>GR number</td>
                            <th>` + data[0].GRNumber + `</th>
                        </tr>
                        <tr>
                            <td>Student's name</td>
                            <th>` + data[0].StudentsName + `</th>
                        </tr>
                        <tr>
                            <td>Father's name</td>
                            <th>` + data[0].FatherName + `</th>
                        </tr>
                        <tr>
                            <td>Present class</td>
                            <th>` + classesList.find(item => item.ClassID == data[0].PresentClass).ClassName + `</th>
                        </tr>
                    `)

                    $.ajax({
                        url: './searchFeeHistoryByGR',
                        type: 'POST',
                        data: $('#searchFeeHistoryByGRForm').serialize(),
                        success: function(data) {
                            let remainingMonths = feeMonths, remainingFeeTypes = feeTypes;
                            $('#monthFeeStatus tbody').empty()
                            $('#otherChargesHistory tbody').empty()
                            data.forEach(element => {
                                JSON.parse(element.PaidFor).forEach(element1 => {
                                    if(element1.FeeType == 1){
                                        var voucherType = ['text-primary', 'Paid'];
                                        if(element.ReceivedAmount == 0){
                                            var voucherType = ['text-muted', 'Waived'];
                                        }
                                        $('#monthFeeStatus tbody').append(`
                                            <tr>
                                                <td>` + element1.Month + `</td>
                                                <th class="` + voucherType[0] + `">` + voucherType[1] + `</th>
                                                <td>V# ` + element.VoucherNumber + `</td>
                                            </tr>
                                        `)
                                        remainingMonths = remainingMonths.filter(m => !element1.Month.includes(m));
                                    }
                                    else{
                                        var voucherType = ['text-primary', 'Paid'];
                                        if(element.ReceivedAmount == 0){
                                            var voucherType = ['text-muted', 'Waived'];
                                        }
                                        var chargesTitle = feeTypes.find(item => item.ID == element1.FeeType)?.Title;
                                        if (element1.FeeType == 70){
                                            chargesTitle = 'Late Fine';
                                        }
                                        $('#otherChargesHistory tbody').append(`
                                            <tr>
                                                <td>` + chargesTitle + `</td>
                                                <th class="` + voucherType[0] + `">` + voucherType[1] + `</th>
                                                <td>V# ` + element.VoucherNumber + `</td>
                                            </tr>
                                        `)
                                        remainingFeeTypes = remainingFeeTypes.filter(item => item.ID !== element1.FeeType && item.ID !== '1');
                                    }
                                });
                            });
            
                            $('#payForMonth').empty()
                            remainingMonths.forEach(element => {
                                $('#payForMonth').append('<option value="' + element + '">' + element + '</option>')
                                $('#monthFeeStatus tbody').append(`
                                    <tr>
                                        <td>` + element + `</td>
                                        <th class="text-danger">Unpaid</th>
                                        <td></td>
                                    </tr>
                                `)
                            });
            
                            $('#otherCharges').empty()
                            remainingFeeTypes.forEach(element => {
                                if(element.ID != 1){
                                    $('#otherCharges').append('<option value="' + element.ID + '">' + element.Title + '</option>')
                                    $('#otherChargesHistory tbody').append(`
                                        <tr>
                                            <td>` + element.Title + `</td>
                                            <th class="text-danger">Unpaid</th>
                                            <td></td>
                                        </tr>
                                    `)
                                }
                            });
            
                            $('#payForMonth').select2({
                                multiple: true
                            })
            
                            $('#otherCharges').select2({
                                multiple: true
                            })
                        }
                    });
                    // $('.editor').toggle()
                }
                else{
                    $('.noRecordPopup').modal('show');
                }
                $('#searchFeeHistoryByGRForm').block({timeout: 0.1});
            }
        });
    }
})

var payableAmount = 0, monthlyFee = 0, otherCharges = 0, fine = 0, discount = 0;
$('#payForMonth').change(function(){
    monthlyFee = $('#payForMonth').val().length * feeDetails.filter(item => item.FeeType == '1' && item.ClassID == studentDetails.PresentClass).map(item => item.Amount);
    calculateFee()
})

$('#otherCharges').change(function(){
    otherCharges = 0
    $('#otherCharges').val().forEach(element => {
        otherCharges += feeDetails.filter(item => item.FeeType == element && item.ClassID == studentDetails.PresentClass).map(item => item.Amount);
    });
    calculateFee()
})

$('#fineAmount').keyup(function(){
    fine = $('#fineAmount').val()
    calculateFee()
})

function calculateFee(){
    payableAmount = Number(monthlyFee) + Number(otherCharges) + Number(fine) - Number(discount);
    $('#payableAmount').text('PKR ' + payableAmount)
}

function resetPayableAmount(){
    discount = 0
    calculateFee()
    if ($('.reset:visible').length > 0){
        $('.reset').toggle()
    }
    if ($('.discountedPayableAmount:visible').length > 0){
        $('.discountedPayableAmount').toggle()
        $('#payableAmount').toggle()
    }
    $('.editor').toggle()
}

function editPayableAmount(){
    $('.discountedPayableAmount').toggle()
    $('#payableAmount').toggle()

    if ($('.discountedPayableAmount:visible').length > 0) {
        $('.editor').toggle()
        $('.discountedPayableAmount').val(payableAmount);
        $('.discountedPayableAmount:visible').focus();
    }
    else {
        discount = payableAmount - Number($('.discountedPayableAmount').val())
        calculateFee()
        $('.reset').toggle()
    }
}

$('.discountedPayableAmount').blur(function(){
    if ($('.discountedPayableAmount:visible').length > 0) {
        if($('.discountedPayableAmount').val() != payableAmount){
            editPayableAmount()
        }
        else{
            resetPayableAmount()
        }
    }
})

$('.discountedPayableAmount').keyup(function(e){
    if (e.keyCode === 27) {
        resetPayableAmount()
    }
    else if(e.keyCode === 13){
        if($('.discountedPayableAmount').val() != payableAmount){
            editPayableAmount()
        }
        else{
            resetPayableAmount()
        }
    }
})

// const editPayableAmount = () => {
//     const showPayableAmount = $('#payableAmount');
//     const amountInput = $('<input>').attr({
//       type: 'number',
//       value: payableAmount,
//       class: `form-control-sm ${showPayableAmount.attr('class')}`
//     });
  
//     showPayableAmount.replaceWith(amountInput);
//     $('.editor').toggleClass('d-none');
//     amountInput.focus();
  
//     const replaceInputElementWithSpan = () => {
//       const discount = payableAmount - amountInput.val();
//       const newAmountText = `PKR ${amountInput.val()}`;
//       const newPayableAmount = $('<b>').attr({
//         id: 'payableAmount',
//         class: amountInput.attr('class').replace('form-control-sm', '')
//       }).html(newAmountText);
  
//       amountInput.replaceWith(newPayableAmount);
//       calculateFee();
//       $('.editor').toggleClass('d-none');
//     };
  
//     amountInput.on('blur', replaceInputElementWithSpan);
//     amountInput.on('keyup', event => {
//       if (event.keyCode === 13 || event.keyCode === 27) {
//         amountInput.val('0');
//         replaceInputElementWithSpan();
//       }
//     });
// };

$("#printRecipt").click(function(){
    var printOptions = {
        mode: 'iframe',
        standard: 'html5',
        paperWidth: '210mm',
        paperHeight: '297mm',
        styles: [
            {
                href: "../../assets/css/voucher-print.css",
                media: "print"
            }
        ]
    };

    $(".voucher-body").printArea(printOptions);
});

$("#saveReceipt").click(function(){
    
});

$('select').select2();