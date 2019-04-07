//Export File Control Functions
function exportFile(){
	//console.log('exporting');
	if (problems != null){
		var new_filename = null;
		if ($('#file_export_name').val() == ''){
			new_filename = current_filename;
		} else {
			new_filename = $('#file_export_name').val();
		}
		
		if (!new_filename.endsWith('.json')){
			new_filename += '.json';
		}
		download(JSON.stringify(problems), new_filename, 'text/json');
	}
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

//Turn Control Functions
function turn(direction, type){
	if(problems != null){

		var current;
		var max;
		if(type=='problem'){
			current = currentProblem;
			max = problems['problems'].length-1;
		} else if(type=='suggestion'){
			current = currentSuggestion;
			max = problems['problems'][currentProblem]['suggestions'].length-1;
		}

		
		if(direction == 'left'){
			if(current > 0){
				updatePosition(current-1, type)
			}
		} else if(direction == 'right'){
			if(current < max){
				updatePosition(current+1, type)
			}
			
		}
	}
}

function updatePosition(position, type){
	if(type=='problem'){
		currentProblem = position;
		currentSuggestion = 0;	
	} else if(type=='suggestion'){
		currentSuggestion = position;
	}
	
	//console.log("Current Problem: "+currentProblem+" | Current Suggestion: "+currentSuggestion);
	
	populateView();
}

//Suggestion Checkboxes Control Functions
//need to verify
function toggleCheckbox(type){
	var valid_types = ["recognize","helpful","suggest"];
	
	if(problems != null && valid_types.indexOf(type)!=-1){
		//console.log(type+': '+$('#'+type+'_checkbox').prop('checked'));
		var value = $('#'+type+'_checkbox').prop('checked');
		problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'][type] = value;
	}
}

function populateCheckbox(type){
	var valid_types = ["recognize","helpful","suggest"];
	
	if(problems != null && valid_types.indexOf(type)!=-1){
		//console.log(type+': '+$('#'+type+'_checkbox').prop('checked'));
		var value = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'][type];
		$('#'+type+'_checkbox').prop('checked', value);
		//console.log(type+': '+$('#'+type+'_checkbox').prop('checked'));
	}
	
}



//Suggestion Rating Control Functions
function populateRating(){
	var validRatings = ["null","1","2","3","4","5"];
	if (problems != null){
		var rating = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback']['rating'];
		if(rating == null || validRatings.indexOf(rating)==-1){
			rating = "null";
		}
		$('#rating_select').val(rating);
	}	
}

function updateRating(rating){
	if (problems != null){
		problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback']['rating'] = rating;
		populateRating();
	}
}

//Suggestion Comment Control Functions
function populateComment(){
	$('#comment').html('');
	if (problems != null){
		var comment = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback']['comment'];
		
		//populate the comment
		if (comment == null || comment.length == 0){
			$('#comment').text('No comment');
		} else {
			$('#comment').text(comment);
		}
	}
	
}

function createComment(){
	var comment = $.trim($('#comment_input').val());
	if (comment != ''){
		if (problems != null){
			var feedback = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'];
			feedback['comment'] = comment;
			//console.log(feedback['comment']);
			populateComment();
		}
	}
	$('#comment_input').val('');
}

function removeComment(){
	if (problems != null){
		var feedback = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'];
		feedback['comment'] = null;
		//console.log(feedback['comment']);
		populateComment();
	}
}
