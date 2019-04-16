var problems = null;
var currentProblem = 0;
var currentSuggestion = 0;
var state = 'start';

var startTime = null;

$(document).ready(function(){
	setup()
});

function setup(){
	
	//once user uploads file, much of the site becomes operational (see parseLogs method)
	document.getElementById("file_upload").addEventListener("change", parseProblems, false);
	
	//adding simple key shortcuts to common operations
	$(document).keydown(function(e) {
		//only apply shortcut if not in text input field
		if (!((e.target.nodeName == 'INPUT' && e.target.type == 'text')|| e.target.nodeName == 'TEXTAREA')){
			switch(e.which) {
				case 37: // left
				if(state=='middle'){
					turn('left','problem');					
				} else if(state=='end' && problems!=null){
					showInner();
				}
				break;

				case 39: // right
				if(state=='middle'){
					turn('right','problem');
				} else if(state=='start' && problems!=null){
					showInner();
				}
				break;
				
				case 68: // d
				//toggleCheckbox("encounter",true);
				break;
				
				case 65: // a
				toggleCheckbox("recognize",true);
				break;
				
				case 83: // s
				//toggleCheckbox("helpful",true);
				break;
				
				case 89: // y
				//toggleCheckbox("suggest",true);
				break;
				
				case 73: // i
				//toggleCheckbox("want",true);
				break;
				
				case 219: // [
				turn("left", "suggestion");
				break;
				
				case 221: // ]
				turn("right", "suggestion");
				break;
				
				case 48: // 0 
				updateRating("null");
				break;
				
				case 49: // 1
				updateRating("1");
				break;
				
				case 50: // 2
				updateRating("2");
				break;
				
				case 51: // 3
				updateRating("3");
				break;
				
				case 52: // 4
				updateRating("4");
				break;
				
				case 53: // 5
				updateRating("5");
				break;
				
				default: return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		}
	});
	
	$('#inner').hide();
	$('#outer_questions').hide();
	
	//used for stylizing code
	hljs.initHighlightingOnLoad();
}


function parseProblems(){
	var file = this.files;
	if(file != null && file.length > 0){
		file = file[0];
		current_filename = file['name'];
		//console.log(file);
		const reader = new FileReader()
		reader.onload = function(event) {
			startTime = Date.now()
			problems = JSON.parse(reader.result);
			console.log(problems);
			
			initilizeSurveyObject();
			
			initilizeControls();
			
			currentProblem = 0;
			currentSuggestion = 0;
			
			populateView();
			
			showOuter('start');
		};
		reader.readAsText(file);
		
	} else {
		console.log('failed to parse file: '+file);
	}
}

function initilizeSurveyObject(){
	if(problems != null){
		if(problems['survey']==null){
			problems['survey'] = {
				'start': {
					'personal': {
						'role':null,
						'python':null,
						'sql':null
					},
					'preference': {
						'instructor': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						},
						'student': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						},
						'industry': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						}
					}
				},
				'end': {
					'comment': null,
					'preference': {
						'instructor': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						},
						'student': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						},
						'industry': {
							'nlp': null,
							'diff_context': null,
							'same_context': null
						}
					}
				}
			};
		}
	}
}

