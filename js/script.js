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
		$(".tab3Textarea").css("border", "1px solid #CCC");

		if($(".errors")){
			$(".errors").remove();
		}
		if($(".alert")){
			$(".alert-danger").remove();
			$(".alert-success").remove();
		}

		if($(".tab3Textarea").val() == ""){
			alert.text("Please fill in the required field by manually inserting your DCAT feed");
			$(".startContent").prepend(alert);
			$(".tab3Textarea").css("border", "1px solid #D75452");
		}else{
			showFeedback();
		}
	}

	function showFeedback(){
		if(feedback['errors'].length == 0){
			success.text("Your DCAT - feed is valid. You have no errors or warnings");
			$(".startContent").prepend(success);
		}else{
			if(feedback['errors'].length <= 1){
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " error. You can find your error below the page.");
			}else{
				alert.text("Your DCAT - feed is not valid. You have " + feedback['errors'].length + " errors. You can find your errors below the page.");
			}
			$(".startContent").prepend(alert);
			
			var errorsContainer = $("<div>", {class:"container errors"});
			var header = $("<h2>");
			header.text("Errors");
			errorsContainer.append(header);
			$.each(feedback["errors"], function(key, value){
				var rowStart = $("<div>", {class:"row start"});
		    	var start = $("<div>", {class:"col-md-12"});
			 	var row = $("<div>", {class:"row"});
			 	var column = $("<div>", {class:"col-sm-12 col-lg-12 col-md-12"});
			 	var tumbnail = $("<div>", {class:"tumbnail error"});
			 	var error = $("<p>");
			 	error.append('<span class="glyphicon glyphicon-remove-sign"></span>');
			 	error.append(value.error);

			 	rowStart.append(start);
			 	start.append(row);
			 	row.append(column);
			 	column.append(tumbnail);
			 	tumbnail.append(error);

			 	errorsContainer.append(rowStart);
			 	errorsContainer.insertAfter($(".startContent"));
		    });
		}
	}

	//executing init function after all other functions are loaded
	init();

})();