function searchByLocation(){
    var location = $("#location").val();
    var isFresher = $("#fresher").is(":checked");
    if(location == "" && !isFresher){
        window.location.href = "/";
    }else if(location != "" && !isFresher){
        window.location.href = "/jobs/"+location;
    }else if(location == "" && isFresher){
        window.location.href = "/jobs/fresher";
    }else if(location != "" && isFresher){
        window.location.href = "/fresherjobs/"+location;
    }
}

function activateAds(adId){
console.log(adId);
}
