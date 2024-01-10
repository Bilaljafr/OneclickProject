$('#cardHolderName').on('input', function() {
    let cardholderName = $(this).val();

    if (validateCardholderName(cardholderName)) {
        // Valid cardholder name, remove red border
        $(this).removeClass('is-invalid');
    }
    else {
        // Invalid cardholder name, add red border
        $(this).addClass('is-invalid');
    }
});

$('#cardNumber').on('input', function() {
    let cardNumber = $(this).val();
    cardNumber = formatCardNumber(cardNumber);
    $(this).val(cardNumber);

    if (validateCardNumber(cardNumber)) {
        $(this).removeClass('is-invalid');
    }
    else {
        $(this).addClass('is-invalid');
    }
});

$('#expirationMonth').on('input', function() {
    let expirationDate = $(this).val();
    if (validateExpirationMonth(expirationDate)) {
      // Valid expiration date, remove red border
      $(this).removeClass('is-invalid');
    }
    else {
      // Invalid expiration date, add red border
      $(this).addClass('is-invalid');
    }
});

$('#expirationYear').on('input', function() {
    let expirationDate = $(this).val();
    if (validateExpirationYear(expirationDate)) {
      // Valid expiration date, remove red border
      $(this).removeClass('is-invalid');
    }
    else {
      // Invalid expiration date, add red border
      $(this).addClass('is-invalid');
    }
});

$('#cvv').on('input', function() {
    let cvv = $(this).val();
    if (validateCVV(cvv)) {
        $(this).removeClass('is-invalid');
    }
    else {
        $(this).addClass('is-invalid');
    }
});

function validateCardholderName(cardholderName) {
    // Use a regular expression to check for a valid name format (letters and spaces only)
    return /^[a-zA-Z\s]+$/.test(cardholderName);
}

function validateCardNumber(cardNumber) {
    // Basic Luhn algorithm validation (you can use a more comprehensive library for this)
    // For simplicity, we'll check if the length is 16 characters
    return cardNumber.length === 16;
}

function formatCardNumber(cardNumber) {
    // Remove any non-numeric characters
    cardNumber = cardNumber.replace(/\D/g, '');

    // Add dashes every 4 characters
    cardNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1-');

    return cardNumber;
}

function validateExpirationMonth(month) {
    // Check if the month is a valid number between 1 and 12
    if (isNaN(month) || parseInt(month) < 1 || parseInt(month) > 12) {
        return false; // Invalid month
    }
    // The month is valid
    return true;
  }
  
function validateExpirationYear(year) {
    // Get the current year
    const currentYear = new Date().getFullYear();
  
    // Check if the year is a valid number and not less than the current year
    if (isNaN(year) || parseInt(year) < currentYear) {
        return false; // Invalid year
    }
    // The year is valid
    return true;
}

// Function to validate CVV (in this example, we'll check for a 3-digit CVV)
function validateCVV(cvv) {
    return /^\d{3}$/.test(cvv);
}