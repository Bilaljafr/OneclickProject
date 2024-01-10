setupProfile()
var profileData = '';
function setupProfile(){
    $.ajax({
        url: '/general/getProfileDetails',
        type: 'GET',
        success: function(data) {
            profileData = data;
            $('#profile-picture').attr("src", "../assets/images/profilePictures/" + data.profilePicture);
            $('.profile-name').empty()
            $('.profile-name').html(
                `<h3>${data.Name}</h3>
                <span>Member of ${data.InstituteName}</span>`
            )
    
            $('.details').empty()
            $('.details').html(
                `
                <h6 class="pb-2">Bio data</h6>
                <ul class="list-unstyled profile-about-list pb-4">
                    <li><i class="material-icons">person</i><span>${data.Name}</span></li>
                    <li><i class="material-icons">info</i><span>${data.FatherName}</span></li>
                    <li><i class="material-icons">favorite</i><span>${data.MaritalStatus}</span></li>
                    <li><i class="material-icons">perm_contact_calender</i><span>Date of birth: ${moment(data.DateOfBirth).format('dddd, DD MMMM yyyy')}</span></li>
                </ul>
                <hr>
    
                <h6 class="pb-2 pt-4">Contact details</h6>
                <ul class="list-unstyled profile-about-list pb-4">
                    <li><i class="material-icons">email</i><span>${data.UserEmail}</span></li>
                    <li><i class="material-icons">home</i><span>${data.ResidentialAddress}</span></li>
                    <li><i class="material-icons">local_phone</i><span>+92 ${data.ContactNumber}</span></li>
                </ul>
                <hr>
    
                <h6 class="pb-2 pt-4">Employment details</h6>
                <ul class="list-unstyled profile-about-list pb-4">
                    <li><i class="material-icons">date_range</i><span>Appointed on ${data.Type === 'Student' ? moment(data.DateOfAdmission).format('dddd, DD MMMM yyyy') : moment(data.AppointmentDate).format('dddd, DD MMMM yyyy')}</span></li>
                    <li><i class="material-icons">badge</i><span>Designation: ${data.Type === 'Student' ? 'Student' : data.Designation}</span></li>
                </ul>
                `
            )
            if(data.Type != "Student"){
                
            }
            else{

            }
        }
    });
}

$('#updateProfile').click(function(){
    $('#staffName').val(profileData.Name);
    $('#fatherName').val(profileData.FatherName);
    $('#cnicNumber').val(profileData.CNIC);
    $('#cityOfBirth').val(profileData.CityOfBirth);
    $('#contactNumber').val(profileData.ContactNumber);
    $('#email').val(profileData.UserEmail);
    $('#residentialAddress').val(profileData.ResidentialAddress);
    $('input[name="gender"][value="' + profileData.Gender + '"]').prop('checked', true);
    $('#dateOfBirth').val(moment(profileData.DateOfBirth).format('YYYY-MM-DD'));
    $('#qualification').val(profileData.Qualification);
    $('#nationality').val(profileData.Nationality);
    $('#religion').val(profileData.Religion);
    $('#motherTongue').val(profileData.MotherTongue);
    $('#maritalStatus').val(profileData.MaritalStatus).select2().trigger('change');
    $('#profileType').val(profileData.Type);

    $('.editProfilePopup').modal('show')
})

$('#upadteProfileForm').submit(function(e){
    $('#upadteProfileForm').block()
    e.preventDefault()
    if(document.getElementById('upadteProfileForm').checkValidity() !== false){
        $.ajax({
            url: '/general/updateProfileDetails',
            type: 'POST',
            data: $('#upadteProfileForm').serialize(),
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated profile. Please relogin to load changes.', 'success');
                    setupProfile()
                    $('.editProfilePopup').modal('hide')
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#upadteProfileForm').block({timeout: 0.1})
            }
        })
    }
})

$('#updatePassword').click(function(){
    $('.updateProfilePopup').modal('show')
})

$('#upadtePasswordForm').submit(function(e){
    e.preventDefault()
    if(document.getElementById('upadtePasswordForm').checkValidity() !== false){
        if($('#currnetPassword').val() == profileData.UserPassword){
            $('#upadtePasswordForm').block()
            $.ajax({
                url: '/general/updatePassword',
                type: 'POST',
                data: {'password': $('#newPassword').val()},
                success: function(data) {
                    if(data == 'Success'){
                        triggerAlert('Successfully updated password.', 'success');
                        $('.updateProfilePopup').modal('hide')
                    }
                    else{
                        triggerAlert(data, 'error');
                    }
                    $('#upadtePasswordForm').block({timeout: 0.1})
                }
            })
        }
        else{
            triggerAlert("Your current password doesn't match your entered password.", 'error');
        }
    }
})

$('#reEnterNewPassword').on('keyup', function() {
    if($('#newPassword').val() != $('#reEnterNewPassword').val()){
        $('#passwordMatch').html("Password doesn't match.")
    }
    else{
        $('#passwordMatch').html("")
    }
})

$('#newPassword').on('keyup', function() {
    var password = $('#newPassword');
    var progressBar = $('.progress-bar');

    password.on('keyup', function() {
        var strength = 0;
        var maxLength = 100;

        var length = password.val().length;
        var upperCase = /[A-Z]/.test(password.val());
        var lowerCase = /[a-z]/.test(password.val());
        var numbers = /[0-9]/.test(password.val());
        var specialChars = /[^\w]/.test(password.val());

        if (length >= 8 && upperCase && lowerCase && numbers && specialChars) {
            strength = 100;
        }
        else {
            if (length >= 8) {
                strength += 25;
            }
            if (upperCase) {
                strength += 25;
            }
            if (lowerCase) {
                strength += 25;
            }
            if (numbers) {
                strength += 25;
            }
        }

        progressBar.css('width', strength + '%');
        progressBar.attr('aria-valuenow', strength);
        progressBar.removeClass().addClass('progress-bar');

        if (strength === 100) {
            progressBar.addClass('bg-progress-success');
        }
        else if (strength >= 75) {
            progressBar.addClass('bg-info');
        }
        else if (strength >= 50) {
            progressBar.addClass('bg-warning');
        }
        else {
            progressBar.addClass('bg-danger');
        }
    });
})

// Initialize tooltip
$('#password-strength').tooltip({ placement: 'right' });

// pic working
$('.camera-icon').click(function(){
    $('#new-dp').click()
})

var croppie = null;
var el = document.getElementById('preview');

$('#new-dp').on('change', function () {
    if (this.files && this.files[0]) {
        $('.editProfilePicturePopup').modal('show')
        var reader = new FileReader();
        reader.onload = function (e) {
            if (croppie) {
                croppie.destroy();
            }
            croppie = new Croppie(el, {
                viewport: {
                    width: 300,
                    height: 300,
                    type: 'circle'
                },
                boundary: {
                    width: 300,
                    height: 300
                },
                enableOrientation: true
            });
            croppie.bind({
                url: e.target.result
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$('#crop').on('click', function() {
    $('#crop').block()
    croppie.result('blob').then(function(blob) {
        var formData = new FormData();
        formData.append('new-dp', blob);
        $.ajax({
            url: '/general/uploadDP',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if(data == 'Success'){
                    var url = URL.createObjectURL(blob);
                    $('#profile-picture').attr('src', url);
                    $('#navbarDropdown img').attr('src', url);
                    $('.editProfilePicturePopup').modal('hide');
                    triggerAlert('Successfully updated profile picture.', 'success');
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#crop').block({timeout: 0.1})
            }
        });
    });
});

$('#maritalStatus').select2()