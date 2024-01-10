$('#assesmentsExams').addClass('active-page')
$('#commenceExam').addClass('active')
getExams()

var profileDetails = ''
$.ajax({
	url: '/general/getProfileDetails',
	type: 'GET',
	success: function (data) {
		profileDetails = data;
	}
});

var exams= ''
function getExams(){
	$.ajax({
		url: '/exam-report/getExamsToAttempt',
		type: 'POST',
		data: {'dated': moment().format('YYYY-MM-DD')},
		success: function (data) {
			exams = data;
			if(data.length > 0){
				data.forEach(element => {
					$('#scheduledExams').append(`<option value="${element.ExamID}">${element.ExamTitle}</option>`)
				});
			}
			else{
				triggerAlert("No Exam is scheduled for today. Please check your system's date and time if you think this is an error.", 'error');
			}
		}
	});
}

$('#scheduledExams').change(function(){
	if($('#scheduledExams').val() != ''){
		$('#selectedExam').text($.grep(exams, function(e){ return e.ExamID == $('#scheduledExams').val(); })[0].ExamTitle)
		$('.confirmExamSelectionPopup').modal('show')
	}
})

var questions = '', totalQuestions = '', currentQuestion = 0;
$('#startExam').click(function(){
	$('#startExam').block()
	$.ajax({
		url: '/general/getQuestions',
		type: 'POST',
		data: {'examID': $('#scheduledExams').val()},
		success: function (data) {
			questions = data;
			totalQuestions = questions.length;
			$('.examCard').removeClass('d-none')
			updateQuestion();
			examTimer($.grep(exams, function(e){ return e.ExamID == $('#scheduledExams').val(); })[0].Duration)
			$('#startExam').block({timeout: 0.1})
			$('.confirmExamSelectionPopup').modal('hide')
			$('#scheduledExams').prop('disabled', true);
		}
	});
})

function updateQuestion() {
	var a = 1, hide = 'd-flex', questionNumber = 1;
	questions.forEach(question => {
		var options = '';
		JSON.parse(question.Question).options.forEach(function(option) {
			options += 
				`<div class="custom-control custom-radio">
					<input type="radio" class="custom-control-input" name="${question.ID}" id="${question.ID + `-` + option.text}" value="${option.text}">
					<label class="custom-control-label" for="${question.ID + `-` + option.text}">${option.text}</label>
				</div>`
			;
		});

		$("#questionsContainer").append(`
			<div class="${hide} flex-row question-${questionNumber}">
				<div class="mr-3">
					<p>Q # ${questionNumber}:</p>
				</div>
				<div class="d-flex flex-column align-items-start">
					<div class="mb-2">
						<p><b>${JSON.parse(question.Question).question}</b></p>
						${options}
					</div>
				</div>
			</div>
		`);
		a++;
		questionNumber++;
		if(a > 1){
			hide = 'd-none'
		}
	});
	$('.examTitle').text(`${currentQuestion + 1} of ${totalQuestions} questions.`)
	
	// var question = questions[currentQuestion];
    // var questionObj = JSON.parse(question.Question);
    // $("#question-text").text(questionObj.question);
    // $("#options-container").empty();
    // questionObj.options.forEach(function(option) {
    //     $("#options-container").append(`
	// 		<div class="custom-control custom-radio">
	// 			<input type="radio" class="custom-control-input" name="${question.ID}" id="${option.text}" value="${option.text}">
	// 			<label class="custom-control-label" for="${option.text}">${option.text}</label>
	// 		</div>
	// 	`);
    // });
}

function updateBtn(){
	$('.examTitle').text(`${currentQuestion + 1} of ${totalQuestions} questions.`)
	if((currentQuestion + 1) == totalQuestions){
        $("#next-button").text("Submit answers");
		// $("#next-button").attr('type', 'submit');
	}
	else if(currentQuestion == 0){
        $("#prev-button").prop("disabled", true);
	}
}

$("#next-button").click(function() {
	if($("#next-button").text() == 'Submit answers'){
		$('#examForm').submit()
		return false;
	}

    if ((currentQuestion + 1) < totalQuestions) {
		currentQuestion++;
		updateBtn();
		$('.question-' + (currentQuestion)).addClass('d-none').removeClass('d-flex')
		$('.question-' + (currentQuestion + 1)).addClass('d-flex').removeClass('d-none')
		$("#prev-button").prop('disabled', false)
    }
});

$("#prev-button").click(function() {
    if (currentQuestion > 0) {
		$('.question-' + (currentQuestion)).addClass('d-flex').removeClass('d-none')
		$('.question-' + (currentQuestion + 1)).addClass('d-none').removeClass('d-flex')
		currentQuestion--;
		updateBtn();
        $("#next-button").text("Next").attr('type', 'button');
    }
});

