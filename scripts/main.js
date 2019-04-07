var problems = null;
var currentProblem = 0;
var currentSuggestion = 0;

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
				turn('left','problem');
				break;

				case 39: // right
				turn('right','problem');
				break;
				
				default: return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		}
	});
	
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
			problems = JSON.parse(reader.result);
			console.log(problems);
			
			initilizeControls();
			
			currentProblem = 0;
			currentSuggestion = 0;
			
			populateView();
		};
		reader.readAsText(file);
		
	} else {
		console.log('failed to parse file: '+file);
	}
}

function initilizeControls(){
	//Export File control
	$('#file_export').on('click', function(){
		exportFile();
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
		toggleCheckbox('recognize');
	});
	
	$('#helpful_checkbox').on('click', function(){
		toggleCheckbox('helpful');
	});
	
	$('#suggest_checkbox').on('click', function(){
		toggleCheckbox('suggest');
	});
	
	
	//Suggestion rating controls
	$('#rating_select').on('change', function(){
		updateRating($(this).val());
	});
	
	
	//Comment controls
	$('#comment_button').on('click', function(){
		createComment();
	});
	
	$('#comment_remove_button').on('click', function(){
		removeComment();
	});
	
	/*
	$('#comment_input').on('keydown', function(e){
		if (e.which == 13){
			createComment();
		}
	});
	*/
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
	
	$('#control_center').text('Current Problem: ' + currentProblem);
}

function populateSuggestion(){
	
	var suggestion =  problems['problems'][currentProblem]['suggestions'][currentSuggestion];
	var s = suggestion['suggestion'];
	//console.log(suggestion);
	if(suggestion['level'] != 0 && Array.isArray(s) && s.length == 2){
		var before = '<div class="row work"><pre><code class="work_text">'+s[0]+'</code></pre></div>';
		var after  = '<div class="row output"><pre><code class="output_text">'+s[1] +'</code></pre></div>';
		$('#page_suggestion').html(before+after);
	} else {
		$('#page_suggestion').html('<div>'+suggestion['suggestion']+'</div>');
	}
}

function populateSuggestionControls(){
	$('#suggestion_control_center').text('Current Suggestion: ' + currentSuggestion);
	
	populateCheckbox('recognize');
	populateCheckbox('helpful'); 
	populateCheckbox('suggest');
	populateRating()
	populateComment();
}