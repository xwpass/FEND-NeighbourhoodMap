

// List of my favorite places in San Francisco
var locations = [
	{
		name:'Tavola',
		address: '1829 Robson Street Vancouver',
		lat: 49.291800,
		lng: -123.135459
	},
	{
		name:'Fable Kitchen',
		address: '1944 W 4th Avenue Vancouver',
		lat: 49.267893,
		lng: -123.148986

	},
	{
		name:'Chambar Restaurant',
		address: '568 Beatty Street Vancouver',
		lat: 49.280115,
		lng: -123.109607

	},
	{
		name:'Number e food',
		address: '1308 Burrard Street Vancouver',
		lat: 49.277715,
		lng: -123.130930
	},
	{
		name:'Tuc Craft Kitchen',
		address: '60 W Cordova St, Vancouver',
		lat: 49.282690,
		lng: -123.106111
	},
	{
		name:'Saj&Co',
		address: '813 Davie St, Vancouver',
		lat: 49.278051,
		lng: -123.127160
	},
	{
		name:'Lupo',
		address: '869 Hamilton St, Vancouver',
		lat: 49.278112,
		lng: -123.117245

	},
	{
		name:'Alibi Room',
		address: '157 Alexander St, Vancouver',
		lat: 49.284286,
		lng: -123.100207
	}
];

//ViewModel
var ViewModel = function() {
	var self= this;
	var map;
	var bounds;
	var mapBounds;
	var info;
	var city=ko.observable('Vancouver BC');
	var markers = [];
	var geocode_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
	var api_key = 'key=AIzaSyDY2XJzXpfTNkVilfINXXtIcGPffPDIJUY';
	var geocode = geocode_url + city() + '&' + api_key;

	self.query = ko.observable('');
	self.articleList = ko.observableArray([]);

	//Initialize Google map
	function initMap() {

	map = new google.maps.Map($('#map')[0],
		{
			mapTypeId: google.maps.MapTypeId.TERRAIN
		});
	info = new google.maps.InfoWindow();

	$.getJSON(geocode, function(data){
		bounds = data.results[0].geometry.bounds;
		mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
			new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng));
		map.fitBounds(mapBounds);
		map.setZoom(12);
	});
	}

	initMap();

	//Location Object
	var Location = function(data, map, markers,info){
		this.name = data.name;
		this.lat = data.lat;
		this.lng = data.lng;
		name_string = String(data.name);

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			title: name_string,
			animation: google.maps.Animation.DROP,
			map: map
		});

		function article(content, url) {
			var self = this;
			self.content = content;
			self.url = url;
		}
		//wiki API
		function wikipediaData() {
			var wikiUrl ='http://en.wikipedia.org/w/api.php?action=opensearch&search=' + data.name + '&format=json&callback=wikiCallback';
			var wikiTimeout = setTimeout(function(){
				$wikiData.text("Fail to load Wiki resources");
			}, 5000);

			$.ajax({
				url: wikiUrl,
				dataType: "jsonp",
				success: function(resp) {
					self. articleList.removeAll();
					var articles = resp[1];

					for (var i=0; i<articles.length; i++){
						articleStr = articles[i];
						var url = 'http://en.wikipedia.org/wiki/' + articleStr;
						self.articleList.push(new article(articleStr, url));
					}

					clearTimeout(wikiTimeout);
				}
			});
		}
		//attach wiki content to infowindow
		function wiki_content(articles){
			var self = this;
			self.name = data.name;
			self.address = data.address;
			var info_content = '<ol>\n';
			info_content ='<h1>'+name+'</h1>'+'<h3>'+address+'</h3>'+'<h4>Wikipedia Articles</h4>';
			if(articles.length === 0) {
				info_content = '<h1>'+name+'</h1>'+'<h3>'+address+'</h3>'+'There is no wikipedia article for this place!';
			}
			for (var i=0; i<articles.length; i++){
				var content = articles[i].content;
				var url = articles[i].url;
				if (articles[i].error){
					info_content += '<h5>' + content + '</h5>';
				}else{
					info_content += '<li><a href="' + url + '">' +content + '</a></li>\n';
				}
			}
			info_content +='</ol>';

			return info_content;
		}

		//marker operator
		google.maps.event.addListener(marker, 'click', function(){
			wikipediaData();
			map.panTo(marker.position);
			info.setContent(
				wiki_content(self.articleList()));
			info.open(map, marker);
		});

		markers.push(marker);

	//end of location object		
	};

	//list binding listener
	self.clickMarker = function(place){
		var name = place.name;
		for (var i in markers) {
			if (markers[i].title == name){
				google.maps.event.trigger(markers[i], 'click');
			}
		}
	};

	//Responsive googlemap for resizing browser
	window.addEventListener('resize', function(){
		map.fitBounds(mapBounds);
		$('#map').height($(window).height());
	});

	//Push into viewmodel list objects
	self.filter = ko.observableArray([]);

	locations.forEach(function(item){
		self.filter.push(new Location(item, map, markers, info));
	});

	//Search bar functionality
	self.search = function(value) {
		self.filter.removeAll();
		for(var i in markers) {
			markers[i].setMap(null);
		}

		for(var z in locations){
			if(locations[z].name.toLowerCase().indexOf(value.toLowerCase())>=0){
				self.filter.push(new Location(locations[z], map, markers, info));
			}
		}
	};

	self.query.subscribe(self.search);

//end of viewmodel	
};

ko.applyBindings(new ViewModel());







