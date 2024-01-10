var preFilledData = '';
if(localStorage.getItem('carInsuranceformData')){
    preFilledData = JSON.parse(localStorage.getItem('carInsuranceformData'));
    $('#car-make').text(preFilledData.carMake);
    $('#car-model').text(preFilledData.model);
    $('#car-year').text(preFilledData.year);
    $('#market-value').text(preFilledData.price);

    $.ajax({
        url: '/getCarInsuranceOffers', 
        type: 'POST',
        data: {'insuranceID': preFilledData.insuranceType},
        success: function(response) {
            var counter = 0;
            $('.quotation-table tbody').empty();
            response.forEach(element => {
                var exclusive = '';
                if(element.IsExclusive == 'Yes'){
                    exclusive = '<img src="../../assets/images/exclusive-offer.png" alt="Exclusive Offer" class="corner-image" draggable="false">';
                }
                $('#offers-container').append(`
                    <div class="row offer-card mb-5" id="container-for-${element.InsuranceCompanyID}">
                        ${exclusive}
                        <div class="col-auto text-center aggregate-container">
                            <img src="../../assets/images/aggregates/${element.Logo}" class="card-img img-fluid rounded mb-4" style="max-width: 128px;" draggable="false">
                            <div class="row">
                                <div class="col">
                                    <a href="tel:03195995775" class="btn btn-transparent call-button blue-border">
                                        <span class="call-icon">
                                            <i class="fa fa-solid fa-headphones"></i>
                                        </span>
                                        <span class="call-text">Call</span>
                                        <span class="phone-number">+92 319 599 5775</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm">
                            <h6 class="text-danger text-uppercase mt-3">Coverage</h6>
                            <ul class="coverage-list">
                                <li>Total Loss</li>
                                <li>Theft Cover</li>
                                <li>Accidental Damage</li>
                            </ul>
                            <span class="view-more-benefits" onclick="showBenefits()">View more ...</span>
                            <img src="../../assets/images/buy-now-button.png" class="buy-coverage-button" width="150" draggable="false" onclick="updateLead('${element.InsuranceCompanyID}');">
                        </div>
                        <div class="col-sm">
                            <div class="coverage-price-container mt-3">
                                <div class="coverage-price" id="total-price-for-${element.InsuranceCompanyID}">Total: Rs. ${Number((preFilledData.price.replace(/[^0-9]/g, '') * (element.Rate / 100)).toFixed(0)).toLocaleString()}<br><small>(Rate: ${element.Rate}%)</small></div>
                                <div class="coverage-duration d-none">Installment Plan: ${Number(((preFilledData.price.replace(/[^0-9]/g, '') * (element.Rate / 100)) / 6).toFixed(0)).toLocaleString()}/month </div>

                                <div class="btn-container text-center">
                                    <div class="slider-container">
                                        <input type="checkbox" id="toggle-btn-${element.InsuranceCompanyID}" onchange="addOrRemoveTracker(${element.InsuranceCompanyID}, '${element.Rate}')" class="slider">
                                        <label for="toggle-btn-${element.InsuranceCompanyID}" class="slider-label"></label>
                                    </div>
                                    <span class="slider-value">Add tracker</span>
                                    <span clas="tracker-price">Rs. 15,000</span>
                                    <small class="old-price">Rs. 18,000</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `)

                //quotion table
                $('.quotation-table').append(`
                    <tr>
                        <td class="align-middle">${(counter + 1)}</td>
                        <td class="align-middle">
                            <img src="../../assets/images/aggregates/${element.Logo}" class="card-img img-fluid rounded" style="max-width: 90px;" draggable="false">
                        </td>
                        <td class="align-middle">${element.Rate}%</td>
                        <td class="align-middle">
                            <b>Rs. ${Number((preFilledData.price.replace(/[^0-9]/g, '') * (element.Rate / 100)).toFixed(0)).toLocaleString()}</b>
                            <br>
                            <small class="premium-subtitle">Premium per year</small>
                        </td>
                    </tr>
                `);

                $('.append-coverage-details').append(`
                    <div class="coverage-details-container">
                        <div class="row align-items-center">
                            <div class="col">
                                <img src="../../assets/images/aggregates/${element.Logo}" class="card-img img-fluid rounded mb-3" style="max-width: 130px;" draggable="false">
                            </div>
                            <div class="col-auto text-right">
                                <h5 class="premium-offer-text">Rs. ${Number((preFilledData.price.replace(/[^0-9]/g, '') * (element.Rate / 100)).toFixed(0)).toLocaleString()}</h5>
                                <p class="premium-subtitle-lg">Premium / year</p>
                            </div>
                        </div>
                        <h6>Main Coverage</h6>
                        <div class="row align-items-center">
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="tick">Accident damages</li>
                                    <li class="tick">Fire</li>
                                    <li class="tick">Total loss</li>
                                </ul>
                            </div>
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="tick">Theft / Snatch</li>
                                    <li class="tick">Natural calamities</li>
                                    <li class="tick">Riots & Strike</li>
                                    
                                </ul>
                            </div>
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="tick">Terrorism</li>
                                    <li class="tick">Deductible</li>
                                    <li class="cross">No claim discount</li>
                                </ul>
                            </div>
                        </div>
            
                        <br>
                        <h6>Third-party Coverage</h6>
                        <div class="row">
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="tick">Property damages</li>
                                </ul>
                            </div>
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="cross">Emergency medical expenses</li>
                                </ul>
                            </div>
                            <div class="col">
                                <ul class="cover-details-list">
                                    <li class="cross">Death bodily injury</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `);
                counter++;
            });
            $('#plan-count').text(`Showing ${response.length} plans`);
            $('#offers-container').removeClass('loading');
        }
    });
}
else{
    window.location.href = '/car-insurance';
}

