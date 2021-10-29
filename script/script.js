//Home height modifier
$(document).ready(() => {
    const screenHeight = $('#about').height();
    $('#home').css('max-height', screenHeight + 100 + 'px');
    if($(window).scrollTop() > 66){
        scrollAdder()
    }
});

//Scroll handler
$(() => {
    $(document).scroll(scrollToggler);
});

function scrollToggler() {
    const $nav = $(".fixed-top"),
          $navItemBorder = $(".nav-link"),
          $navLinkColor = $(".social-link i");
    
    $nav.toggleClass('scrolled', $(window).scrollTop() > $nav.height());
    $navItemBorder.toggleClass('scrolled', $(window).scrollTop() > $nav.height());
    $navLinkColor.toggleClass('scrolled', $(window).scrollTop() > $nav.height());
}

function scrollAdder() {
    const $nav = $(".fixed-top"),
          $navItemBorder = $(".nav-link"),
          $navLinkColor = $(".social-link i");
    $nav.addClass('scrolled', $(this).scrollTop() > $nav.height());
    $navItemBorder.addClass('scrolled', $(this).scrollTop() > $nav.height());
    $navLinkColor.addClass('scrolled', $(this).scrollTop() > $nav.height());
}

//Theme Switcher
const activeTheme = localStorage.getItem('theme')

if(activeTheme == null){
    setTheme('light')
} else{
    setTheme(activeTheme)
}


const mail = document.getElementById("mail")
const themes = document.getElementsByClassName("theme")

for(var i=0; themes.length > i; i++){
    themes[i].addEventListener('click', function(){
        let mode = this.dataset.mode
        setTheme(mode)
    })
}

function setTheme(mode){
    if(mode === "light"){
        document.getElementById('theme-style').href = "style/theme.css"
        document.getElementById('mail').src = "docs/imgs/web-illustration/web-mail5.png"
    }
    if(mode === "dark"){
        document.getElementById('theme-style').href = "style/default.css"
        document.getElementById('mail').src = "docs/imgs/web-illustration/web-mail6.png"
    }
    localStorage.setItem('theme', mode)
}

//Form Validation and EmailJS
let form = document.getElementById("form");

function success(){
    $("#submit").attr("disabled", true);
    $("#submit").html('<i class="far fa-check-circle fa-2x"></i>')
    $("#status").addClass("success")
    $("#status").html("<div>Message sent successfully.</div>")
}

function error(){
    $("#status").addClass("error")
    $("#status").append("<div>An error occurred while sending the message. But you can still contact me via <a href='mailto:karaca_anil@hotmail.com'>e-mail</a>.</div>")
}

function ajax(method, url, data, success, error) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status === 200) {
        success(xhr.response, xhr.responseType);
        } else {
        error(xhr.status, xhr.response, xhr.responseType);
        }
    };
    xhr.send(data);
}

$(document).ready(function () {
    $("#form").validate({
        errorPlacement: function(error) {
            error.appendTo( "#status" );
        },
        errorElement: "div",
        submitHandler: function(){
            const data = new FormData(form);
            ajax(form.method, form.action, data, success, error);
        },
        onfocusout: false,
        rules: {
            name: {
                required: true,
                minlength: 2,
                maxlength: 50
            },
            subject: {
                required: true,
                minlength: 2,
                maxlength: 50
            },
            message: {
                required: true,
                minlength: 10,
                maxlength: 1000
            }
        },
        messages: {
            name: {
                required: "Please enter your name.",
                minlength: "Your name should be at least 2 characters long.",
                maxlength: "The length of your name must be 50 characters or fewer."
            },
            subject: {
                required: "Please enter a subject.",
                minlength: "Subject should be at least 2 characters long.",
                maxlength: "The length of the subject must be 50 characters or fewer."
            },
            message: {
                required: "Please enter a message.",
                minlength: "Message should be at least 10 characters long.",
                maxlength: "The length of the message must be 1000 characters or fewer."
            }
        }
    });
});