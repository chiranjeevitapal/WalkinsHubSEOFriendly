function searchByLocation() {
    var location = $("#location").val();
    var isFresher = $("#fresher").is(":checked");
    if (location == "" && !isFresher) {
        window.location.href = "/";
    } else if (location != "" && !isFresher) {
        window.location.href = "/jobs/" + location;
    } else if (location == "" && isFresher) {
        window.location.href = "/jobs/fresher";
    } else if (location != "" && isFresher) {
        window.location.href = "/fresherjobs/" + location;
    }
}


$(function () {
    var availableTags = [
        "Ahmedabad",
        "Ahmedabad", 
        "Airoli",
        "Akola",
        "Ambur",
        "Amritsar",
        "Anand", 
        "Assam",
        "Aurangabad",
        "Bangalore",
        "Bhavnagar",
        "Bhilai",
        "Bhopal",
        "Bhubaneswar",
        "Bihar",
        "Bilaspur", 
        "Chandigarh",
        "Chennai",
        "Cochin",
        "Coimbatore",
        "Dadra and Nagar Haveli",
        "Delhi",
        "Dhubri",
        "Dibrugarh",
        "Faridabad",
        "Gandhidham",
        "Ghaziabad",
        "Gujarat",
        "Gurgaon",
        "Guwahati",
        "Haryana",
        "Hyderabad",
        "Indore",
        "Jaipur",
        "Jorhat",
        "Kakinada",
        "Kanpur",
        "Katihar",
        "Kerala",
        "Khambhat",
        "Kharagpur",
        "Kochi",
        "Kohima",
        "Kolhapur",
        "Kolkata",
        "Kottayam",
        "Kullu Valley",
        "Lucknow",
        "Machilipatnam",
        "Madurai",
        "Manesar",
        "Mangalore",
        "Manipal",
        "Meerut",
        "Mehsana",
        "Mohali",
        "Motihari",
        "Mumbai",
        "Mysore",
        "NCR",
        "Nagpur",
        "Nashik",
        "Nasik",
        "Navi Mumbai",
        "New Delhi",
        "Noida",
        "Noida/Gurgaon",
        "Oman",
        "Panjim",
        "Patna",
        "Pauri Garwhal",
        "Pondicherry",
        "Pune",
        "Raipur", 
        "Raisen & Hoshangabad",
        "Ranchi",
        "Ranipet",
        "Rourkela",
        "Salem",
        "Secunderabad",
        "Sevoor",
        "Surat", 
        "Thane",
        "Thiruvananthapuram",
        "Thoothukudi",
        "Tirupati",
        "Tirupatur",
        "Trichy",
        "Trivandrum",
        "Tuticorin",
        "Vadodara",
        "Vadodara", 
        "Vellore",
        "Visakhapatnam",
        "Vizag",
        "Wankaner"
    ];
    $("#location").autocomplete({
        source: availableTags
    });
});