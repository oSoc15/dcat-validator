(function(){
	var feedback, text, alert, success, uploadFileValue, uploadError, url;

	function init(){
		alert = $("<div>", {class:"alert alert-danger", role:"alert"});
		var tab1 = $("#tab1");
		if(tab1){
			initValidateUrl();
		}
		var tab2 = $("#tab2");
		if(tab2){
			showUploadBtn();
			initValidateUpload();
		}

		var tab3 = $("#tab3");
		if(tab3){
			initValidateDirectInput();
		}
	}

	// ==========================================================================================
    // ========================================= TAB 1 ==========================================
    // ==========================================================================================

    var urlValue, urlFinal;

    function initValidateUrl(){
    	$("input[name='actionTab1']").on("click", validateUrlFields);
    }

    function validateUrlFields(){
    	event.preventDefault();

        clearBorders("", "tab2", "tab3");
        clearFeedback();

        if($(".tab1Input").val() == "" || $(".formatSelectTab1").val() == ""){
            alert.text("Please fill in all the required fields to validate by URL.");

            validateField(".tab1Input");
            validateField(".formatSelectTab1");

            $(".startContent").prepend(alert);

        }else{
            url = $(".tab1Input").val();
            getData(validateUrl);
        }
    }

    function getData(callback){
    	$.get(url, function (data){ 
	    	urlValue = data;
	    	callback();
	    }).fail(function(){
	    	alert.text("The URI you have entered is not valid."); 
			$(".startContent").prepend(alert);
	    });
    }

    function validateUrl(){
    	if(urlValue == ""){
    		alert.text("The URI you have entered has nothing to validate."); 
			$(".startContent").prepend(alert);
    	}else{
    		selectParserTab1(urlValue);
    	}
    }

    function selectParserTab1(value){
    	if($(".formatSelectTab1").val() == "jsonld"){
            convertFormat(rdf.parseJsonLd, value);
        }else if($(".formatSelectTab1").val() == "xml"){
        	convertFormat(rdf.parseRdfXml, value);
        }else if($(".formatSelectTab1").val() == "ttl"){
        	feedback = validate(value, afterValidate);
        }
    }

	// ==========================================================================================
    // ========================================= TAB 2 ==========================================
    // ==========================================================================================

	//tab2 - feedback which file
	function showUploadBtn(){
        $(document).on('change', '.btn-file :file', function() {
            var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);
        });

        $(document).ready( function() {
            $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
                var feedback = $(".feedbackInput");
                feedback.val(label);
            });
        });
    }

    //tab2
	function initValidateUpload(){
        $("input[name='actionTab2']").on("click", validateUpload);
    }

    //tab2
    function validateUpload(event){
        event.preventDefault();
        var file = document.querySelector(".inputFile").files[0];
        if(file){
            var fileExt = document.querySelector(".inputFile").files[0].name.split('.').pop();
        }

        clearBorders("tab1", "", "tab3");
        clearFeedback();

        if($(".feedbackInput").val() == "" || $(".formatTab2").val() == "") {
        	validateField(".feedbackInput");
            validateField(".formatTab2");

            uploadFileValue = "Please fill in all the required fields in order to validate by file upload.";
            uploadError = $("<div>", {class:"alert alert-danger", role:"alert"});
            uploadError.text(uploadFileValue);
            $(".startContent").prepend(uploadError);
        }else{
        	if($(".formatTab2").val() == fileExt){
        		var reader = new FileReader();
	            reader.readAsText(file, "UTF-8");
	            reader.onload = function (evt) {
	                uploadFileValue = evt.target.result;

	                selectParserTab2(fileExt);

	                $(".feedbackInput").css("border", "1px solid #CCC");
	            }
	            reader.onerror = function (evt) {
	                uploadFileValue = "The file cannot be validated.";
	                uploadError = $("<div>", {class:"alert alert-danger", role:"alert"});
	                uploadError.text(uploadFileValue);
	                $(".startContent").prepend(uploadError);
	            }
        	}else{
        		alert.text("Your chosen format is not the same as your inserted file");
            	$(".startContent").prepend(alert);
        	}
        }
    }

    function selectParserTab2(fileExt){
    	if(fileExt == "jsonld" && $(".formatTab2").val() == "jsonld"){
            convertFormat(rdf.parseJsonLd, uploadFileValue);
        }else if(fileExt == "xml" && $(".formatTab2").val() == "xml"){
            convertFormat(rdf.parseRdfXml, uploadFileValue);
        }else if(fileExt == "ttl" && $(".formatTab2").val() == "ttl"){
        	feedback = validate(uploadFileValue, afterValidate);
        }
    }

    // ==========================================================================================
    // ========================================= TAB 3 ==========================================
    // ==========================================================================================

    //tab3
    function initValidateDirectInput(){
        $("input[name='actionTab3']").on("click", validateDirectInput);
    }

    //tab3
    function validateDirectInput(event){
        event.preventDefault();

        clearBorders("tab1", "tab2", "");
        clearFeedback();

        if($(".tab3Textarea").val() == "" || $(".formatTab3").val() == ""){
            alert.text("Please fill in the required fields for validating by manually input of the code.");
            $(".startContent").prepend(alert);
            
            validateField(".tab3Textarea");
            validateField(".formatTab3");

        }else{
            text = $(".tab3Textarea").val();
            selectParserTab3(text);
        }
    }

    //tab3
    function selectParserTab3(text){
	    catchErrorTab3(".formatTab3", "xml", rdf.parseRdfXml, text);
	    catchErrorTab3(".formatTab3", "jsonld", rdf.parseJsonLd, text);
	    catchErrorTab3(".formatTab3", "ttl", rdf.parseTurtle, text);
        // if($(".formatTab3").val() == "ttl"){
        // 	feedback = validate(text, afterValidate);
        // }
    }

    // ==========================================================================================
    // =================================== GENERAL VALIDATE =====================================
    // ==========================================================================================

    function catchErrorTab3(tab, format, rdfFunction, value){
    	if($(tab).val() == format){
	    	try{
	    		convertFormat(rdfFunction, value);
	    	}catch(error){
	    		alert.text("The format you inserted is not the same as the selected format.");
				$(".startContent").prepend(alert);
	    	}
	    }
    }

    //general validate
    function validateField(field){
    	if($(field).val() == ""){
        	$(field).css("border", "1px solid #D75452");
        }else{
        	$(field).css("border", "1px solid #CCC");
        }
    }

    //general validate
    function convertFormat(parseFunction, fileValue){
    	parseFunction(fileValue, function (graph) {
    	try{
    		
	            rdf.serializeTurtle(graph, function(fileValue){
	                feedback = validate(fileValue, afterValidate);
	            });
	        
    	}catch(error){
    		alert.text("The format you inserted is not the same as the selected format.");
			$(".startContent").prepend(alert);
    	}
    	});
    }

    //general validate
    function afterValidate(){
        alert = $("<div>", {class:"alert alert-danger", role:"alert"});
        success = $("<div>", {class:"alert alert-success", role:"alert"});
        warning = $("<div>", {class:"alert alert-warning", role:"alert"});
        $(".tab3Textarea").css("border", "1px solid #CCC");
        $(".formatTab3").css("border", "1px solid #CCC");

        clearFeedback();
        showFeedback();
    }

    function clearBorders(tab1, tab2, tab3){
    	if(tab1 == "tab1"){

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

    //general validate
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

    //general - validate
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

    //general validate
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

     init();

})();

	