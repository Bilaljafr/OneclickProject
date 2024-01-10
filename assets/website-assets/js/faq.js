function toggleSection(sectionId) {
	const section = document.getElementById(sectionId);
	section.classList.toggle("show");
}

$('#general-faq').click(function(){
	$('#general-faq-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#bike-insurance').click(function(){
	$('#bike-faq-section').fadeIn(500);

	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#car-insurance').click(function(){
	$('#car-insurance-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#health-insurance').click(function(){
	$('#health-insurance-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#life-insurance').click(function(){
	$('#life-insurance-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#travel-insurance').click(function(){
	$('#travel-insurance-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#braodband').click(function(){
	$('#braodband-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#credit-card-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})

$('#credit-card').click(function(){
	$('#credit-card-section').fadeIn(500);

	$('#bike-faq-section').fadeOut(500);
	$('#general-faq-section').fadeOut(500);
	$('#car-insurance-section').fadeOut(500);
	$('#health-insurance-section').fadeOut(500);
	$('#life-insurance-section').fadeOut(500);
	$('#travel-insurance-section').fadeOut(500);
	$('#braodband-section').fadeOut(500);

	$('.nav-link').removeClass('nav-link-active');
    $(this).addClass('nav-link-active');
})