function initilizeControls(){
	//Export File control
	$('#file_export').on('click', function(){
		exportFile();
	});
	
	//Outer Survey controls
	$('#turn_button').on('click', function(){
		showInner();
	});
	
	//outer survey personal questions
	$('#role_select').on('change', function(){
		updateDropdownQuestion('role_select','personal', 'role', null, $(this).val());
	});
	
	$('#python_skill_select').on('change', function(){
		updateDropdownQuestion('python_skill_select','personal', 'python', null, $(this).val());
	});
	
	$('#sql_skill_select').on('change', function(){
		updateDropdownQuestion('sql_skill_select','personal', 'sql', null, $(this).val());
	});
	
	
	//preference questions
	
	//var types = ['instructor','student','industry'];
	//var subtypes = ['nlp','diff_context','same_context'];
		
		//nlp
	$('#instructor_nlp_preference_select').on('change', function(){
		updateDropdownQuestion('instructor_nlp_preference_select','preference', 'instructor', 'nlp', $(this).val());
	});
	
	$('#student_nlp_preference_select').on('change', function(){
		updateDropdownQuestion('student_nlp_preference_select','preference', 'student', 'nlp', $(this).val());
	});
	
	$('#industry_nlp_preference_select').on('change', function(){
		updateDropdownQuestion('industry_nlp_preference_select','preference', 'industry', 'nlp', $(this).val());
	});
	
		//diff_context
	$('#instructor_diff_context_preference_select').on('change', function(){
		updateDropdownQuestion('instructor_diff_context_preference_select','preference', 'instructor', 'diff_context', $(this).val());
	});
	
	$('#student_diff_context_preference_select').on('change', function(){
		updateDropdownQuestion('student_diff_context_preference_select','preference', 'student', 'diff_context', $(this).val());
	});
	
	$('#industry_diff_context_preference_select').on('change', function(){
		updateDropdownQuestion('industry_diff_context_preference_select','preference', 'industry', 'diff_context', $(this).val());
	});
	
		//same_context
	$('#instructor_same_context_preference_select').on('change', function(){
		updateDropdownQuestion('instructor_same_context_preference_select','preference', 'instructor', 'same_context', $(this).val());
	});
	
	$('#student_same_context_preference_select').on('change', function(){
		updateDropdownQuestion('student_same_context_preference_select','preference', 'student', 'same_context', $(this).val());
	});
	
	$('#industry_same_context_preference_select').on('change', function(){
		updateDropdownQuestion('industry_same_context_preference_select','preference', 'industry', 'same_context', $(this).val());
	});
	
	//Problem navigation controls
	$('#turn_left_button').on('click', function(){
		turn('left','problem');
	});
	
	$('#control_center').text('No Current Problem');	
	
	$('#turn_right_button').on('click', function(){
		turn('right','problem');
	});
	
	
	//Suggestion navigation controls
	$('#suggestion_turn_left_button').on('click', function(){
		turn('left','suggestion');
	});
	
	$('#suggestion_control_center').text('No Current Suggestion');	
	
	$('#suggestion_turn_right_button').on('click', function(){
		turn('right','suggestion');
	});
	
	
	//Suggestion checkbox controls
	$('#encounter_checkbox').on('click', function(){
		toggleCheckbox('encounter',false);
	});
	
	$('#recognize_checkbox').on('click', function(){
		toggleCheckbox('recognize',false);
	});
	
	$('#helpful_checkbox').on('click', function(){
		toggleCheckbox('helpful',false);
	});
	
	$('#suggest_checkbox').on('click', function(){
		toggleCheckbox('suggest',false);
	});
	
	$('#want_checkbox').on('click', function(){
		toggleCheckbox('want',false);
	});
	
	//Suggestion rating controls
	$('#rating_select').on('change', function(){
		updateRating($(this).val());
	});
	
	
	//Comment controls
	$('#comment_button').on('click', function(){
		createComment('');
	});
	
	$('#comment_remove_button').on('click', function(){
		removeComment('');
	});
	
	//Overall Comment controls
	$('#overall_comment_button').on('click', function(){
		createComment('overall_');
	});
	
	$('#overall_comment_remove_button').on('click', function(){
		removeComment('overall_');
	});
}

function showInner(){
	$('#outer').hide();
	$('#inner').show();
	state = 'middle';
	console.log('Inner '+state);
}

