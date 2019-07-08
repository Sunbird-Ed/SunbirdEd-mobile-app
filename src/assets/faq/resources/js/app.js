$(document).ready(function(){
    // Toggle plus minus icon on show hide of collapse element
     $(document).on('show.bs.collapse', ".collapse", function() {
        $(this).parent().find(".btn-arrow").addClass("rotate");
        $(this).parent().find(".panel-title").css({"color":"#024F9D"})

    }).on('hide.bs.collapse', ".collapse", function() {
        $(this).parent().find(".btn-arrow").removeClass("rotate");
        $(this).parent().find(".panel-title").css({"color":"inherit"});
    });

    $(document).on( 'click','[id="btn-yes"]',function(){
        var value = {};
        console.log("Yes-Clicked");
        value.action = "yes-clicked"
        value.position = Number($(this).parent().parent().attr("id").substr(-1)) +1;
        value.value = {};
        value.value.topic = $(this).parent().parent().parent().find(".panel-title").first().text().trim();
        value.value.description = $(this).parent().parent().find("p").first().text();
        
        window.parent.postMessage(value,"*");
        $(this).parent().find('button').hide();
        $(this).parent().find("p").first().hide();
        $(this).parent().children().last().removeAttr('hidden');

    })

    $(document).on( 'click','[id="btn-no"]',function(){
        console.log("No-Clicked");
        var value = {};
        value.action = "no-clicked"
        value.position = Number($(this).parent().parent().attr("id").substr(-1)) +1;
        value.value = {};
        value.value.topic = $(this).parent().parent().parent().find(".panel-title").first().text().trim();
        value.value.description = $(this).parent().parent().find("p").first().text();
        
        window.parent.postMessage(value,"*");
        $(this).parent().hide();
        $(this).parent().parent().find('.panel-info').removeAttr('hidden');
    })

    $(document).on( 'keypress','.input-text',function() {
        if($(this).val().length > 999) {
            //display your warinig the way you chose
            console.log('MaxLength Reached');
        }
    });
    $(document).on( 'submit','#know-more-form',function(e) {
        e.preventDefault();
        var inputVal = $( this )[0][0].value; // resolves to current input element.
        if(inputVal && inputVal.length){
            var value = {};
            value.action = "no-clicked"
            value.position = Number($(this).parent().parent().attr("id").substr(-1)) +1;
            value.value = {};
            value.value.topic = $(this).parent().parent().parent().find(".panel-title").first().text().trim();
            value.value.description = $(this).parent().parent().find("p").first().text();
            value.value.knowMoreText=inputVal;
            window.parent.postMessage(value,"*");
            
        }
        $(this).parent().children().last().removeAttr('hidden');
        $(this).parent().css("padding", "20px");                
        $(this).parent().css("height", "100px");
        $(this).parent().children().last().removeAttr('hidden');
        $(this).parent().children().not('.no-clicked').hide();


    });
    $(document).on('click', '.send-email', function(){
        var value = {};
        value.action = "report-other-issues-clicked";
        window.parent.postMessage(value,"*");
        
        if(window.selectedLang){
            window.location.href = "reportIssue.html?selectedlang="+window.selectedLang;
        } else{
            window.location.href = "reportIssue.html"
        }
        console.log(window.faqSelectedLang);
    });

    $(document).on( 'submit','#send-email-form',function(e) {
        e.preventDefault();
        $(this).removeClass('selected');
        var inputVal = $( this )[0][0].value; // resolves to current input element.
            var value = {};
            value.action = "initiate-email-clicked";
            value.value = {};
            value.initiateEmailBody=inputVal;
            window.parent.postMessage(value,"*");
    });
    $(document).on( 'keyup','.input-text-form',function() {
        var maxLength = 1000;
        var length = $(this).val().length;
        var length = maxLength-length;
        $('#charleft').text(length);
    });
});