//anonymous functions that executes automatically by itself
//this makes sure that multiple javascript files can use the same variables
(function(){
	//init function that gets executed (below) immediatly after all the other functions are loaded
	function init(){
		//select the second tab and if it exists, execute function showUploadBtn
		var tab2 = document.querySelector("#tab2");
		if(tab2){
			showUploadBtn();
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
		        var feedback = document.querySelector("#tab2 .feedbackInput");
		        feedback.value = label;
		    });
		});
	}

	//executing init function after all other functions are loaded
	init();

})();