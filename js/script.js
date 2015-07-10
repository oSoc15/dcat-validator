//anonymous functions that executes automatically by itself
//this makes sure that multiple javascript files can use the same variables
(function(){

	var feedback, text, alert, success;

	//init function that gets executed (below) immediatly after all the other functions are loaded
	function init(){
		//select the second tab and if it exists, execute function showUploadBtn
		var tab2 = $("#tab2");
		if(tab2){
			showUploadBtn();
		}

		var tab3 = $("#tab3");
		if(tab3){
			initValidateDirectInput();
		}
	}

	function showUploadBtn(){
		//when the value of the file button changes this code will be executed
		$(document).on('change', '.btn-file :file', function() {
			//define the input value with the amount of files chosen and the label, which represents the chosen file
		    var input = $(this),
		        numFiles = input.get(0).files ? input.get(0).files.length : 1,
		        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		    input.trigger('fileselect', [numFiles, label]);
		});

		//providing users with feedback when there file is chosen, selecting the feedback field in the HTML and adding
		//the name of the file to its value attribute
		$(document).ready( function() {
		    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
		        var feedback = $(".feedbackInput");
		        feedback.val(label);
		    });
		});
	}

	function initValidateDirectInput(){
		$("input[name='actionTab3']").on("click", validateDirectInput);
	}

	function validateDirectInput(event){
	    event.preventDefault();
	    text = $(".tab3Textarea").val();
	    feedback = validate(text,afterValidate);
 	} 	

	function afterValidate(){
		alert = $("<div>", {class:"alert alert-danger", role:"alert"});
		success = $("<div>", {class:"alert alert-success", role:"alert"});
		warning = $("<div>", {class:"alert alert-warning", role:"alert"});
		$(".tab3Textarea").css("border", "1px solid #CCC");

		if($(".errors")){
			$(".errors").remove();
			$(".warnings").remove();
		}
		if($(".alert")){
			$(".alert-danger").remove();
			$(".alert-success").remove();
			$(".alert-warning").remove();
		}

		if($(".tab3Textarea").val() == ""){
			alert.text("Please fill in the required field by manually inserting your DCAT feed");
			$(".startContent").prepend(alert);
			$(".tab3Textarea").css("border", "1px solid #D75452");
		}else{
			showFeedback();
		}
	}

	function showErrorWarning(type, glyph, value, container){
		var rowStart = $("<div>", {class:"row start"});
    	var start = $("<div>", {class:"col-md-12"});
	 	var row = $("<div>", {class:"row"});
	 	var column = $("<div>", {class:"col-sm-12 col-lg-12 col-md-12"});
	 	var tumbnail = $("<div>", {class:"tumbnail " + type});
	 	var warning = $("<p>");
	 	warning.append('<span class="glyphicon glyphicon-' + glyph + '-sign"></span>');
	 	warning.append(value.error);

	 	rowStart.append(start);
	 	start.append(row);
	 	row.append(column);
	 	column.append(tumbnail);
	 	tumbnail.append(warning);

	 	container.append(rowStart);
	}

	function showFeedback(){
		var warningsContainer = $("<div>", {class:"container warnings"});
		var errorsContainer = $("<div>", {class:"container errors"});

		if(feedback['errors'].length == 0 && feedback['warnings'].length == 0){
			success.text("Your DCAT - feed is valid. You have no errors and no warnings.");
			$(".startContent").prepend(success);
		}else if(feedback['errors'].length != 0 && feedback['warnings'].length != 0){
			if(feedback['errors'].length == 1 && feedback['warnings'].length == 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " error and " + feedback['warnings'].length + " warning. You can find your error below the page.");
			}else if(feedback["errors"].length == 1 && feedback["warnings"] > 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " error and " + feedback['warnings'].length + " warnings. You can find your error below the page.");
			}else if(feedback["errors"].length > 1 && feedback['warnings'].length == 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " errors and " + feedback['warnings'].length + " warning. You can find your error below the page.");
			}else if(feedback['errors'].length > 1 && feedback['warnings'].length > 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " errors and " + feedback['warnings'].length + " warnings. You can find your error below the page.");
			}
			$(".startContent").prepend(alert);
		}else if(feedback['errors'].length != 0 && feedback['warnings'].length == 0){
			if(feedback['errors'].length == 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " error and no warnings. You can find your error below the page.");
			}else{
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " errors and no warnings. You can find your errors below the page.");
			}
			$(".startContent").prepend(alert);
		}else if(feedback['errors'].length == 0 && feedback['warnings'].length != 0){
			if(feedback['warnings'].length == 1){
				warning.text("Your DCAT - feed is valid. You have no errors, but " + feedback['warnings'].length + " warning. You can see your warnings below the page.");	
			}else{
				warning.text("Your DCAT - feed is valid. You have no errors, but " + feedback['warnings'].length + " warnings. You can see your warnings below the page.");
			}
			$(".startContent").prepend(warning);
		}

		if(feedback['warnings'].length != 0){
			var header2 = $("<h2>");
			header2.text("Warnings");
			warningsContainer.append(header2);
			$.each(feedback["warnings"], function(key, value){
			 	showErrorWarning("warning", "warning", value, warningsContainer);
		    });
		    warningsContainer.insertAfter($(".startContent"));
		}

		if(feedback['errors'].length != 0){			
			var header = $("<h2>");
			header.text("Errors");
			errorsContainer.append(header);
			$.each(feedback["errors"], function(key, value){
			 	showErrorWarning("error", "remove", value, errorsContainer);			 	
		    });
		    if(feedback['warnings'].length != 0){
				errorsContainer.insertAfter(warningsContainer);
		 	}else{
		 		errorsContainer.insertAfter($(".startContent"));
		 	}
		}
	}

	//executing init function after all other functions are loaded
	init();

})();