function addOrRemoveTracker(aggregateID, rate){
    var total = Number((preFilledData.price.replace(/[^0-9]/g, '') * (rate / 100)).toFixed(0)).toLocaleString();
    if($('#toggle-btn-' + aggregateID).prop('checked')){
        total = Number(((preFilledData.price.replace(/[^0-9]/g, '') * (rate / 100)) + 15000).toFixed(0)).toLocaleString();
    }
    $('#total-price-for-' + aggregateID).html(`Total: Rs. ${total}<br><small> (Rate: ${rate}%)</small>`)
}

function updateLead(aggregateID){
    preFilledData.aggregateID = aggregateID;
    preFilledData.addTracker = $('#toggle-btn-' + aggregateID).prop('checked');
    $('#container-for-' + aggregateID).addClass('loading');
    $.ajax({
        url: '/updateCarInsuranceLead',
        type: 'POST',
        data: preFilledData,
        success: function(response) {
            if(response == 'Success'){
                var payableAmount = Number($('#total-price-for-' + aggregateID).text().split(".")[1].replace(/[^\d]/g, "").slice(0, -1));
                $("#payableAmount").text(payableAmount.toLocaleString());
                $("#paymentModal").modal('show');
                // window.location.href = '/thank-you';
            }
            $('#container-for-' + aggregateID).removeClass('loading');
        }
    });


    //payment work
    // var payableAmount = Number($('#total-price-for-' + aggregateID).text().split(".")[1].replace(/[^\d]/g, "").slice(0, -1));
    // var jsonn = {
    //     "HS_ChannelId": "1002",
    //     "HS_MerchantId": "23550",
    //     "HS_StoreId": "031817",
    //     "HS_ReturnURL": "https://theoneclickdigital.com/thank-you",
    //     "HS_MerchantHash": "OUU362MB1uoEG9E7Ns1DrpxnRQdh+UIyEnOKpiOINpEeypXOuhqdnhvyEufqYsFu",
	//     "HS_MerchantUsername": "esazyd",
    //     "HS_MerchantPassword": "QaKylUuBlWBvFzk4yqF7CA==",
    //     "HS_TransactionReferenceNumber": "1",
    //     "HS_IsRedirectionRequest": "0"
    // }

    // // $('#AuthToken').val('')
    // // $('#RequestHash').val('')
    // $('#ChannelId').val('1002')
    // $('#MerchantId').val('23550')
    // $('#StoreId').val('031817')
    // $('#MerchantHash').val('OUU362MB1uoEG9E7Ns1DrpxnRQdh+UIyEnOKpiOINpEeypXOuhqdnhvyEufqYsFu')
    // $('#MerchantUsername').val('esazyd')
    // $('#MerchantPassword').val('QaKylUuBlWBvFzk4yqF7CA==')
    // $('#TransactionReferenceNumber').val('1')
    // $('#TransactionAmount').val(payableAmount)

    // var mapString = '', hashName = 'RequestHash';
    // $("#PageRedirectionForm :input").each(function () {
    //     if ($(this).attr('id') != '') {
    //         mapString += $(this).attr('id') + '=' + $(this).val() + '&';
    //     }
    // });

    // $("#" + hashName).val(CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(mapString.substr(0, mapString.length - 1)), CryptoJS.enc.Utf8.parse(""),
    //     {
    //         keySize: 128 / 8,
    //         iv: CryptoJS.enc.Utf8.parse(""), mode: CryptoJS.mode.CBC,
    //         padding: CryptoJS.pad.Pkcs7
    //     }
    // ));

    // $('#run').click();
}

$('.close-modal').click(function(){
    $("#paymentModal").modal('hide');
})

