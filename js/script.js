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

    $.ajaxSetup({
        timeout: 30000
    });

    // global variables
	var feedback, text, alert, success, uploadFileValue, uploadError, url, list, elementContainer, expandBtns, panelFooters;
    var urlValue, urlFinal, number = 0, clicked = true;
    // Reg. Expressions for xml, jsonld and turtle
    var xmlPatt = /^\s*\<\?xml/i;
    var jsonldPatt = /^\s*\{[\s\S]*.*[\s\S]*\}\s*$/m;
    var turtlePatt = /^\s*\@prefix/i;

    // require the validate module
    var validate = require('validate');

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

    // function that gets all variables from the URL after the hashtag
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
            showAlert("The server at the URI you have entered is blocking access to the content.", ".tab1Input", ".formatSelectTab1", "#tab1");
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

    // This function selects a parser for the selected format, the function ajaxCallTab1 is executed which contains an ajax call an continues to parse and serialize
    function selectParserTab1(value){
        if($(".formatSelectTab1").val() == "rdfxml"){
            ajaxCallTab1("xml", "rdfxml", rdf.parseRdfXml, value);
        }else if($(".formatSelectTab1").val() == "jsonld"){
            ajaxCallTab1("ld+json", "jsonld", rdf.parseJsonLd, value);
        }else if($(".formatSelectTab1").val() == "turtle"){
            ajaxCallTab1("turtle", "turtle", rdf.parseTurtle, value);
        // if the parser is automatic then it executes a parser depending on the returned content-type from the ajax request
        }else if($(".formatSelectTab1").val() == "auto"){
            var xhr = $.ajax({
                type:"HEAD",
                dataType:text,
                url:$(".tab1Input").val(),
                headers: {          
                    Accept: "text/turtle, application/ld+json, application/rdf+xml, */*; q=1.0"
                },
                success:function(){
                    // if the content-type is correct it will parse and serialize, else it shows an error
                    var contentType = xhr.getResponseHeader("Content-Type");
                    if(contentType.toLowerCase().indexOf("turtle") >= 0){
                        catchError($(".formatSelectTab1").val() == "auto", rdf.parseTurtle, value, ".formatSelectTab1", ".tab1Input", "#tab1");
                    }else if(contentType.toLowerCase().indexOf("xml") >= 0){
                        catchError($(".formatSelectTab1").val() == "auto", rdf.parseRdfXml, value, ".formatSelectTab1", ".tab1Input", "#tab1");
                    }else if(contentType.toLowerCase().indexOf("ld+json") >= 0){
                        catchError($(".formatSelectTab1").val() == "auto", rdf.parseJsonLd, value, ".formatSelectTab1", ".tab1Input", "#tab1");
                    }else{
                        showAlert("The URI you inserted does not contain one of the formats we support. Please insert a XML, JSON-LD or Turtle format.", ".tab1Input", ".formatSelectTab1", "#tab1");
                    }
                }
            });
        }
    }

    // function that executes an ajax call, when this call is successfull, it will call the function catchError
    // arguments:
    // -- format: the format from the content-Type
    // -- selectFormat: the value from the selected format in the select box
    // -- parseFunction: The function that parses the feed
    // -- value: The value that will be parsed
    function ajaxCallTab1(format, selectFormat, parseFunction, value){
        // ajax call
        var xhr = $.ajax({
            type:"HEAD",
            dataType:text,
            url:$(".tab1Input").val(),
            // if the ajax call is successfull
            success:function(){
                // if the content type is XML, serialize the parsed data to Turtle format, else show an error that
                // the format is not correct
                if(xhr.getResponseHeader("Content-Type").toLowerCase().indexOf(format) >= 0){
                    catchError($(".formatSelectTab1").val() == selectFormat, parseFunction, value, ".formatSelectTab1", ".tab1Input", "#tab1");
                } else {
                    showAlert("The format you inserted is not the same as the selected format.", ".formatSelectTab1", ".tab1Input", "#tab1");
                }
            }       
        });
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
            $('.btn-file :file').on('fileselect', function(event, numFiles, label){
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
        if(fileExt == "ttl"){
            fileExt = "turtle";
        }else if(fileExt == "xml"){
            fileExt = "rdfxml";
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
                showAlert("The format you inserted is not the same as the selected format.", ".formatTab2", ".feedbackInput", "#tab2");
        	}
        }
    }

    // This function executes the catchError function which determines which parser is executed to serialize everything to turtle
    function selectParserTab2(fileExt){
        catchError(fileExt == "rdfxml" && $(".formatTab2").val() == "rdfxml", rdf.parseRdfXml, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "jsonld" && $(".formatTab2").val() == "jsonld", rdf.parseJsonLd, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "turtle" && $(".formatTab2").val() == "turtle", rdf.parseTurtle, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
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
        /////////////////////// FIREFOX ONLY ///////////////////////
        // In firefox it validates RDF no matter what format is selected, to fix this an Reg. Exp. is used to see 
        // if it is an xml file instead of turtle or JSON-LD which will show the errow in the else structure
        if($(".formatTab3").val() == "rdfxml" && xmlPatt.test(text)){
            catchError($(".formatTab3").val() == "rdfxml", rdf.parseRdfXml, text, ".formatTab3", ".tab3Textarea", "#tab3");
        }else{
            if($(".formatTab3").val() == "rdfxml"){
                showAlert("The format you inserted is not the same as the selected format.", ".formatTab3", ".tab3Textarea", "#tab3");
            }
        }
        ////////////////////////////////////////////////////////////
        
        // the catchError function is called which selects the right parser and then serializes to Turtle
	    catchError($(".formatTab3").val() == "jsonld", rdf.parseJsonLd, text, ".formatTab3", ".tab3Textarea", "#tab3");
	    catchError($(".formatTab3").val() == "turtle", rdf.parseTurtle, text, ".formatTab3", ".tab3Textarea", "#tab3");
    }

    // ==========================================================================================
    // ============================== GENERAL VALIDATE FUNCTIONS ================================
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
                // if there is an error during parsing:
                // if the format is equal to the chosen format and the test function for the reg. exp. returns true
                // then an error will be shown indicating that the format is correct but not it's syntax
                if($(format).val() == "rdfxml" && xmlPatt.test(value)){
                    showAlert("The format you inserted is correct, but your RDF:XML syntax is wrong.", format, format2, tab);
                }else if($(format).val() == "jsonld" && jsonldPatt.test(value)){
                    showAlert("The format you inserted is correct, but your JSON-LD syntax is wrong.", format, format2, tab);
                }else{
                    showAlert("The format you inserted is not the same as the selected format.", format, format2, tab);
                }
                $(".spinner").css("display", "none");
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
	                feedback = validate(fileValue, validatorRules, afterValidate);
	            });  
	    	}catch(error){
                // If there is an error during serializing (this is only for the turtle format because), then an error is shown indicating that the format is right but the syntax is wrong
                if($(format).val() == "turtle" && turtlePatt.test(fileValue)){
                    showAlert("The format you inserted is correct, but your Turtle syntax is wrong.", format, format2, tab);
                }else{
                    showAlert("The format you inserted is not the same as the selected format.", format, format2, tab);
                }
                $(".spinner").css("display", "none");
	    	}
    	});
    }

    // This function shows an error at the top of the tab
    // arguments:
    // -- message: the message that is shown in the error
    // -- element1: the element that gets the red border
    // -- element2: the element that gets the normal gray border
    // -- tab: the tab in which the error is shown
    function showAlert(message, element1, element2, tab){
        alert.text(message);
        $(element1).css("border", "1px solid #D75452");
        $(element2).css("border", "1px solid #CCC");
        $(tab).prepend(alert);
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

    // Show the content of the feedback, this contains the different errors or warnings
    // This function calls the function showErrorWarning to show each error or warning seperatly
    // arguments:
    // -- classSpan: the name given to the class of the span element which defines all drop down button
    // -- headerText: The text shown in the header
    // -- container: the container in which all the errors or warnings is stored
    // -- type: the type which is given to the showErrorWarning function, which deteremins wether it is an error or warning
    // -- glyph: the glyph which is given to the showErrorWarning function, which is the type of glyph (boostrap) that has to be shown next to the warning or error
    function showFeedbackContent(classSpan, headerText, container, type, glyph){
        var fullContainer = $("<div>", {class:"headContainer"});
        var headerContainer1 = $("<div>", {class:"col-sm-6"});
        var headerContainer2 = $("<div>", {class:"col-sm-6 detailBtnContainer"});
        var header = $("<h2>");
        var spanDetailsErrors = $("<span>", {class:"allDetails" + classSpan});
        header.text(headerText);
        spanDetailsErrors.text("Show all " + classSpan.toLowerCase());
        headerContainer1.append(header);
        headerContainer2.append(spanDetailsErrors);
        fullContainer.append(headerContainer1);
        fullContainer.append(headerContainer2);
        container.append(fullContainer);

        // call the function showErrorWarning to show all the errors and warnings
        showErrorWarning(type, container, glyph);

        container.insertAfter(elementContainer);
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
            var list2 = $("<ul>", {class:"list"});
            var showURI = $("<span>", {class:"showURI"});
            var error = $ ("<p>", {class:"errorTitle"});
            var expandError = $('<span></span>', {class:"glyphicon arrow glyphicon-chevron-down"});
            // Add the panelBody to the panel
            panel.append(panelBody);
            // if the class doesn't have properties then it doens't need to show a panelfooter with properties
            if(feedback[type][message].error[0].property != null){
                // Add the panelfooter and list and URI's to the panel
                panel.append(panelFooter);
                showURI.append("Show URI's")
                panelFooter.append(showURI);
                panelFooter.append(list2);
            }
            // Add the panel to the container
            container.append(panel);
            
            // Add a glyph to the error
            error.append('<span class="glyphicon glyphicon-' + glyph +'-sign"></span>');
            // if the class doesn't have properties, extra info will be added to the main message
            if(feedback[type][message].error[0].property != null){
                error.append("<strong>Resource: </strong>" + feedback[type][message].class + " class: " + feedback[type][message].URIClass);
            }else if(feedback[type][message].error[0].URIClass != null){
                error.append("<strong>Resource: </strong>" + feedback[type][message].class + " class: " + feedback[type][message].URIClass + " " + feedback[type][message].error[0].message);
            }else {
                error.append("<strong>Resource: </strong>" + feedback[type][message].class + " class " + feedback[type][message].error[0].message);
            }
            // if the class doesn't have properties then it doens't need to be expandable
            if(feedback[type][message].error[0].property != null){
                error.append(expandError);
            }
            // Add errors/warnings to the panelBody
            panelBody.append(error);

            // Show the different properties per error or warning
            for(message2 in feedback[type][message].error){
                // Show only these properties if there are properties present
                if(feedback[type][message].error[message2].property != null){
                    var listItem = $("<li>");
                    var listBr = $("<br />");
                    var listSpan = $("<span>");
                    var listLink = $("<a>", {href:feedback[type][message].error[message2].URIProperty, target:"_blank"});
                    listItem.append("The property: " + feedback[type][message].error[message2].property + " " + feedback[type][message].error[message2].message);
                    list2.append(listItem);
                    listItem.append(listBr);
                    listItem.append(listSpan);
                    listSpan.append(listLink);
                    listLink.append(feedback[type][message].error[message2].URIProperty);
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
            showFeedbackContent("Warnings", "Warnings", warningsContainer, "warnings", "warning");
        }

        // Show the different errors
        if(fErrors != 0){
            showFeedbackContent("Errors", "Errors", errorsContainer, "errors", "remove");
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
            dropDown(expandBtns, fErrors, fWarnings);
        }

        // Get all the showURI buttons and put them in an array
        // If this array contains the different buttons call the dropdown2 function
        showURIs = document.querySelectorAll(".showURI");
        if(showURIs){
            dropDown2(showURIs);
        }

        // An eventlistener defined, using jQuery. When the span elements is clicked, the function dropDownAll is called
        $(".allDetailsErrors").on("click", function(){
            dropDownAll("errors", "Errors", fErrors, fWarnings);
        });
        $(".allDetailsWarnings").on("click", function(){
            dropDownAll("warnings", "Warnings", fErrors, fWarnings);
        });
    }

    // function that makes it possible to expand the errors and warnings to see there properties
    // arguments:
    // -- array: The array which contains the different elements for the panel-footer drop down
    function dropDown(array, length, length2){
        [].forEach.call(array, function(btn){
            btn.addEventListener("click", function(event){
                $(btn).parent('.panel').toggleClass('down');
                var panelFootName = event.currentTarget.getAttribute('class').split(' ')[1];
                var thisGlyph = $(btn).parent('.panel').find(".glyphicon-chevron-down");
                // if the length is more than 150 errors or warnings, the animation slideToggle is replace by a show and hide function
                // This is applied only because some windows users have trouble with the animation when more than 150 errors are shown
                if(length < 150 && length2 < 150){
                    thisGlyph.css({'transition' : 'transform 0.2s', '-moz-transition': 'transform 0.2s', '-o-transition': 'transform 0.2s', '-webkit-transition': 'transform 0.2s', '-ms-transition': 'transform 0.2s'});
                    $(".panel-footer-" + panelFootName).slideToggle("fast");
                }else{
                    thisGlyph.css({'transition' : 'none', '-moz-transition': 'none', '-o-transition': 'none', '-webkit-transition': 'none', '-ms-transition': 'none'});
                    if($(btn).parent(".panel").attr("class") == "panel panel-default down"){
                        $(".panel-footer-" + panelFootName).show();
                    }else{
                        $(".panel-footer-" + panelFootName).hide();
                    }
                }
            });
        });
    }

    // function that meks it possible to show or hide the different URI's per property
    // -- array: the array which contains the different elements for the property URI drop down
    function dropDown2(array){
        [].forEach.call(array, function(btn){
            btn.addEventListener("click", function(event){
                $(btn).next().children().children().toggleClass("showURIs");
                if($(btn).text() == "Show URI's"){
                    $(btn).text("Hide URI's");
                }else{
                    $(btn).text("Show URI's");
                }
            });
        });
    }

    // function that expands all errors or warnings, depending on the type given as an argument
    // arguments:
    // -- type: defines the classname of the container which contains the panel-footer
    // -- type2: defines the classname of the 'show/hide all details' button, also used to show the right text in the button
    function dropDownAll(type, type2, length, length2){
        var array = $("." + type + " .panel");
        var arrayFooters = $("." + type + " .panel-footer");
        // if the span, depending on the type, has a text equal to 'show all details', then it executes a for lus
        // which goes through the array and adds a class and a slideDown function using jQuery
        if($(".allDetails" + type2).text() == "Show all " + type){
            for(var i = 0; i < array.length; i++){
                $(array[i]).addClass('down');
                // if the length is more than 150 errors or warnings, the animation slideDown or slideUp is replace by a show and hide function
                // This is applied only because some windows users have trouble with the animation when more than 150 errors are shown
                if(length < 150 && length2 < 150){
                    $(arrayFooters[i]).prev().find(".glyphicon-chevron-down").css({'transition' : 'transform 0.2s', '-moz-transition': 'transform 0.2s', '-o-transition': 'transform 0.2s', '-webkit-transition': 'transform 0.2s', '-ms-transition': 'transform 0.2s'});
                    $(arrayFooters[i]).slideDown("fast");
                }else{
                    $(arrayFooters[i]).prev().find(".glyphicon-chevron-down").css({'transition' : 'none', '-moz-transition': 'none', '-o-transition': 'none', '-webkit-transition': 'none', '-ms-transition': 'none'});
                    $(arrayFooters[i]).show();
                }
            }
            $(".allDetails" + type2).text("Hide all " + type);
        // else it removes the class down and add the function slideup using jQuery
        }else{
            for(var i = 0; i < array.length; i++){
                $(array[i]).removeClass('down');
                // if the length is more than 150 errors or warnings, the animation slideDown or slideUp is replace by a show and hide function
                // This is applied only because some windows users have trouble with the animation when more than 150 errors are shown
                if(length < 150 && length2 < 150){
                    $(arrayFooters[i]).prev().find(".glyphicon-chevron-down").css({'transition' : 'transform 0.2s', '-moz-transition': 'transform 0.2s', '-o-transition': 'transform 0.2s', '-webkit-transition': 'transform 0.2s', '-ms-transition': 'transform 0.2s'});
                    $(arrayFooters[i]).slideUp("fast");
                }else{
                    $(arrayFooters[i]).prev().find(".glyphicon-chevron-down").css({'transition' : 'none', '-moz-transition': 'none', '-o-transition': 'none', '-webkit-transition': 'none', '-ms-transition': 'none'});
                    $(arrayFooters[i]).hide();
                }
            }
            $(".allDetails" + type2).text("Show all " + type);
        }
    }

    // ==========================================================================================
    // ============================== HARD CODED VALIDATION RULES ===============================
    // ==========================================================================================

    //the hard-coded validation rules of DCAT
    var validatorRules = new Array();

    //The class where it all begins: 'Catalog' (mandatory)
    validatorRules['mandatory'] =
    {
        'Catalog': {
            'class': 'Catalog',
            'required': 'mandatory',
            'mutiple': false,
            'URI': 'http://www.w3.org/ns/dcat#Catalog',
            'properties': [ 
                {
                    'name': 'type',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Resource',
                    'URI': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    'multiple': false
                },
                {
                    'name': 'title',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/title',
                    'multiple': false
                },
                {
                    'name': 'description',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/description',
                    'multiple': false
                },
                {
                    'name': 'issued',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/issued',
                    'multiple': false
                },
                {
                    'name': 'modified',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/modified',
                    'multiple': false
                },
                {
                    'name': 'language',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/language',
                    'multiple': false
                },
                {
                    'name': 'publisher',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'http://xmlns.com/foaf/0.1/Agent',
                    'URI': 'http://purl.org/dc/terms/publisher',
                    'multiple': false
                },
                {
                    'name': 'themes',
                    'prefix': 'dcat',
                    'required': 'recommended',
                    'Range': 'http://www.w3.org/2004/02/skos/core#ConceptScheme',
                    'URI': 'http://www.w3.org/ns/dcat#themeTaxonomy',
                    'multiple': false
                },
                {
                    'name': 'license',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/license',
                    'multiple': false
                },
                {
                    'name': 'rigths',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/rights',
                    'multiple': false
                },
                {
                    'name': 'spatial',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/spatial',
                    'multiple': false
                },
                {
                    'name': 'dataset',
                    'prefix': 'dcat',
                    'required': 'mandatory',
                    'Range': 'http://www.w3.org/ns/dcat#Dataset',
                    'URI': 'http://www.w3.org/ns/dcat#dataset',
                    'multiple': true
                },
                {
                    'name': 'record',
                    'prefix': 'dcat',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/dcat#record',
                    'multiple': false
                },
                {
                    'name': 'homepage',
                    'prefix': 'foaf',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://xmlns.com/foaf/0.1/homepage',
                    'multiple': false
                }
            ]
        }
    };

    //The classes that can be in the DCAT feed (optional)
    validatorRules['optional'] =
    {
        'Agent': {
            'class': 'Agent',
            'required': 'mandatory',
            'mutiple': true,
            'URI': 'http://xmlns.com/foaf/0.1/Agent',
            'properties': [
                {
                    'name': 'name',
                    'prefix': 'foaf',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://xmlns.com/foaf/0.1/name',
                    'multiple': true
                }
            ]
        },
        'Dataset': {
            'class': 'Dataset',
            'required': 'mandatory',
            'mutiple': true,
            'URI': 'http://www.w3.org/ns/dcat#Dataset',
            'properties': [
                {
                    'name': 'type',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'http://www.w3.org/2004/02/skos/core#Concept',
                    'URI': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                    'multiple': false
                },
                {
                    'name': 'title',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/title',
                    'multiple': false
                },
                {
                    'name': 'description',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/description',
                    'multiple': false
                },
                {
                    'name': 'issued',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/issued',
                    'multiple': false
                },
                {
                    'name': 'modified',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/modified',
                    'multiple': false
                },
                {
                    'name': 'language',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/language',
                    'multiple': false
                },
                {
                    'name': 'publisher',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'http://xmlns.com/foaf/0.1/Agent',
                    'URI': 'http://purl.org/dc/terms/publisher',
                    'multiple': false
                },
                {
                    'name': 'accrualPeriodicity',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/publisher',
                    'multiple': false
                },
                {
                    'name': 'identifier',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/identifier',
                    'multiple': false
                },
                {
                    'name': 'temporal',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/temporal',
                    'multiple': false
                },
                {
                    'name': 'theme',
                    'prefix': 'dcat',
                    'required': 'recommended',
                    'Range': 'http://www.w3.org/2004/02/skos/core#Concept',
                    'URI': 'http://www.w3.org/ns/dcat#theme',
                    'multiple': false
                },
                {
                    'name': 'relation',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Resource',
                    'URI': 'http://purl.org/dc/terms/relation',
                    'multiple': false
                },
                {
                    'name': 'keyword',
                    'prefix': 'dcat',
                    'required': 'recommended',
                    'Range': 'Literal',
                    'URI': 'http://www.w3.org/ns/dcat#keyword',
                    'multiple': true
                },
                {
                    'name': 'contactPoint',
                    'prefix': 'dcat',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/dcat#contactPoint',
                    'multiple': true
                },
                {
                    'name': 'temporal',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/temporal',
                    'multiple': false
                },
                {
                    'name': 'spatial',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/spatial',
                    'multiple': false
                },
                {
                    'name': 'sample',
                    'prefix': 'adms',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/adms#sample',
                    'multiple': false
                },
                {
                    'name': 'distribution',
                    'prefix': 'dcat',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/dcat#distribution',
                    'multiple': false
                },
                {
                    'name': 'landingPage',
                    'prefix': 'dcat',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/dcat#landingPage',
                    'multiple': false
                }
            ]
        },
        'Distribution': {
            'class': 'Distribution',
            'required': 'recommended',
            'mutiple': true,
            'URI': 'http://www.w3.org/ns/dcat#Distribution',
            'properties': [
                {
                    'name': 'title',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/title',
                    'mutiple': false
                },
                {
                    'name': 'description',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/description',
                    'mutiple': false
                },
                {
                    'name': 'issued',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/issued',
                    'mutiple': false
                },
                {
                    'name': 'modified',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/modified',
                    'mutiple': false
                },
                {
                    'name': 'language',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/language',
                    'mutiple': false
                },
                {
                    'name': 'license',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/license',
                    'mutiple': false
                },
                {
                    'name': 'rigths',
                    'prefix': 'dct',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/rights',
                    'mutiple': false
                },
                {
                    'name': 'accessURL',
                    'prefix': 'dcat',
                    'required': 'mandatory',
                    'Range': 'Resource',
                    'URI': 'http://www.w3.org/ns/dcat#accessURL',
                    'mutiple': false
                },
                {
                    'name': 'downloadURL',
                    'prefix': 'dcat',
                    'required': 'optional',
                    'Range': 'Resource',
                    'URI': 'http://www.w3.org/ns/dcat#downloadURL',
                    'mutiple': false
                },
                {
                    'name': 'mediaType',
                    'prefix': 'dcat',
                    'required': 'optional',
                    'Range': 'Anything',
                    'URI': 'http://www.w3.org/ns/dcat#mediaType',
                    'mutiple': false
                },
                {
                    'name': 'format',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'Anything',
                    'URI': 'http://purl.org/dc/terms/format',
                    'mutiple': false
                },
                {
                    'name': 'byteSize',
                    'prefix': 'dcat',
                    'required': 'optional',
                    'Range': 'Decimal',
                    'URI': 'http://www.w3.org/ns/dcat#byteSize',
                    'mutiple': false
                }
            ]
        },
        'Concept': {
            'class': 'Concept',
            'required': 'mandatory',
            'mutiple': true,
            'URI': 'http://www.w3.org/2004/02/skos/core#Concept',
            'properties': [
                {
                    'name': 'prefLabel',
                    'prefix': 'skos',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://www.w3.org/2004/02/skos/core#prefLabel',
                    'mutiple': false
                }
            ]
        },
        'ConceptScheme': {
            'class': 'ConceptScheme',
            'required': 'mandatory',
            'mutiple': false,
            'URI': 'http://www.w3.org/2004/02/skos/core#ConceptScheme',
            'properties': [
                {
                    'name': 'title',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/title',
                    'mutiple': false
                }
            ]
        },
        'CatalogRecord': {
            'class': 'CatalogRecord',
            'required': 'optional',
            'mutiple': false,
            'URI': 'http://www.w3.org/ns/dcat#CatalogRecord',
            'properties': [
                {
                    'name': 'title',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/title',
                    'mutiple': false
                },
                {
                    'name': 'description',
                    'prefix': 'dct',
                    'required': 'mandatory',
                    'Range': 'Literal',
                    'URI': 'http://purl.org/dc/terms/description',
                    'mutiple': false
                },
                {
                    'name': 'issued',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/issued',
                    'mutiple': false
                },
                {
                    'name': 'modified',
                    'prefix': 'dct',
                    'required': 'recommended',
                    'Range': 'DateTime',
                    'URI': 'http://purl.org/dc/terms/modified',
                    'mutiple': false
                },
                {
                    'name': 'primaryTopic',
                    'prefix': 'foaf',
                    'required': 'mandatory',
                    'Range': 'http://www.w3.org/ns/dcat#Dataset',
                    'URI': 'http://xmlns.com/foaf/0.1/primaryTopic',
                    'mutiple': false
                }
            ]
        },
        'LinguisticSystem': {
            'class': 'LinguisticSystem',
            'required': 'optional',
            'mutiple': false,
            'URI': 'http://purl.org/dc/terms/LinguisticSystem',
            'properties': [

            ]
        },
        'LicenseDocument': {
            'class': 'LicenseDocument',
            'required': 'recommended',
            'mutiple': false,
            'URI': 'http://purl.org/dc/terms/LicenseDocument',
            'properties': [

            ]
        },
        'Frequency': {
            'class': 'Frequency',
            'required': 'optional',
            'mutiple': false,
            'URI': 'http://purl.org/dc/terms/Frequency',
            'properties': [

            ]
        },
        'Document': {
            'class': 'Document',
            'required': 'optional',
            'mutiple': false,
            'URI': 'http://xmlns.com/foaf/0.1/Document',
            'properties': [

            ]
        }
    };

    init();

})();

	