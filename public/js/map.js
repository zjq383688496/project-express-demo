function initMap() {
	var mapOptions = {
		zoom: 4,
		center: {lat: -33, lng: 151},
		disableDefaultUI: true
	}
  var map = new google.maps.Map(document.getElementById("map"), mapOptions);
}
initMap();