$('#examForm').submit(function(e){
	e.preventDefault()
	// console.log($('#examForm').serializeAll());
	let correctAnswersCount = 0, userScore = 0, maxPossibleScore = 0, answers = $('#examForm').serializeAll(), totalQuestions = questions.length;
	for (let i = 0; i < answers.length; i++) {
		const questionId = answers[i].name;
		const userAnswer = answers[i].value;
		const question = questions.find(q => q.ID == questionId);
		if (question && question.Answer == userAnswer) {
			correctAnswersCount++;
			userScore += question.Number;
		}
	}
	for (let i = 0; i < questions.length; i++) {
		maxPossibleScore += questions[i].Number;
	}
	$('.reportTable tbody').empty()
	$('.studentDetailsForReport').empty()
	$('.studentDetailsForReport').append(`
		<tr>
			<td>Name</td>
			<th>${profileDetails.StudentsName}</th>
		</tr>
		<tr>
			<td>Father's Name</td>
			<th>${profileDetails.FathersName}</th>
		</tr>
		<tr>
			<td>Class</td>
			<th>${profileDetails.PrsentClass}</th>
		</tr>
		<tr>
			<td>Test Status</td>
			<th>${(userScore * 100 / maxPossibleScore) >= 30 ? 'Pass' : 'Fail'}</th>
		</tr>
	`)
	$('.reportTable').append(`
		<tr>
			<th>Attempted questions</th>
			<td>${answers.length} out of ${totalQuestions}</td>
		</tr>
		<tr>
			<th>Wrong answers</th>
			<td>${totalQuestions - correctAnswersCount}</td>
		</tr>
		<tr>
			<th>Marks obtained</th>
			<td>${userScore} out of ${maxPossibleScore}</td>
		</tr>
		<tr>
			<th>Progress percentage</th>
			<td>${userScore * 100 / maxPossibleScore} %</td>
		</tr>
	`)
	generateReport()
	$('.resultPopup').modal('show')
	getExams()
})

// Serialize form data including hidden inputs
$.fn.serializeAll = function () {
	var data = $(this).serializeArray();
	$(':hidden', this).each(function () {
		if ($(this).closest('.d-none').length === 0) {
			data.push({
				name: $(this).attr('name'),
				value: $(this).val()
			});
		}
	});
	return data;
};

// generate reoport
function generateReport() {
    var reportContainer = $('#report-container');
    var totalQuestions = questions.length;
    var correctAnswers = 0;

    // Loop through each question and generate HTML
    for (var i = 0; i < totalQuestions; i++) {
        var question = questions[i];
        var answers = $('#examForm').serializeAll();
        var answer = answers.find(function(a) { return a.name == question.ID.toString(); });
        var isCorrect = (answer.value == question.Answer);

        // Create Question and Answer HTML
        var questionHtml = '<div>' + JSON.parse(question.Question).question + '</div>';
        var options = JSON.parse(question.Question).options;
        var optionsHtml = '';

        for (var j = 0; j < options.length; j++) {
            var option = options[j];
            var optionHtml = '<div style="color: ';
            if (isCorrect) {
                optionHtml += (option.text == answer.value ? 'green' : 'black');
            } else {
                optionHtml += (option.text == answer.value ? 'red' : (option.text == question.Answer ? 'green' : 'black'));
            }
            optionHtml += ';">';
            optionHtml += option.text + '</div>';
            optionsHtml += optionHtml;
        }

        // Append Question and Answer HTML to Report Container
        reportContainer.append('<div>' + questionHtml + optionsHtml + '</div>');

        // Increment correctAnswers count if answer is correct
        if (isCorrect) {
            correctAnswers++;
        }
    }

    // Show score
    var scoreHtml = '<div>Score: ' + correctAnswers + ' out of ' + totalQuestions + '</div>';
    reportContainer.prepend(scoreHtml);
}

