'use strict';

// $('#payment_container').height('100vh');
// Create a Stripe client
var stripe = Stripe('pk_live_PD10EuhKLo91eRWOevLRoI2R');
// var stripe = Stripe('pk_test_S3iQLST5VjixcXyPPfcsAJOa');

// Create an instance of Elements
var elements = stripe.elements({locale:'en'});

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '20px',
    '::placeholder': {
      color: '#aab7c4'
    },
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
// var form = document.getElementById('payment-form');
// form.addEventListener('submit', function(event) {
$('#paymentRegistration').click(function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  // var form = document.getElementById('payment-form');
  // var hiddenInput = document.createElement('input');
  // hiddenInput.setAttribute('type', 'hidden');
  // hiddenInput.setAttribute('name', 'stripeToken');
  // hiddenInput.setAttribute('value', token.id);
  // form.appendChild(hiddenInput);
  //// Submit the form
  // form.submit();
  var formData =
  {
      'user_id' : localStorage.user_id,
      'hash' : localStorage.hash,
      'stripeToken' : token.id,
  };
  $.ajax({
      url  : ENDPOINT+"Organizer/PaymentRegistration.php",
      type : "POST",
      data : formData,
      dataType    : "json",
      beforeSend: function (xhr, setting) {
        $('button').attr('disabled', true);
        $('#main_loading').show();
    },
    complete: function (xhr, textStatus) {
        $('button').attr('disabled', false);
        $('#main_loading').hide();
    },
  })
  .done(function(data, textStatus, jqXHR){
      if(!isset(data['error_message'])){
          alert('You have successfully registered for the payment method.')
          localStorage.setItem('customer_id',data['customer_id']);
          return false;
      }
      else{
          alert(data['error_message']);
          return false;
      }
  })
  .fail(function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
      return false;
  });
}
