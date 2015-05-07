var letters = "abcdefghijklmnopqrstuvwxyz",
	mainCircle = { x: 900, y: 500 ,r: 400 },
 	startPositions = { top: 7*Math.PI/6, bottom: Math.PI/6 },
	colorSet = d3.scale.category20c(), 
	radiiSet = [
		[5, 2, 2, 6, 4, 5, 7, 8, 1, 5],
		[2, 2, 5, 3, 7, 2, 10, 4, 3, 7],
		[5, 6, 2, 1, 4, 9, 3, 8, 6, 1],
		[9, 4, 2, 6, 7, 5, 4, 2, 1, 5,],
		[5, 4, 5, 6, 4, 6, 4, 2, 6, 3,],
	];

var svg = d3.select("body")
	.append("svg")
	.attr("width", "100%")
	.attr("height", 1600);

svg.append("g").attr("id", "links")
svg.append("g").attr("id", "nodes")

var generateData = function(centerNode){

	// initialize dataset
	var data = { nodes: [], links: [] };
	var index = 0;
	if ( typeof centerNode !== "undefined"){
		data.nodes.push(centerNode);
		index += 1;
	}

	for (var prop in startPositions){

		var radii = radiiSet[Math.ceil(Math.random()*4)]

		for (var i = 0; i < 10; i++) {

			// create random domain name
			var domainName = "";
			var stringLength = Math.round(Math.random() * 7 + 3);
			for (var j = 0; j < stringLength; j++) {
				domainName += letters.charAt(Math.round(Math.random() * letters.length))
			}
			domainName += ".com"

			// calculate angle for node positions
			var angle = ((radii.slice(0,i+1).reduce(function(a,b){return a+b;}) - radii[i]/2.0)/70) * Math.PI + startPositions[prop];

			// add new node with properties
			data.nodes.push({ 
				name: 				domainName, 
				position: 			"outer", 
				r: 					radii[i]*9, 
				xInit: 				mainCircle.r * Math.cos(angle) + mainCircle.x, 
				yInit: 				mainCircle.r * Math.sin(angle) + mainCircle.y, 
				xFinal: 			1000 * Math.cos(angle) + mainCircle.x, 
				yFinal: 			1000 * Math.sin(angle) + mainCircle.y, 
				c: 					colorSet(Math.round(Math.random() * 20)), 
			});

			data.links.push({ target: index });

			index += 1;
		}
	}
	console.log(data)
	return data;
};

var render = function(data){

	var nodes = svg.select("#nodes").selectAll(".node")
		.data(data.nodes)
		.enter()
		.append("circle")
		.attr("class", function(d){ return d.position; })
		.attr("cx", mainCircle.x)
		.attr("cy", mainCircle.y)
		.attr("r", 0)
		.attr("opacity", 1)
		.attr("fill", function(d){ return d.c; })
		.on("click", function(d){

			// move clicked node to center
			d3.select(this)
				.transition()
				.duration(1000)
				.attr("cx", mainCircle.x)
				.attr("cy", mainCircle.y)
				.attr("r", 50)
				.attr("class", "center");

			// fade out links
			d3.selectAll("svg line")
				.transition()
				.duration(500)
				.attr("opacity", 0)
				.remove();

			// clear other nodes
			var self = this;
			var circles = d3.selectAll("svg circle.outer");

			circles.filter(function(d) { return self != this; })
				.transition()
				.delay(function(d,i){ return Math.random()*200+200})
				.duration(1000)
				.attr("opacity", 0)
				.attr("cx", function(d){ return d.xFinal;})
				.attr("cy", function(d){ return d.yFinal;})
				.remove();

			// fade out center circle
			d3.selectAll("svg circle.center")
				.transition()
				.duration(1000)
				.attr("r", 0)
				.remove();

			// add url to breadcrumb, clear list if max length is reached
			var list = document.querySelectorAll("#breadcrumbs li")
			if (list.length == 10){
				var node = document.getElementById("breadcrumbs");
				node.innerHTML = '<li></li>';
			} else {
				d3.select("#breadcrumbs")
					.insert("li", ":first-child")
					.text(d.name)
					.transition()
					.duration(1000);
			}

			// redraw vis with new dataset
			setTimeout(function(){ redraw(); }, 1000)

		})
		.transition()
		.delay(function(d,i){ return Math.random()*200+200})
		.duration(2000)
		.ease("elastic")
		.attr("cx", function(d){ return d.xInit; })
		.attr("cy", function(d){ return d.yInit; })
		.attr("r", function(d){ return d.r; });

	var links = svg.select("#links").selectAll(".link")
		.data(data.links)
		.enter()
		.append("line")
		.attr("x1", mainCircle.x)
		.attr("y1", mainCircle.y)
		.attr("x2", mainCircle.x)
		.attr("y2", mainCircle.y)
		.transition()
		.delay(200)
		.duration(1500)
		.attr("class", "link")
		.attr("x2", function(l){
			var target_node = data.nodes.filter(function(d,i){ return i==l.target })[0];
			return target_node.xInit
		})
		.attr("y2", function(l){
			var target_node = data.nodes.filter(function(d,i){ return i==l.target })[0];
			return target_node.yInit
		})
		.attr("fill", "none")
		.attr("opacity", 0.8)
		.attr("stroke", "gray");
};

var redraw = function(){
	data = generateData();
	render(data);
};

(function (){
	var data = generateData({name:'init.com', position: "center", xInit: mainCircle.x, yInit: mainCircle.y, x_end: -50, y_end: -50, r: 50 });
	render(data);	
}());
