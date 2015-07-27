// This javascript file takes care of:
// -- the validation of the different input fields
// -- checking if the right format is selected
// -- checking if the format is correct
// -- parsing the selected format and then serializing to turtle so it is readable by the validation library
// -- showing the different errors and warnings
// -- expanding the error or warning when the user pushes the dropdown arrow

// All the code is inside an anonymous function that calls itself so that
// there will be no conflict with other javascript files when the same variable or function name is used 
(function(){
    // global variables
	var feedback, text, alert, success, uploadFileValue, uploadError, url, list, elementContainer, expandBtns, panelFooters;
    var urlValue, urlFinal, number = 0, clicked = true;

    // init function that executes all functions and 
    // gets called at the bottom of the javascript file once all the functions are known
	function init(){
        // the alert variable is a div element with the class alert-danger (based on bootstrap)
        // indicating that this is an error container
		alert = $("<div>", {class:"alert alert-danger", role:"alert"});
		var tab1 = $("#tab1");
        // if tab1 variable exists, execute function initValidateURL
		if(tab1){
			initValidateUrl();
		}
		var tab2 = $("#tab2");
        // if tab2 variable exists, execute function initValidateUpload and showUploadBtn
		if(tab2){
			showUploadBtn();
			initValidateUpload();
		}

		var tab3 = $("#tab3");
        // if tab3 variable exists, execute function initValidateDirectInput
		if(tab3){
			initValidateDirectInput();
		}

        // jQuery method: if the document is loaded and an ajax call is executed, show the spinner
        // if the ajax call is over, do not show the spinner
        $(document).on({
            ajaxStart: function() { 
                $(".spinner").css("display", "block");

            },
            ajaxStop: function() { 
                $(".spinner").css("display", "none"); 
            }    
        });

        // check if there is a hash in the URI, if there is then execute function getUrlVariables
        // argument: he URI beginning from the hash #
        var hash = location.hash;
        if(location.hash != ""){
            getUrlVariables(hash);
        }
	}

    // Function that gets all variables from the URL after the hashtag
    // This way we can get the format and the url from the URI
    function getUrlVariables(hash){
        // split the string up where there are ampersands
        var varArray = hash.split('&');
        var valueArray = [];
        for(var i = 0; i < varArray.length; i++){
            // split the strings up where there are 'equal to' signs
            valueArray[i] = varArray[i].split('=');
        }

        $(".formatSelectTab1").val(valueArray[0][1]);
        var dec = decodeURIComponent(valueArray[1][1]);

        $(".tab1Input").val(dec);
        clicked = false;
        validateUrlFields();
    }

	// ==========================================================================================
    // ========================================= TAB 1 ==========================================
    // ==========================================================================================

    // function that contains an eventlistener that executes the function validateUrlFields when the button
    // on tab 1 is clicked by the user
    function initValidateUrl(){
    	$("input[name='actionTab1']").on("click", validateUrlFields);
    }

    // function that validates all the different fields in tab1
    // when all the fields are valid it calls the function getData
    function validateUrlFields(event){
        if(clicked){
            event.preventDefault();
        }
        clicked = true;

        // clear the red borders from tab2 and tab3
        clearBorders("", "tab2", "tab3");
        // clear all the errors or warnings so that the new ones can be shown
        clearFeedback();

        // if there is no format selected or there is no URI inserted,
        // an error iwll be shown and the borders of the fields will be red
        if($(".tab1Input").val() == "" || $(".formatSelectTab1").val() == ""){
            // give the alert variable (error container) a message
            alert.text("Please fill in all the fields to validate by URL.");

            // validate the different fields and give them a border color
            validateField(".tab1Input");
            validateField(".formatSelectTab1");

            // show the alert variable message in tab 1
            $("#tab1").prepend(alert);
        }else{
            // get the value from the URI input field
            url = $(".tab1Input").val();
            // call the function getData which gets the source code from the inserted URI
            getData(validateUrl);
        }
    }

    // (jQuery method) function that gets the source code from the inserted URI
    // after this function is executed and the source code is saved in a variable
    // the function validateUrl will be executed
    function getData(callback){
    	$.get(url, function (data){
	    	urlValue = data;
	    	callback();
        // if the function can't get the source code from the URI, it will return an error that the URI is not valid
	    }).fail(function(){
	    	alert.text("The URI you have entered is not valid.");
            $(".formatSelectTab1").css("border", "1px solid #CCC");
            $(".tab1Input").css("border", "1px solid #D75452"); 
			$("#tab1").prepend(alert);
	    });
    }

    // function that checks if the URI has a value. If it has a value selectParserTab1 function will be executed, else 
    // an error will be shown
    function validateUrl(){
    	if(urlValue == ""){
    		alert.text("The URI you have entered has nothing to validate."); 
			$("#tab1").prepend(alert);
    	}else{
    		selectParserTab1(urlValue);
    	}
    }

    // This function selects a parser for the selected format
    function selectParserTab1(value){
        // This if method checks if the content-type is XML. This method is only here because firefox had trouble parsing
        // the xml and serializing to turtle
        if($(".formatSelectTab1").val() == "xml"){
            // ajax call
            var xhr = $.ajax({
                type:"HEAD",
                dataType:text,
                url:$(".tab1Input").val(),
                // if the ajax call is successfull
                success:function(){
                    // if the content type is XML, serialize the parsed data to Turtle format, else show an error that
                    // the format is not correct
                    if(xhr.getResponseHeader("Content-Type").toLowerCase().indexOf("xml") >= 0){
                        rdf.parseRdfXml(value, function (graph) {
                            rdf.serializeTurtle(graph, function(value){ 
                                feedback = validate(value, afterValidate);
                            });
                        });
                    } else {
                        alert.text("The format you inserted is not the same as the selected format.");
                        $(".formatSelectTab1").css("border", "1px solid #D75452");
                        $(".tab1Input").css("border", "1px solid #CCC");
                        $("#tab1").prepend(alert);
                    }
                }       
            });
        // if the selected format is not xml, check if another format is selected and execute the function catchError
        } else{
            catchError($(".formatSelectTab1").val() == "jsonld", rdf.parseJsonLd, value, ".formatSelectTab1", ".tab1Input", "#tab1");
            catchError($(".formatSelectTab1").val() == "turtle", rdf.parseTurtle, value, ".formatSelectTab1", ".tab1Input", "#tab1");
            //catchError($(".formatSelectTab1").val() == "rdfa", rdf.parseRdfa, value, ".formatSelectTab1", ".tab1Input", "#tab1");
        }
    }

	// ==========================================================================================
    // ========================================= TAB 2 ==========================================
    // ==========================================================================================

	// Function that shows the user which file is selected using the tab 2 browse button
	function showUploadBtn(event){
        $(document).on('change', '.btn-file :file', function() {
            var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);
        });

        // if the document is loaded and a file is selected show the user which file he selected
        $(document).ready( function() {
            $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
                var feedback = $(".feedbackInput");
                feedback.val(label);
            });
        });
    }

    // Function that contains an eventlistener that executes the function validateUpload when the user clicks
    // the tab 2 button
	function initValidateUpload(){
        $("input[name='actionTab2']").on("click", validateUpload);
    }

    // Function that validates the different input fields in tab 2 and gets the content from the selected file as a value
    // for a variable
    function validateUpload(event){
        event.preventDefault();
        var file = $(".inputFile")[0].files[0];
        // if the file variable has a value then get the file extension
        if(file){
            var fileExt = file.name.split('.').pop();
        }

        // clear the red borders from tab1 and tab3
        clearBorders("tab1", "", "tab3");
        // clear all the errors or warnings so that the new ones can be shown
        clearFeedback();

        // if there is no file or format selected, the if method will show an error message,
        // else get the content form the file and put it in a variable
        if($(".feedbackInput").val() == "" || $(".formatTab2").val() == "") {
            // validate the different fields and give them a border color
        	validateField(".feedbackInput");
            validateField(".formatTab2");

            uploadFileValue = "Please fill in all the required fields in order to validate by file upload.";
            uploadError = $("<div>", {class:"alert alert-danger", role:"alert"});
            uploadError.text(uploadFileValue);
            $("#tab2").prepend(uploadError);
        }else{
            // if the value from selected format is equal to the extension from the file, us a FileReader to 
            // get the content from the file and put it in a variable
        	if($(".formatTab2").val() == fileExt){
        		var reader = new FileReader();
	            reader.readAsText(file, "UTF-8");
                // if the reader is loaded an ready, execute the function selectParserTab2
	            reader.onload = function (evt) {
	                uploadFileValue = evt.target.result;
	                selectParserTab2(fileExt);
	                $(".feedbackInput").css("border", "1px solid #CCC");
	            }
                // if the reader encouters an error show an error message
	            reader.onerror = function (evt) {
	                uploadFileValue = "The file cannot be validated.";
	                uploadError = $("<div>", {class:"alert alert-danger", role:"alert"});
	                uploadError.text(uploadFileValue);
	                $("#tab2").prepend(uploadError);
	            }
            // else if the file format and the extension are not the same show an error message
        	}else{
        		alert.text("The format you inserted is not the same as the selected format.");
                $(".formatTab2").css("border", "1px solid #D75452");
                $(".feedbackInput").css("border", "1px solid #CCC");
            	$("#tab2").prepend(alert);
        	}
        }
    }

    // This function executes the catchError function which determines which parser is executed to serialize everything to turtle
    function selectParserTab2(fileExt){
        catchError(fileExt == "xml" && $(".formatTab2").val() == "xml", rdf.parseRdfXml, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "jsonld" && $(".formatTab2").val() == "jsonld", rdf.parseJsonLd, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "ttl" && $(".formatTab2").val() == "turtle", rdf.parseTurtle, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
        //catchError(fileExt == "rdfa" && $(".formatTab2").val() == "rdfa", rdf.parseRdfa, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
    }

    // ==========================================================================================
    // ========================================= TAB 3 ==========================================
    // ==========================================================================================

    // Function that contains an eventlistener that executes the function validateDirectInput when the user clicks
    // the tab 3 button
    function initValidateDirectInput(){
        $("input[name='actionTab3']").on("click", validateDirectInput);
    }

    // Function that validates the different input fields in tab 3 and gets the content from the inserted feed as a value
    // for a variable
    function validateDirectInput(event){
        event.preventDefault();

        // clear the red borders from tab1 and tab2
        clearBorders("tab1", "tab2", "");
        // clear all the errors or warnings so that the new ones can be shown
        clearFeedback();

        // if there is no format selected or there is no inserted feed, the if method will show an error message,
        // else get the inserted code and put it in a variable and execute the selectParserTab3 function
        if($(".tab3Textarea").val() == "" || $(".formatTab3").val() == ""){
            alert.text("Please fill in the required fields for validating by manually input of the code.");
            $("#tab3").prepend(alert);
            
            // validate the different fields and give them a border color
            validateField(".tab3Textarea");
            validateField(".formatTab3");
        }else{
            text = $(".tab3Textarea").val();
            selectParserTab3(text);
        }
    }

    // This function executes the catchError function which determines which parser is executed to serialize everything to turtle
    function selectParserTab3(text){
        //////////////////// for firefox only /////////////////////
        // For firefox only because it has trouble parsing the XML and serializing it to Turtle, a DOMParser instance is created
        var oParser = new DOMParser();
        // parse the xml
        var oDOM = oParser.parseFromString($(".tab3Textarea").val(), "text/xml");
        // this variable contains the right format or an error, the variable contains rdf:RDF if an RDF:XML is inserted in the direct input field
        var checkFormat = oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName;
        // if the checkFormat contains an error and it's not equal to rdf:RDF, an error is shown
        if(checkFormat == "error while parsing"){
            if(checkFormat != "rdf:RDF"){
                alert.text("The format you inserted is not the same as the selected format.");
                $(".formatTab3").css("border", "1px solid #D75452");
                $(".tab3Textarea").css("border", "1px solid #CCC");
                $("#tab3").prepend(alert);
            }
        }
        //////////////////////////////////////////////////////////
        
        // the catchError function is called which selects the right parser and then serializes to Turtle
	    catchError($(".formatTab3").val() == "xml" && checkFormat == "rdf:RDF", rdf.parseRdfXml, text, ".formatTab3", ".tab3Textarea", "#tab3");
	    catchError($(".formatTab3").val() == "jsonld", rdf.parseJsonLd, text, ".formatTab3", ".tab3Textarea", "#tab3");
	    catchError($(".formatTab3").val() == "turtle", rdf.parseTurtle, text, ".formatTab3", ".tab3Textarea", "#tab3");
        //catchError($(".formatTab3").val() == "rdfa", rdf.parseRdfa, text, ".formatTab3", ".tab3Textarea", "#tab3");
    }

    // ==========================================================================================
    // ============================== GENERAL FUNCTIONS VALIDATE ================================
    // ==========================================================================================

    // Function that checks if a field has a value or not. If it has a value the field get a normal border. 
    // If there is no value the if method makes sure that the field gets a red border.
    // The field argument contains the field that needs to be validated.
    function validateField(field){
        if($(field).val() == ""){
            $(field).css("border", "1px solid #D75452");
        }else{
            $(field).css("border", "1px solid #CCC");
        }
    }

    // Function that calls the function covertFormat if the given condition is true. If the condition is false then an
    // error will be shown that the format is not the correct one.
    // Arguments:
    // -- condition: the if condition that determines if an error will be shown or if the covertFormat function is called
    // -- rdfFunction: this determines which parser is used
    // -- value: this contains a variable that has the feed stored in it
    // -- format: this is the field which contains the selected format by the user
    // -- format2: this is the other field from the chosen form
    // -- tab: this is the tab the user choses to use
    function catchError(condition, rdfFunction, value, format, format2, tab){
    	if(condition){
            // try catch method to intercept an error
    		try{
    			convertFormat(rdfFunction, value, format, format2, tab);
    		}catch(error){
    			alert.text("The format you inserted is not the same as the selected format.");
                $(format).css("border", "1px solid #D75452");
                $(format2).css("border", "1px solid #CCC");
				$(tab).prepend(alert);
    		}   
        }
    }

    // This function parses a format and then serializes the format to Turtle so it can be validated by the library
    // arguments:
    // -- parseFunction: this determines which parser is used
    // -- fileValue: this contains a variable that has the feed stored in it
    // -- format: this is the field which contains the selected format by the user
    // -- format2: this is the other field from the chosen form
    // -- tab: this is the tab the user choses to use
    function convertFormat(parseFunction, fileValue, format, format2, tab){
    	parseFunction(fileValue, function (graph) {
            // try catch method to intercept an error, if there is an error an error will be shown on the screen that the
            // selected format is not correct
	    	try{
                $(".spinner").css("display", "block");
	            rdf.serializeTurtle(graph, function(fileValue){
                    $(".spinner").css("display", "block");
                    // This variable contains the returned array which has all the errors and warnings in it
                    // The filevalue contains the feed itself as Turtle and the afterValidate function is a callback

	                feedback = validate(fileValue, afterValidate);
	            });  
	    	}catch(error){
	    		alert.text("The format you inserted is not the same as the selected format.");
                $(format).css("border", "1px solid #D75452");
                $(format2).css("border", "1px solid #CCC");
				$(tab).prepend(alert);
                $(".spinner").css("display", "none");
	    	}
    	});
    }

    // After the library has validated the feed, this function is called and creates different alerts for warnings, errors and successfull validations
    function afterValidate(){
        alert = $("<div>", {class:"alert alert-danger", role:"alert"});
        success = $("<div>", {class:"alert alert-success", role:"alert"});
        warning = $("<div>", {class:"alert alert-warning", role:"alert"});
        // Clear the red borders
        clearBorders("tab1", "tab2", "tab3");
        // Hide the spinner
        $(".spinner").css("display", "none");

        // Clear all the different errors and warnings, when the feed is already validated, this will make sure that the previous validation is not shown
        clearFeedback();
        // Function that shows the errors and warnings
        showFeedback();
    }

    // Function that clears all the red borders and give them normal #CCC borders
    function clearBorders(tab1, tab2, tab3){
    	if(tab1 == "tab1"){
    		$(".tab1Input").css("border", "1px solid #CCC");
    		$(".formatSelectTab1").css("border", "1px solid #CCC");
    	}
    	if(tab2 == "tab2"){
    		$(".feedbackInput").css("border", "1px solid #CCC");
    		$(".formatTab2").css("border", "1px solid #CCC");
    	}
    	if(tab3 == "tab3"){
    		$(".tab3Textarea").css("border", "1px solid #CCC");
    		$(".formatTab3").css("border", "1px solid #CCC");
    	}
    }

    // This removes the different alerts like warnings, errors and successes so that the new ones can be shown
    function clearFeedback(){
        if($(".alert")){
            $(".alert-danger").remove();
            $(".alert-success").remove();
            $(".alert-warning").remove();
        }
        if($(".errors")){
            $(".errors").remove();
            $(".warnings").remove();
        }
    }

    // This function shows the main message above all the different errors and warnings. This main message shows how many errors and warnings are there and if the feed is valid or not
    function showFeedBackMessage(element, valid, rest){
        elementContainer = $("<div>", {class:"container elementContainer"});
        element.text("Your DCAT - feed is " + valid + "valid. You have " + rest);
        elementContainer.append(element);
        elementContainer.insertAfter($(".startContent"));
    }

    // This function shows the error or warning message. The function contains the entire setup to create
    // an expandable warning or error message with its different properties
    // arguments:
    // -- type: Type determines wether it is an error or warning
    // -- container: This contains a variable which is the container for the errors or warnings, the errors will be assigned to the errorContainer and the warnings to the warningContainer
    // -- glyph: This is the type of glyph (bootstrap) that has to be shown next to the warning or error
    function showErrorWarning(type, container, glyph){
        // Show the different errors and warnings
        for(message in feedback[type]){
            number++;
            var panel = $("<div>", {class:"panel panel-default"});
            var panelBody = $("<div>", {class:"panel-body down" + number});
            var panelFooter = $("<div>", {class:"panel-footer panel-footer-down" + number});
            panel.append(panelBody);
            // if the class doesn't have properties then it doens't need to show a panelfooter with properties
            if(feedback[type][message].length != 0){
                panel.append(panelFooter);
                var list2 = $("<ul>", {class:"list"});
                panelFooter.append(list2);
            }
            container.append(panel);
            
            var error = $ ("<p>", {class:"errorTitle"});
            error.append('<span class="glyphicon glyphicon-' + glyph +'-sign"></span>');
            error.append("<strong>Resource: </strong>" + message);
            // if the class doesn't have properties then it doens't need to be expandable
            if(feedback[type][message].length != 0){
                var expandError = $('<span></span>', {class:"glyphicon arrow glyphicon-chevron-down"});
                error.append(expandError);
            }
            panelBody.append(error);

            // Show the different properties per error or warning
            for(message2 in feedback[type][message]){
                var listItem = $("<li>");
                listItem.append(feedback[type][message][message2].error);
                if(feedback[type][message].length != 0){
                    list2.append(listItem);
                }
            }
        }
    }

    // Function that shows the global error/warning/success message and the different errors and warnings.
    // This function makes use of different functions like the showFeedBackMessage, showErrorWarning and dropDown
    function showFeedback(){
        var warningsContainer = $("<div>", {class:"container warnings"});
        var errorsContainer = $("<div>", {class:"container errors"});
        var fErrors = Object.keys(feedback["errors"]).length;
        var fWarnings = Object.keys(feedback["warnings"]).length;

        // Show the global error message use the function showFeedBackMessage
        if(fErrors == 0 && fWarnings == 0){
        	showFeedBackMessage(success, "", "no errors and no warnings.");
        }else if((fErrors != 0 && fWarnings != 0) || (fErrors != 0 && fWarnings == 0)){
			showFeedBackMessage(alert, "not ", fErrors + " error(s) and " + fWarnings + " warning(s). You can find your error(s) or warning(s) below the page.");
		}else if(fErrors == 0 && fWarnings != 0 ){
			showFeedBackMessage(warning, "", "no errors, but " + fWarnings + " warning(s). You can see your warning(s) below the page.");
        }

        // Animate the page that when the validation is done it scrolls down automatically to the errors and warnings
        $('html, body').animate({
            scrollTop: $(".alert").offset().top
        }, 500);

        // Show the different warnings
        if(fWarnings != 0){
            var header2 = $("<h2>");
            header2.text("Warnings");
            warningsContainer.append(header2);
            
            showErrorWarning("warnings", warningsContainer, "warning");

            warningsContainer.insertAfter(elementContainer);
        }

        // Show the different errors
        if(fErrors != 0){         
            var header = $("<h2>");
            header.text("Errors");
            errorsContainer.append(header);

            showErrorWarning("errors", errorsContainer, "remove");

            errorsContainer.insertAfter(elementContainer);
        }

        // Hide the different panel footers so that the properties are not shown when the validation is done
        panelFooters = document.querySelectorAll(".panel-footer");
        if(panelFooters){
            [].forEach.call(panelFooters, function(footer){
                $(footer).hide();
            });
        }

        // Get all the different expandable buttons and put them in an array
        // if the array contains these buttons call the dropdown function
        expandBtns = document.querySelectorAll(".panel-body");
        if(expandBtns){
            dropDown(expandBtns);
        }
    }

    // Function that makes it possible to expand the errors and warnings to see there properties
    function dropDown(array){
        [].forEach.call(array, function(btn){
            btn.addEventListener("click", function(event){
                $(btn).parent('.panel').toggleClass('down');
                var panelFootName = event.currentTarget.getAttribute('class').split(' ')[1];
                var glyph = event.currentTarget.querySelector(".arrow")
                $(".panel-footer-" + panelFootName).slideToggle("fast");
            });
        });
    }

     init();

})();

	