$(document).ready(function(){var t=$(".user-infos"),i=$(".dropdown-user");t.hide(),i.click(function(){var t=$(this).attr("data-for"),i=$(t),o=$(this);i.slideToggle(400,function(){i.is(":visible")?o.html('<i class="glyphicon glyphicon-chevron-up text-muted"></i>'):o.html('<i class="glyphicon glyphicon-chevron-down text-muted"></i>')})}),$('[data-toggle="tooltip"]').tooltip(),$("button").click(function(t){t.preventDefault(),alert("This is a demo.\n :-)")})});