function showOuter(new_state){
	console.log(new_state);
	state = new_state;
	console.log(state);
	//handle what start of outer should say
	if(state == 'start'){
		if(problems != null){
			$('#outer_start').html('<div class="column"><p>Initial survey questions.</p></div>');
		} else {
			$('#outer_start').html('<div class="column"><p>Please upload survey JSON file to get started.</p></div>');
		}
		$('#question_matrix_description').html('<span>The following questions ask you to take on the perspective of different user types. <strong>Fill out all rows, even if you do not fit that user type. In that case, consider what you would like if you were that user type.</strong></span>');
		$('#personal_questions').show();
		$('#overall_comment_div').hide();
		$('#control_span').html('Proceed to next part of survey: ');
		$('#turn_button').html('Next');
		$('#finish_div').hide();
	} else if(state == 'end'){
		$('#outer_start').html('<div class="column"><p>Exit survey questions. This is the last part of the survey. <strong>Please export your survey once complete.</strong></p></div>');
		$('#question_matrix_description').html('<span>Considering your experience with this survey and identifying problems, please once again relect on the perspective of different user types. <strong>Once again, fill out each row considering what you would like if you were that user type.</strong></span>');
		$('#personal_questions').hide();
		$('#overall_comment_div').show();
		$('#control_span').html('Go to previous part of survey: ');
		$('#turn_button').html('Previous');
		$('#finish_div').show();
	}
	populateOuter();
	$('#outer_questions').show();
	$('#inner').hide();
	$('#outer').show();
}

function populateOuter(){
	
	//personal questions
	populateDropdownQuestion('role_select','personal', 'role', null);
	populateDropdownQuestion('python_skill_select','personal', 'python', null);
	populateDropdownQuestion('sql_skill_select','personal', 'sql', null);
	
	//preference questions
	var types = ['instructor','student','industry'];
	var subtypes = ['nlp','diff_context','same_context'];
	populateDropdownQuestion('instructor_nlp_preference_select','preference', 'instructor', 'nlp');
	populateDropdownQuestion('student_nlp_preference_select','preference', 'student', 'nlp');
	populateDropdownQuestion('industry_nlp_preference_select','preference', 'industry', 'nlp');
	
	populateDropdownQuestion('instructor_diff_context_preference_select','preference', 'instructor', 'diff_context');
	populateDropdownQuestion('student_diff_context_preference_select','preference', 'student', 'diff_context');
	populateDropdownQuestion('industry_diff_context_preference_select','preference', 'industry', 'diff_context');
	
	populateDropdownQuestion('instructor_same_context_preference_select','preference', 'instructor', 'same_context');
	populateDropdownQuestion('student_same_context_preference_select','preference', 'student', 'same_context');
	populateDropdownQuestion('industry_same_context_preference_select','preference', 'industry', 'same_context');
	
	
	populateComment('overall_');
	
}

function populateView(){
	if(problems != null){
		populateProblem();
		
		populateSuggestion();
		
		populateSuggestionControls();

		$('pre code').each(function(i, e) {hljs.highlightBlock(e)});
	}
}

function populateProblem(){
	
	var problem = problems['problems'][currentProblem];
	//console.log(problem);
	var work = problem['userWork'];
	var output = problem['userOutput'];
	
	work    = '<pre><code class="work_text">'+work+'</code></pre>';
	output  = '<pre><code class="output_text">'+output +'</code></pre>';
	
	$('#page_problem_work').html(work);
	$('#page_problem_output').html(output);
	
	$('#control_center').text('Current Problem: ' + (currentProblem + 1) + ' out of ' + problems['problems'].length);
}

function populateSuggestion(){
	
	var suggestion =  problems['problems'][currentProblem]['suggestions'][currentSuggestion];
	var s = suggestion['suggestion'];
	//console.log(suggestion);
	if(suggestion['level'] != 0 && Array.isArray(s) && s.length == 2){
		var before = '<div class="row">Before Fix:</div><div class="row work"><pre><code class="work_text">'+s[1]+'</code></pre></div>';
		var after  = '<div class="row">After Fix:</div><div class="row output"><pre><code class="output_text">'+s[0] +'</code></pre></div>';
		$('#page_suggestion').html(before+after);
	} else {
		$('#page_suggestion').html('<div>'+suggestion['suggestion']+'</div>');
	}
}

function populateSuggestionControls(){
	$('#suggestion_control_center').text('Current Suggestion: ' + (currentSuggestion + 1));
	
	populateCheckbox('encounter');
	populateCheckbox('recognize');
	populateCheckbox('helpful'); 
	populateCheckbox('suggest');
	populateCheckbox('want');
	
	populateRating()
	populateComment('');
}