function generateReport() {
    var reportContainer = $('#report-container');
    var totalQuestions = questions.length;
    var correctAnswers = 0;

    // Loop through each question and generate HTML
    for (var i = 0; i < totalQuestions; i++) {
        var question = questions[i];
        var answers = $('#examForm').serializeAll();
        var answer = answers.find(function(a) { return a.name == question.ID.toString(); });
        var isCorrect = answer && (answer.value == question.Answer);

        // Create Question and Answer HTML
        var questionHtml = '<div class="question">' + JSON.parse(question.Question).question;
        if (!answer || answer.value === undefined || answer.value === '') {
            questionHtml += ' (didn\'t attempt)';
        }
        questionHtml += '</div>';

        var options = JSON.parse(question.Question).options;
        var optionsHtml = '<div class="options">';

        for (var j = 0; j < options.length; j++) {
            var option = options[j];
            var optionHtml = '<div class="option" style="color: ';
            if (isCorrect) {
				optionHtml += (answer && answer.value && option.text == answer.value ? 'green' : 'black');
			} else {
				optionHtml += (answer && answer.value && option.text == answer.value ? 'red' : (option.text == question.Answer ? 'green' : 'black'));
			}
            optionHtml += ';">';
            // optionHtml += '<span class="option-marker">' + option.marker + '</span>';
            optionHtml += option.text + '</div>';
            optionsHtml += optionHtml;
        }

        optionsHtml += '</div>';

        // Append Question and Answer HTML to Report Container
        reportContainer.append('<div class="question-container">' + questionHtml + optionsHtml + '</div>');

        // Increment correctAnswers count if answer is correct
        if (isCorrect) {
            correctAnswers++;
        }
    }

    // Show score
    var scoreHtml = '<div class="score">Answer details</div>';
    // var scoreHtml = '<div class="score">Score: ' + correctAnswers + ' out of ' + totalQuestions + '</div>';
    reportContainer.prepend(scoreHtml);
	reportContainer.append('<br><br><br><p><span style="color: green">Green</span> color indicates <b>correct answer</b>.<br><span style="color: red">Red</span> color indicates <b>wrong answer</b>.</p><br>');


    // Add some additional styling to the report
    reportContainer.find('.question-container').css({
        'padding': '10px',
        'border': '1px solid #ccc',
        'margin-bottom': '20px'
    });
    reportContainer.find('.question').css({
        'font-weight': 'bold',
        'margin-bottom': '10px'
    });
    reportContainer.find('.options').css({
        'margin-left': '20px'
    });
    reportContainer.find('.option').css({
        'margin-bottom': '5px'
    });
    reportContainer.find('.option-marker').css({
        'margin-right': '10px'
    });
    reportContainer.find('.score').css({
        'font-size': '20px',
        'font-weight': 'bold',
        'margin-bottom': '20px',
        'margin-top': '20px'
    });
}

// Download report as PDF on button click
$('#printReport').click(function(e) {
    var divToPrint = $(".printReport").clone(); // Clone the div element to preserve the original content
	var printContents = `
	<html>
		<head>
			<link href="https://fonts.googleapis.com/css?family=Lato:400,700,900&display=swap" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,700&display=swap" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp" rel="stylesheet">
			<link href="../../assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet">
			<link href="../../assets/plugins/font-awesome/css/all.css" rel="stylesheet">
			<link href="../../assets/plugins/DataTables/datatables.css" rel="stylesheet">
			<link href="../../assets/plugins/select2/css/select2.css" rel="stylesheet">

			<style>
			@page {
				margin: 0.4in; /* Set the margin to your desired value, e.g., 1cm */
			}
			@media print {
				body {width: 100%; min-width: 900px; margin: 0 auto; border: 1px solid gray; border-radius: 10px; padding-left: 15px; padding-right: 15px; padding-top: 15px;}
				#report-container{display: block !important; margin-top: 800px;}
			}
			</style>
		</head>
		<body>
			<div class="my-div">${divToPrint.html()}</div>
			<script type="text/javascript">
				window.onload = function() {
					window.print(); // Print the contents of the current tab
					window.close(); // Close the current tab after printing
				};
			</script>
		</body>
	</html>
`;

var newTab = window.open('about:blank');
	newTab.document.open();
	newTab.document.write(printContents);
	newTab.document.close();
});

function examTimer(durationInMinutes) {
	var durationInSeconds = durationInMinutes * 60;
	var interval = setInterval(function() {
		durationInSeconds--;
		var remainingTime = moment.duration(durationInSeconds, 'seconds');
		var hours = remainingTime.hours();
		var minutes = remainingTime.minutes();
		var seconds = remainingTime.seconds();
		var remainingTimeString = '';
		
		if (hours > 0) {
			remainingTimeString += hours + ' ' + (hours > 1 ? 'hours' : 'hour') + ' ';
		}
		if (minutes > 0) {
			remainingTimeString += minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute') + ' ';
		}
		if (seconds > 0) {
			remainingTimeString += seconds + ' ' + (seconds > 1 ? 'seconds' : 'second') + ' ';
		}
		
		$('.examTimer').text(remainingTimeString + 'remaining');
		
		if (durationInSeconds === 0) {
			clearInterval(interval);
			$('#scheduledExams').prop('disabled', true);
			$('.examTimer').text('Time is up!');
		}
	}, 1000);
}

$('#scheduledExams').select2()