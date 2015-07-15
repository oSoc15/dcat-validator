(function(){
	var feedback, text, alert, success, uploadFileValue, uploadError, url, list, list2;

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
        catchError($(".formatSelectTab1").val() == "xml", rdf.parseRdfXml, value, ".formatSelectTab1");
	    catchError($(".formatSelectTab1").val() == "jsonld", rdf.parseJsonLd, value, ".formatSelectTab1");
	    catchError($(".formatSelectTab1").val() == "ttl", rdf.parseTurtle, value, ".formatSelectTab1");
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
        var file = $(".inputFile")[0].files[0];
        if(file){
            var fileExt = file.name.split('.').pop();
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
        		alert.text("Your chosen format is not the same as your inserted file.");
                $(".formatTab2").css("border", "1px solid #D75452");
            	$(".startContent").prepend(alert);
        	}
        }
    }

    function selectParserTab2(fileExt){
    	catchError(fileExt == "xml" && $(".formatTab2").val() == "xml", rdf.parseRdfXml, uploadFileValue, ".formatTab2");
	    catchError(fileExt == "jsonld" && $(".formatTab2").val() == "jsonld", rdf.parseJsonLd, uploadFileValue, ".formatTab2");
	    catchError(fileExt == "ttl" && $(".formatTab2").val() == "ttl", rdf.parseTurtle, uploadFileValue, ".formatTab2");
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
	    catchError($(".formatTab3").val() == "xml", rdf.parseRdfXml, text, ".formatTab3");
	    catchError($(".formatTab3").val() == "jsonld", rdf.parseJsonLd, text, ".formatTab3");
	    catchError($(".formatTab3").val() == "ttl", rdf.parseTurtle, text, ".formatTab3");
    }

    // ==========================================================================================
    // =================================== GENERAL VALIDATE =====================================
    // ==========================================================================================

    //general validate
    function catchError(condition, rdfFunction, value, format){
    	if(condition){
    		try{
    			convertFormat(rdfFunction, value, format);
    		}catch(error){
    			alert.text("The format you inserted is not the same as the selected format.");
                $(format).css("border", "1px solid #D75452");
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
    function convertFormat(parseFunction, fileValue, format){
    	parseFunction(fileValue, function (graph) {
	    	try{
	            rdf.serializeTurtle(graph, function(fileValue){
	                feedback = validate(fileValue, afterValidate);
	            });  
	    	}catch(error){
	    		alert.text("The format you inserted is not the same as the selected format.");
                $(format).css("border", "1px solid #D75452");
				$(".startContent").prepend(alert);
	    	}
    	});
    }

    //general validate
    function afterValidate(){
        alert = $("<div>", {class:"alert alert-danger", role:"alert"});
        success = $("<div>", {class:"alert alert-success", role:"alert"});
        warning = $("<div>", {class:"alert alert-warning", role:"alert"});
        clearBorders("tab1", "tab2", "tab3");

        clearFeedback();
        showFeedback();
    }

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
    function showErrorWarning(type, glyph, value, listContainer){
        var listItem = $("<li>");
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
        listItem.append(rowStart);
        listContainer.append(listItem);
    }

    //general - validate
    function showFeedBackMessage(element, valid, rest){
    	element.text("Your DCAT - feed is " + valid + "valid. You have " + rest);
        $(".startContent").prepend(element);
    }

    //general validate
    function showFeedback(){
        var warningsContainer = $("<div>", {class:"container warnings"});
        var errorsContainer = $("<div>", {class:"container errors"});
        var fErrors = feedback['errors'].length;
        var fWarnings = feedback['warnings'].length;

        if(fErrors == 0 && fWarnings == 0){
        	showFeedBackMessage(success, "", "no errors and no warnings");
        }else if((fErrors != 0 && fWarnings != 0) || (fErrors != 0 && fWarnings == 0)){
			showFeedBackMessage(alert, "not ", fErrors + " error(s) and " + fWarnings + " warning(s). You can find your error(s) or warning(s) below the page.");
		}else if(fErrors == 0 && fWarnings != 0 ){
			showFeedBackMessage(warning, "", "no errors, but " + fWarnings + " warning(s). You can see your warning(s) below the page.");
        }

        if(fWarnings != 0){
            var header2 = $("<h2>");
            header2.text("Warnings");
            list2 = $("<ul>");
            warningsContainer.append(header2);
            warningsContainer.append(list2);
            $.each(feedback["warnings"], function(key, value){
                showErrorWarning("warning", "warning", value, list2);
            });
            warningsContainer.insertAfter($(".startContent"));
        }

        if(fErrors != 0){         
            var header = $("<h2>");
            header.text("Errors");
            list = $("<ul>");
            errorsContainer.append(header);
            errorsContainer.append(list);
            $.each(feedback["errors"], function(key, value){
                showErrorWarning("error", "remove", value, list);                
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

	