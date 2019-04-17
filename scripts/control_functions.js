//Export File Control Functions
function exportFile(){
	//console.log('exporting');
	if (problems != null){
		var new_filename = null;
		if ($('#file_export_name').val() == ''){
			new_filename = currentFilename;
		} else {
			new_filename = $('#file_export_name').val();
		}
		
		if (!new_filename.endsWith('.json')){
			new_filename += '.json';
		}
		
		var endTime = Date.now()
		
		var duration = (endTime - startTime) / 1000;
		
		problems['duration'] = duration;
		
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
			} else if(current == 0 && type=='problem'){
				showOuter('start');
			}
		} else if(direction == 'right'){
			if(current < max){
				updatePosition(current+1, type)
			} else if(current == max && type=='problem'){
				showOuter('end');
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
function toggleCheckbox(type, toggle){
	var valid_types = ["encounter","recognize","helpful","suggest",,"want"];
	if(problems != null && valid_types.indexOf(type) != -1){
		//console.log(currentProblem+"."+currentSuggestion+': '+$('#'+type+'_checkbox').prop('checked'));
		var value = $('#'+type+'_checkbox').prop('checked');
		if(toggle){
			value = !value;
			$('#'+type+'_checkbox').prop('checked',value);
		}
		problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'][type] = value;
		if(type == "recognize" || type == "encounter"){
			for(var i=0; i<3; i++){
				problems['problems'][currentProblem]['suggestions'][i]['feedback'][type] = value;
			}
		}
		console.log(problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'][type]);
		//populateCheckbox(type);
	}
}

function populateCheckbox(type){
	var valid_types = ["encounter","recognize","helpful","suggest","want"];
	
	if(problems != null && valid_types.indexOf(type) != -1){
		$('#'+type+'_checkbox').prop('checked', false);
		//console.log("Populating:"+currentProblem+"."+currentSuggestion+': '+$('#'+type+'_checkbox').prop('checked'));
		var value = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'][type];
		$('#'+type+'_checkbox').prop('checked', value);
		//console.log(type+': '+$('#'+type+'_checkbox').prop('checked'));
	}
	
}

//prepost dropdown questions
function populateDropdownQuestion(id, category, type, subtype){
	var validValues = ["null","1","2","3","4","5","instuctor","student","industry"]
	if (problems != null){
		var new_value = null;
		if(category == 'personal' && state == 'start'){
			var temp = problems['survey'][state][category][type];
			if(temp == null || validValues.indexOf(temp)==-1){
				temp = "null";
			}
			new_value = temp;
		} else if(category == 'preference'){
			var temp = problems['survey'][state][category][type][subtype];
			if(temp == null || validValues.indexOf(temp)==-1){
				temp = "null";
			}
			new_value = temp;
		}
		if(new_value != null){
			$('#'+id).val(new_value);
		}
	}	
}

function updateDropdownQuestion(id, category, type, subtype, value){
	if (problems != null){
		
		console.log(state,category,value);
		if(category == 'personal' && state == 'start'){
			problems['survey'][state][category][type] = value;
			console.log("HEE"+problems['survey'][state][category][type]);
		} else if(category == 'preference'){
			problems['survey'][state][category][type][subtype] = value;
			console.log("HO"+problems['survey'][state][category][type][subtype]);
		}
		
		populateRating(id, category, type, subtype);
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
function populateComment(comment_name){
	$('#'+comment_name+'comment').html('');
	if (problems != null){
		var comment;
		if(comment_name == ''){
			comment = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback']['comment'];
		} else {
			comment = problems['survey']['end']['comment'];
		}
		
		//populate the comment
		if (comment == null || comment.length == 0){
			$('#'+comment_name+'comment').text('No comment');
		} else {
			$('#'+comment_name+'comment').text(comment);
		}
	}
	
}

function createComment(comment_name){
	var comment = $.trim($('#'+comment_name+'comment_input').val());
	if (comment != ''){
		if (problems != null){
			if(comment_name == ''){
				/*
				for(var i=0; i<3; i++){
					var feedback = problems['problems'][currentProblem]['suggestions'][i]['feedback'];
					feedback['comment'] = comment;
				}
				*/
				var feedback = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'];
				feedback['comment'] = comment;
			} else {
				problems['survey']['end']['comment'] = comment;
			}
			populateComment(comment_name);
		}
	}
	$('#'+comment_name+'comment_input').val('');
}

function removeComment(comment_name){
	if (problems != null){
		if(comment_name == ''){
			/*
			for(var i=0; i<3; i++){
				var feedback = problems['problems'][currentProblem]['suggestions'][i]['feedback'];
				feedback['comment'] = null;
			}
			*/
			var feedback = problems['problems'][currentProblem]['suggestions'][currentSuggestion]['feedback'];
			feedback['comment'] = null;
			//console.log(feedback['comment']);
		} else {
			problems['survey']['end']['comment'] = null;
		}
		populateComment(comment_name);
	}
}

