function searchByLocation(){
    var location = $("#location").val();
    if(location == ""){
        alert("Please enter a location");
    }else{
        window.location.href = "/jobs/"+location;
    }
}