// sticky container work
const clientDetailsContainer = $(".client-details-container");
const clientDetailsContainerTop = clientDetailsContainer.offset().top;
$(window).scroll(function() {
    const scrollTop = $(window).scrollTop();
    const windowWidth = $(window).width();

    if (windowWidth >= 992 && scrollTop >= clientDetailsContainerTop) {
        clientDetailsContainer.addClass("sticky");
    }
    else {
        clientDetailsContainer.removeClass("sticky");
    }
});

function showBenefits() {
    var modal = document.getElementById("details-modal");
    modal.style.display = "flex";
}
  
function closeModal() {
    var modal = document.getElementById("details-modal");
    modal.style.display = "none";
}

$('#downloadQuotes').click(function(){
    $('#downloadQuotes').addClass('loading')
    $('#downloadQuotes').attr('disabled', true);;
    $('#wait-modal').css('display', 'flex');

    var clonedDiv = $('.client-details-container').clone();
    var elementsToExclude = clonedDiv.find('.edit-btn');
    elementsToExclude.remove();
    $(".client-details-container-quotation").empty();
    $(".client-details-container-quotation").append(clonedDiv);
    $(".quotecontainer").removeClass('d-none');

    var element = document.getElementById('quotecontainer');
    var opt = {
        // margin: 0,
        margin: [5, 5, 5, 5], //[top, left, bottom, right]
        filename: 'Quotation.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { dpi: 600, scale: 4 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.pageBreak' },
        // pagebreak: { before: '.pageBreak', after: ['#after1', '#after2'], avoid: 'img' }
    };

    html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
        var totalPages = pdf.internal.getNumberOfPages();
        var footerImg = new Image();
        footerImg.src = '"../../assets/website-assets/footer.jpg';
        for (i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
      
            var imgWidth = 198;
            var imgHeight = 18;
            pdf.addImage(footerImg, 'JPEG', 6, pdf.internal.pageSize.getHeight() - imgHeight - 6, imgWidth, imgHeight);
            pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.getWidth() - 160, pdf.internal.pageSize.getHeight() - 10);
            pdf.rect(5, 5, pdf.internal.pageSize.getWidth() - 10, pdf.internal.pageSize.getHeight() - 10, 'stroke');
        }

        pdf.save('Quotation.pdf');
        $('#downloadQuotes').removeClass('loading');
        $('#downloadQuotes').attr('disabled', false);
        $('#wait-modal').css('display', 'none');
        $(".quotecontainer").addClass('d-none');
    })

    // html2pdf().set(opt).from(element).save().then(function(){
    //     $('#downloadQuotes').removeClass('loading');
    //     $(".quotecontainer").addClass('d-none');
    // });
})

$('#payment-form').submit(function(e){
    e.preventDefault();
    var mapString = '', hashName = 'RequestHash';
    var jsonn = {
        "HS_ChannelId": "1001",
        "HS_MerchantId": "23550",
        "HS_StoreId": "031817",
        "HS_ReturnURL": "https://theoneclickdigital.com/get-authentication-token",
        "HS_MerchantHash": "OUU362MB1uoEG9E7Ns1DrpxnRQdh+UIyEnOKpiOINpEeypXOuhqdnhvyEufqYsFu",
	    "HS_MerchantUsername": "esazyd",
        "HS_MerchantPassword": "QaKylUuBlWBvFzk4yqF7CA==",
        "HS_TransactionReferenceNumber": "a1550",
        "HS_IsRedirectionRequest": "1"
    }

    for (const key in jsonn) {
        if (jsonn.hasOwnProperty(key)) {
            // Append each key-value pair to the query string
            mapString += `${key}=${encodeURIComponent(jsonn[key])}&`;
        }
    }
    mapString = mapString.slice(0, -1);

    hashName = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(mapString.substr(0, mapString.length - 1)),
        CryptoJS.enc.Utf8.parse('sdsadsadxzc'),
        {
            keySize: 128 / 8,
            iv: CryptoJS.enc.Utf8.parse('sljdshfui97'),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );      

    jsonn["HS_RequestHash"] = hashName.toString();

    $.ajax({
        url: 'https://sandbox.bankalfalah.com/HS/HS/HS',
        type: 'POST',
        data: jsonn,
        success: function(response) {
            console.log(response)
        }
    });

    // $.ajax({
    //     url: '/initiate-payment',
    //     type: 'POST',
    //     data: $('#payment-form').serialize()+ '&' + 'hashValue=' + mapString,
    //     success: function(response) {
    //         if(response == 'Success'){
    //             var payableAmount = Number($('#total-price-for-' + aggregateID).text().split(".")[1].replace(/[^\d]/g, "").slice(0, -1));
    //             $("#payableAmount").text(payableAmount.toLocaleString());
    //             $("#paymentModal").modal('show');
    //             // window.location.href = '/thank-you';
    //         }
    //         $('#container-for-' + aggregateID).removeClass('loading');
    //     }
    // });
})