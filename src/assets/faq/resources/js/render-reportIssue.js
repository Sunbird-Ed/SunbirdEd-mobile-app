var selectedLang = getUrlVars()["selectedlang"];
console.log('selected Lang', selectedLang);
$(document).ready(function () {
    var jsonUrl;
    if (selectedLang) {
        jsonUrl = "./resources/res/faq-" + selectedLang.trim() + ".json"
    } else {
        jsonUrl = "./resources/res/faq-en.json"
    }

    console.log(jsonUrl);
    $.getJSON(jsonUrl, function (data) {
        var html = '';
        html += '<div class="help-header-send-email">'
            + '<h4>' + data.constants.reportIssue + '</h4>'
            + '<p>' + data.constants.explainMsg + '</p>'
            + '</div>'
            + '<div class="info-msg-send-email">'
            + '<p>' + data.constants.tellMoreMsg + '</p>'
            + '</div>'
            + '<div class = "send-email-form">'
            + '<form action="#" id ="send-email-form"> '
            + '<div id="textareadiv">'
            + '<textarea type="text" name="moreInfo" placeholder="' + data.constants.typeHere + '" class="input-text-form" maxlength="1000"></textarea>'
            + '<p id="textareainfo"> <span id="charleft">1000</span>' + ' ' + data.constants.charactersLeft + '</p>'
            + '</div>'
            + '<div class="initiate-email-info">'
            + '<p class = "send-email-info">' + data.constants.triggerEmailMsg + '</p>'
            + '<div class = "initiate-email-info-button">'
            + '<input type="submit" value="' + data.constants.initiateEmailButton + '" class="submit-button" id="initiate-email">'
            + '</div>'
            + '</form>'
            + '</div>'

        $('#loading').replaceWith(html);
    });
});

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}