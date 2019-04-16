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
				
				case 65: // a
				toggleCheckbox("recognize",true);
				break;
				
				case 83: // s
				toggleCheckbox("helpful",true);
				break;
				
				case 89: // y
				toggleCheckbox("suggest",true);
				break;
				
				case 73: // i
				toggleCheckbox("want",true);
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
				'start': null,
				'end': {
					'comment': null
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
	state = new_state;
	
	//handle what start of outer should say
	if(state == 'start'){
		if(problems != null){
			$('#outer_start').html('<div class="column"><p>Initial survey questions.</p></div>');
		} else {
			$('#outer_start').html('<div class="column"><p>Please upload survey JSON file to get started.</p></div>');
		}
		$('#question_matrix_description').html('The following questions ask you to take on the perspective of different user types.');
		$('#personal_questions').show();
		$('#overall_comment_div').hide();
		$('#control_span').html('Proceed to next part of survey: ');
		$('#turn_button').html('Next');
		$('#finish_div').hide();
	} else if(state == 'end'){
		$('#outer_start').html('<div class="column"><p>Exit survey questions. This is the last part of the survey. Please export your survey once complete.</p></div>');
		$('#question_matrix_description').html('Considering your experience with this survey and identifying problems, please once again relect on the perspective of different user types.');
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
	
	populateCheckbox('recognize');
	populateCheckbox('helpful'); 
	populateCheckbox('suggest');
	populateCheckbox('want');
	
	populateRating()
	populateComment('');
}