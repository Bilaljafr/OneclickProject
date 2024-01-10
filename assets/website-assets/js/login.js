$(document).ready(function() {
    $('#loginForm').submit(function(event) {
      event.preventDefault();
      var emailAddress = $('#emailAddress').val();
      var password = $('#password').val();
  
      $.ajax({
        url: '/login',
        type: 'POST',
        data: {
          emailAddress: emailAddress,
          password: password
        },
        success: function(response) {
          console.log(response);
          alert('Login successful!');
          window.location.href = '../././views/administrator/index.html';
        },
        error: function(error) {
          console.log(error);
          alert('Login failed!');
        }
      });
    });
});
  