(function(){
	var feedback, text, alert, success, uploadFileValue, uploadError, url, list, elementContainer, expandBtns, panelFooters;
    var i = 0;

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

        $(document).on({
            ajaxStart: function() { 
                $(".spinner").css("display", "block");

            },
            ajaxStop: function() { 
                $(".spinner").css("display", "none"); 
            }    
        });
	}

	// ==========================================================================================
    // ========================================= TAB 1 ==========================================
    // ==========================================================================================

    var urlValue, urlFinal;

    function initValidateUrl(){
    	$("input[name='actionTab1']").on("click", validateUrlFields);
    }

    function validateUrlFields(event){
    	event.preventDefault();

        clearBorders("", "tab2", "tab3");
        clearFeedback();

        if($(".tab1Input").val() == "" || $(".formatSelectTab1").val() == ""){
            alert.text("Please fill in all the fields to validate by URL.");

            validateField(".tab1Input");
            validateField(".formatSelectTab1");

            $("#tab1").prepend(alert);

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
            $(".formatSelectTab1").css("border", "1px solid #CCC");
            $(".tab1Input").css("border", "1px solid #D75452"); 
			$("#tab1").prepend(alert);
	    });
    }

    function validateUrl(){
    	if(urlValue == ""){
    		alert.text("The URI you have entered has nothing to validate."); 
			$("#tab1").prepend(alert);
    	}else{
    		selectParserTab1(urlValue);
    	}
    }

    function selectParserTab1(value){
        //for firefox only
        if($(".formatSelectTab1").val() == "xml"){
            var xhr = $.ajax({
                type:"HEAD",
                dataType:text,
                url:$(".tab1Input").val(),
                success:function(){
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
        } else{
            catchError($(".formatSelectTab1").val() == "jsonld", rdf.parseJsonLd, value, ".formatSelectTab1", ".tab1Input", "#tab1");
            catchError($(".formatSelectTab1").val() == "ttl", rdf.parseTurtle, value, ".formatSelectTab1", ".tab1Input", "#tab1");
        }
    }

	// ==========================================================================================
    // ========================================= TAB 2 ==========================================
    // ==========================================================================================

	//tab2 - feedback which file
	function showUploadBtn(event){
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
            $("#tab2").prepend(uploadError);
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
	                $("#tab2").prepend(uploadError);
	            }
        	}else{
        		alert.text("The format you inserted is not the same as the selected format.");
                $(".formatTab2").css("border", "1px solid #D75452");
                $(".feedbackInput").css("border", "1px solid #CCC");
            	$("#tab2").prepend(alert);
        	}
        }
    }

    function selectParserTab2(fileExt){
        catchError(fileExt == "xml" && $(".formatTab2").val() == "xml", rdf.parseRdfXml, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "jsonld" && $(".formatTab2").val() == "jsonld", rdf.parseJsonLd, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
	    catchError(fileExt == "ttl" && $(".formatTab2").val() == "ttl", rdf.parseTurtle, uploadFileValue, ".formatTab2", ".feedbackInput", "#tab2");
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
            $("#tab3").prepend(alert);
            
            validateField(".tab3Textarea");
            validateField(".formatTab3");

        }else{
            text = $(".tab3Textarea").val();
            selectParserTab3(text);
        }
    }

    //tab3
    function selectParserTab3(text){
        var sMyString = "<a id=\"a\"><b id=\"b\">hey!<\/b><\/a>";
        var oParser = new DOMParser();
        var oDOM = oParser.parseFromString($(".tab3Textarea").val(), "text/xml");
        // print the name of the root element or error message
        var checkFormat = oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName;

        if(checkFormat == "error while parsing"){
            if(checkFormat != "rdf:RDF"){
                alert.text("The format you inserted is not the same as the selected format.");
                $(".formatTab3").css("border", "1px solid #D75452");
                $(".tab3Textarea").css("border", "1px solid #CCC");
                $("#tab3").prepend(alert);
            }
        }
        
	    catchError($(".formatTab3").val() == "xml" && checkFormat == "rdf:RDF", rdf.parseRdfXml, text, ".formatTab3", ".tab3Textarea", "#tab3");
	    catchError($(".formatTab3").val() == "jsonld", rdf.parseJsonLd, text, ".formatTab3", ".tab3Textarea", "#tab3");
	    catchError($(".formatTab3").val() == "ttl", rdf.parseTurtle, text, ".formatTab3", ".tab3Textarea", "#tab3");
    }

    // ==========================================================================================
    // =================================== GENERAL VALIDATE =====================================
    // ==========================================================================================

    //general validate
    function catchError(condition, rdfFunction, value, format, format2, tab){
    	if(condition){
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

    //general validate
    function validateField(field){
    	if($(field).val() == ""){
        	$(field).css("border", "1px solid #D75452");
        }else{
        	$(field).css("border", "1px solid #CCC");
        }
    }

    //general validate
    function convertFormat(parseFunction, fileValue, format, format2, tab){
    	parseFunction(fileValue, function (graph) {
	    	try{
                $(".spinner").css("display", "block");
	            rdf.serializeTurtle(graph, function(fileValue){
                    $(".spinner").css("display", "block");
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

    //general validate
    function afterValidate(){
        alert = $("<div>", {class:"alert alert-danger", role:"alert"});
        success = $("<div>", {class:"alert alert-success", role:"alert"});
        warning = $("<div>", {class:"alert alert-warning", role:"alert"});
        clearBorders("tab1", "tab2", "tab3");
        $(".spinner").css("display", "none");

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
    function showFeedBackMessage(element, valid, rest){
        elementContainer = $("<div>", {class:"container elementContainer"});
        element.text("Your DCAT - feed is " + valid + "valid. You have " + rest);
        elementContainer.append(element);
        elementContainer.insertAfter($(".startContent"));
    }

    //general - validate
    function showErrorWarning(type, container, glyph){
        for(message in feedback[type]){
            i++;
            var panel = $("<div>", {class:"panel panel-default"});
            var panelBody = $("<div>", {class:"panel-body down" + i});
            var panelFooter = $("<div>", {class:"panel-footer panel-footer-down" + i});
            panel.append(panelBody);
            panel.append(panelFooter);
            container.append(panel);
            var list2 = $("<ul>", {class:"list"});
            panelFooter.append(list2);
            var error = $ ("<p>", {class:"errorTitle"});
            var expandError = $('<span></span>', {class:"glyphicon arrow glyphicon-chevron-down"});
            error.append('<span class="glyphicon glyphicon-' + glyph +'-sign"></span>');
            error.append("<strong>Resource: </strong>" + message);
            error.append(expandError);
            panelBody.append(error);

            for(message2 in feedback[type][message]){
                var listItem = $("<li>");
                listItem.append(feedback[type][message][message2].error);
                list2.append(listItem);
            }
        }
    }

    //general validate
    function showFeedback(){
        var warningsContainer = $("<div>", {class:"container warnings"});
        var errorsContainer = $("<div>", {class:"container errors"});
        var fErrors = Object.keys(feedback["errors"]).length;
        var fWarnings = Object.keys(feedback["warnings"]).length;

        if(fErrors == 0 && fWarnings == 0){
        	showFeedBackMessage(success, "", "no errors and no warnings.");
        }else if((fErrors != 0 && fWarnings != 0) || (fErrors != 0 && fWarnings == 0)){
			showFeedBackMessage(alert, "not ", fErrors + " error(s) and " + fWarnings + " warning(s). You can find your error(s) or warning(s) below the page.");
		}else if(fErrors == 0 && fWarnings != 0 ){
			showFeedBackMessage(warning, "", "no errors, but " + fWarnings + " warning(s). You can see your warning(s) below the page.");
        }

        $('html, body').animate({
            scrollTop: $(".alert").offset().top
        }, 500);

        if(fWarnings != 0){
            var header2 = $("<h2>");
            header2.text("Warnings");
            warningsContainer.append(header2);
            
            showErrorWarning("warnings", warningsContainer, "warning");

            warningsContainer.insertAfter(elementContainer);
        }

        if(fErrors != 0){         
            var header = $("<h2>");
            header.text("Errors");
            errorsContainer.append(header);

            showErrorWarning("errors", errorsContainer, "remove");

            errorsContainer.insertAfter(elementContainer);
        }

        panelFooters = document.querySelectorAll(".panel-footer");
        if(panelFooters){
            [].forEach.call(panelFooters, function(footer){
                $(footer).hide();
            });
        }
        expandBtns = document.querySelectorAll(".panel-body");
        if(expandBtns){
            dropDown(expandBtns);
        }
    }

    //general validate
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

	