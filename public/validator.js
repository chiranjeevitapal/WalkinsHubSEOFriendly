$.fn.goValidate=function(){var e=this,i=e.find("input:text"),n={name:{regex:/^[A-Za-z]{3,}$/},pass:{regex:/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/},email:{regex:/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/},phone:{regex:/^[789]\d{9}$/}},a=function(e,i){var a=!0,t="";return!i&&/required/.test(e)?(t="This field is required",a=!1):(e=e.split(/\s/),$.each(e,function(e,s){n[s]&&i&&!n[s].regex.test(i)&&(a=!1,t=n[s].error)})),{isValid:a,error:t}},t=function(e){var i=e.attr("class"),n=e.val(),t=a(i,n);e.removeClass("invalid"),$("#form-error").addClass("hide"),t.isValid?e.popover("hide"):(e.addClass("invalid"),("undefined"==typeof e.data("shown")||0==e.data("shown"))&&e.popover("show"))};return i.keyup(function(){t($(this))}),i.on("shown.bs.popover",function(){$(this).data("shown",!0)}),i.on("hidden.bs.popover",function(){$(this).data("shown",!1)}),e.submit(function(n){i.each(function(){($(this).is(".required")||$(this).hasClass("invalid"))&&t($(this))}),e.find("input.invalid").length&&(n.preventDefault(),$("#form-error").toggleClass("hide"))}),this},$("form").goValidate();
