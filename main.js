
var playerCloud;
var fps;
var time = 0;
var images = {}
var bg = {
	menu:true,
	offset:{
		x:0,
		y:0
	},
	spacing:20,
	scaleFactor:0.1,
	land:[],
	clouds:[],
	raindrops:[]
}
function DefaultLand(){
	this.saturation = 1;
	this.flooding = 0;
};

var debug = !(window.location.protocol === "http:" || window.location.protocol === "https://");

function Cloud(x,y,dx,dy,spreadX,spreadY,weight,raining){
	this.x = x,
	this.y = y,
	this.dx = dx,
	this.dy = dy
	this.spreadX = spreadX;
	this.spreadY = spreadY;
	this.weight = weight;
	this.raining = raining;
}
function Raindrop(x,y,variance){
	this.x = x + (Math.random() - 0.5) * variance;
	this.y = y;
	this.l = Math.random() * 10 + 10;
}

function preload(){
	frameRate(30);
	createCanvas(windowWidth,windowHeight);
	$('#defaultCanvas').css("visibility","");
	textAlign(CENTER);
	textSize(24);
	loadingAnimation();
	
	if (!debug){
		music.menu = loadSound('music/Feather Waltz.mp3');
		images.mute = loadImage("mute.png");
		images.play = loadImage("play.png");
	}
}

function setup(){
	textAlign(CENTER);
	textSize(12);
	loading.loaded = true;
	if (!debug){
		music.track = music.menu;
		music.track.play();
		music.isPlaying = true;
		loadTrack();
	}
	playerCloud = new Cloud(windowWidth/2,windowHeight/2,0,0,250,100,1,false);
	for (var i=0;i<8;i++){
		bg.clouds.push(new Cloud(
			windowWidth * Math.random(),
			windowHeight * Math.random()/2,
			0,
			0,
			250 + (Math.random() * 125),
			150 + (Math.random() * 60),
			Math.random()*0.6+0.4,
			false
		));
	}
	fill(255);
	fr = [0,0,0,0,0];
	stroke(255);
}
function draw(){
		time++;
		checkMusic();
		
		//background
		background(33,142,181); //clear blue sky :)
		
		//objects
		spreadWater();
		drawGround();
		for (var raindrop in bg.raindrops){
			moveRaindrop(bg.raindrops[raindrop]);
			drawRaindrop(bg.raindrops[raindrop]);
		}
		for (var cloud in bg.clouds){
			moveCloud(bg.clouds[cloud],true);
			drawCloud(bg.clouds[cloud],true);
		}
		
		//interface
		if (!debug){
			var soundImage = music.isPlaying ? images.play : images.mute;
			image(soundImage,windowWidth-70,windowHeight-70,60,60);
		}
		if (bg.menu) drawMenu();
		calculateFPS();
		text(Math.floor(fps) + "",20,20);
		
		//player
		controls();
		moveCloud(playerCloud,false);
		drawCloud(playerCloud,false);
}

function controls() {
	if (!bg.menu){
		playerCloud.raining = false;
		if (keyIsDown(LEFT_ARROW)) playerCloud.dx -= fps/30;
		if (keyIsDown(RIGHT_ARROW)) playerCloud.dx += fps/30;
		if (keyIsDown(UP_ARROW)) playerCloud.dy -= 0.5 * fps/30;
		if (keyIsDown(DOWN_ARROW)) playerCloud.dy += 0.5 * fps/30;
		playerCloud.raining = keyIsDown(32);
		
		if (mouseIsPressed){
			var dX = mouseX - playerCloud.x + bg.offset.x;
			var dY = mouseY - playerCloud.y;
			var hyp = Math.sqrt(dX*dX + dY*dY);
			
			if (hyp < playerCloud.spreadX/4){
				playerCloud.raining = true;
			} else {
				playerCloud.dx += dX/hyp;
				playerCloud.dy += dY/hyp;
			}
		}
	} else {
		if ((keyIsPressed || mouseIsPressed) && !keyIsDown(77)){
			if (!(mouseX > windowWidth - 80 && mouseY > windowHeight - 80)){
				bg.menu = false;
			}
		}
	}
}
function keyPressed(){
	if (keyCode === 77){
		toggleMusic();
	}
}
function touchEnded(){
	mouseIsPressed = false;
}
function mouseClicked(){
	if (mouseX > windowWidth - 100 && mouseY > windowHeight - 100){
		toggleMusic();
	}
}

function calculateFPS(){
	fr.push(frameRate());
	fr.shift();
	fps = (fr[0] + fr[1] + fr[2] + fr[3] + fr[4]) / 5
}

function moveCloud(cloud,bgCloud){
	//movement
	cloud.y += cloud.dy;
	cloud.x += cloud.dx;
	
	if (bgCloud || !bg.menu){
		cloud.x += wind("x") * cloud.weight;
		cloud.y += wind("y") * cloud.weight;
	}
	
	cloud.dx *= 0.95;
	cloud.dy *= 0.95;
		
	if (cloud.dx < 0.3 && cloud.dx > -0.3) cloud.dx = 0;
	if (cloud.dy < 0.3 && cloud.dy > -0.3) cloud.dy = 0;
	
	//boundaries
	var cloudScreenX = cloud.x - bg.offset.x;
	if (!bgCloud){
		if (cloudScreenX < windowWidth/4){
			bg.offset.x -= (windowWidth/4 - cloudScreenX)
		} else if (cloudScreenX > 3/4 * windowWidth){
			bg.offset.x += (cloudScreenX - (windowWidth * 3/4));
		}	
		if (cloud.y < 0){
			cloud.y = 0;
		} else if (cloud.y > 3/4 * windowHeight){
			cloud.y = 3/4 * windowHeight;
		}
	} else {
		if (cloudScreenX < 0 - cloud.spreadX/2){
			cloud.x += windowWidth + cloud.spreadX;
			cloud.y = windowHeight * Math.random()/2;
		} else if (cloudScreenX > windowWidth + cloud.spreadX/2){
			cloud.x -= windowWidth + cloud.spreadX;
			cloud.y = windowHeight * Math.random()/2;
		}
		if (cloud.y < 0){
			cloud.y = 0;
		} else if (cloud.y > 3/4 * windowHeight){
			cloud.y = 3/4 * windowHeight;
		}
	}
	
	//raining
	if (cloud.raining){
		bg.raindrops.push(new Raindrop(cloud.x,cloud.y,cloud.spreadX/4));
	}
}
function moveRaindrop(raindrop){
	raindrop.y += 10;
	raindrop.x += wind("x");
	if (raindrop.y > windowHeight * 3/4){
		var scale = windowHeight * 1/4;
		var shift = windowHeight * 3/4;
		var i = (raindrop.x - bg.offset.x)/bg.spacing;
		var landHeight = noise(Math.floor(i + (bg.offset.x/bg.spacing)) * bg.scaleFactor) * scale + shift;
		
		if (raindrop.y + raindrop.l > landHeight){
			bg.raindrops.splice(bg.raindrops.indexOf(raindrop),1);
			var l = bg.land[Math.floor(i + (bg.offset.x/bg.spacing))]
			if (!l){
				bg.land[Math.floor(i + (bg.offset.x/bg.spacing))] = new DefaultLand();
			} else {
				l.saturation += 1/Math.sqrt(l.saturation);
				if (l.saturation > 10){
					l.flooding += l.saturation - 10;
					l.saturation = 10;
				}
			}
		}
	}
}
function wind(dimension){
	if (dimension === "x"){
		return (noise(time/500) - 0.5) * 5;
	} else if (dimension === "y"){
		//return noise(time/500) - 0.5;
		return 0;
	}
}
function spreadWater(){
	var newLand = bg.land;
	for (var section in bg.land){
		section = parseInt(section);
		var l = bg.land[section-1] ? bg.land[section-1] : new DefaultLand();
		var m = bg.land[section];
		var r = bg.land[section+1] ? bg.land[section+1] : new DefaultLand();
		if (m.flooding){
			var scale = windowHeight * 1/4,
				shift = windowHeight * 3/4;
			var landHeight = {
				"-1":(1 - noise((section-1) * bg.scaleFactor)) * scale,
				"0":(1 - noise((section) * bg.scaleFactor)) * scale,
				"1":(1 - noise((section+1) * bg.scaleFactor)) * scale,
				"2":(1 - noise((section+2) * bg.scaleFactor)) * scale
			};

			var floodL = calcWaterLevel(landHeight["-1"],landHeight["0"],l.flooding);
			var floodM = calcWaterLevel(landHeight["0"],landHeight["1"],m.flooding);
			var floodR = calcWaterLevel(landHeight["1"],landHeight["2"],r.flooding);
			
			if (floodM > floodL && floodM < floodR){
				//flow left
				if (floodM > landHeight["0"]){
					if (!newLand[section-1]) newLand[section-1] = new DefaultLand();
					var w = Math.random(floodM - floodL)/2
					newLand[section-1].flooding += w;
					newLand[section].flooding -= w;
				}
			} else if (floodM > floodR && floodM < floodL) {
				//flow right
				if (floodM > landHeight["1"]){
					if (!newLand[section+1]) newLand[section+1] = new DefaultLand();
					var w = Math.random(floodM - floodR)/2
					newLand[section+1].flooding += w;
					newLand[section].flooding -= w;
				}
			} else if (floodM > floodR && floodM > floodL) {
				if (floodM < landHeight["1"]){
					//left only
					if (!newLand[section-1]) newLand[section-1] = new DefaultLand();
					var w = Math.random(floodM - floodL)/2
					newLand[section-1].flooding += w;
					newLand[section].flooding -= w;
				} else if (floodM < landHeight["0"]){
					//right only
					if (!newLand[section+1]) newLand[section+1] = new DefaultLand();
					var w = Math.random(floodM - floodR)/2
					newLand[section+1].flooding += w;
					newLand[section].flooding -= w;
				} else {
					//spill
					var diffL = floodM - floodL;
					var diffR = floodM - floodR;
					var w = Math.random(diffL + diffR)/2;
					newLand[section].flooding -= w;
					if (!newLand[section-1]) newLand[section-1] = new DefaultLand();
					if (!newLand[section+1]) newLand[section+1] = new DefaultLand();
					newLand[section-1].flooding += w * diffL/(diffL+diffR);
					newLand[section+1].flooding += w * diffR/(diffL+diffR);
				}
			}
			
			/*
			var landL = (landHeight["-1"] + landHeight["0"])/2,
				landM = (landHeight["0"] + landHeight["1"])/2,
				landR = (landHeight["1"] + landHeight["2"])/2;
			if (landL + l.flooding < landM + m.flooding || landR + r.flooding < landM + m.flooding){
				if (landL + l.flooding < landM + m.flooding){
					if (landR + r.flooding < landM + m.flooding){
						//flow both
						var diffL = (landM + m.flooding) - (landL + l.flooding);
						var diffR = (landM + m.flooding) - (landR + r.flooding);
						var w = m.flooding/2;
						if (!newLand[section-1]) newLand[section-1] = new DefaultLand();
						if (!newLand[section+1]) newLand[section+1] = new DefaultLand();
						newLand[section-1].flooding += w * diffL/(diffL+diffR);
						newLand[section+1].flooding += w * diffR/(diffL+diffR);
						newLand[section].flooding -= w;
					} else {
						//flow left
						var w = (landM + m.flooding) - (landL + l.flooding);
						if (!newLand[section-1]) newLand[section-1] = new DefaultLand();
						newLand[section-1].flooding += w/2;
						newLand[section].flooding -= w/2;
					}
				} else {
					//flow right
					var w = (landM + m.flooding) - (landR + r.flooding);
					if (!newLand[section+1]) newLand[section+1] = new DefaultLand();
					newLand[section+1].flooding += w/2;
					newLand[section].flooding -= w/2;
				}
			}
			*/
		}
	}
	bg.land = $.extend([], newLand);
}

function calcWaterLevel(left,right,flooding){
	var level = Math.min(left,right);
	var diff = Math.abs(left-right);
	if (flooding * 2 <= diff){
		level += flooding * 2;
	} else {
		level += diff;
		flooding -= diff/2;
		level += flooding;
	}
	return level
}

function drawCloud(cloud,isBackgroundCloud){
	noStroke();
	fill(255,255,255,50);
	for (var i=0; i<cloud.spreadX/5; i++){
		var offsetX = (noise(i + time/1000 + cloud.weight*i) - 0.5) * (cloud.spreadX - cloud.spreadX/2)/cloud.weight;
		var offsetY = (noise(i + 20000 + time/1000 + cloud.weight*10) - 0.5) * (cloud.spreadY - cloud.spreadY/2)/cloud.weight;
		if (!isBackgroundCloud){
			ellipse(cloud.x + offsetX - bg.offset.x,cloud.y + offsetY,30,30);
		} else {
			ellipse(cloud.x + offsetX - bg.offset.x,cloud.y + offsetY,30/cloud.weight,30/cloud.weight);
		}
	}
}
function drawRaindrop(raindrop){
	if (raindrop){
		stroke(128,218,235);
		line(raindrop.x - bg.offset.x,raindrop.y,raindrop.x - bg.offset.x,raindrop.y+raindrop.l);
		noStroke();
	}
}
function drawGround(){
	noStroke();
	
	var scale = windowHeight * 1/4;
	var shift = windowHeight * 3/4;
	var fracOffset = bg.offset.x % bg.spacing;
		
	for (var i=-1,j=Math.ceil(windowWidth/bg.spacing)+1; i<j; i++){
		
		var heightA = noise(Math.floor(i + (bg.offset.x/bg.spacing)) * bg.scaleFactor) * scale + shift;
		var heightB = noise(Math.floor(i+1 + (bg.offset.x/bg.spacing)) * bg.scaleFactor) * scale + shift;
		
		var grass = bg.land[Math.floor(i + (bg.offset.x/bg.spacing))];
		if (grass){
			var gl = bg.land[Math.floor(i + (bg.offset.x/bg.spacing)) - 1] ? bg.land[Math.floor(i + (bg.offset.x/bg.spacing)) - 1] : new DefaultLand();
			var gr = bg.land[Math.floor(i + (bg.offset.x/bg.spacing)) + 1] ? bg.land[Math.floor(i + (bg.offset.x/bg.spacing)) + 1] : new DefaultLand();
			
			fill(0,0,255)
			if (grass.flooding){
				var hM = Math.min(heightA,heightB);
				var h = (heightA + heightB)/2;
				
				var heightL = noise(Math.floor(i-1 + (bg.offset.x/bg.spacing)) * bg.scaleFactor) * scale + shift;
				var heightR = noise(Math.floor(i+2 + (bg.offset.x/bg.spacing)) * bg.scaleFactor) * scale + shift;
				var hl = (heightA + heightL)/2;
				var hr = (heightB + heightR)/2;
				
				//water goes underneath everything else
				quad(
					i * bg.spacing - fracOffset, ((h - grass.flooding) + (hl - gl.flooding))/2,
					(i+1) * bg.spacing - fracOffset + 1, ((h - grass.flooding) + (hr - gr.flooding))/2,
					(i+1) * bg.spacing - fracOffset + 1, heightB,
					i * bg.spacing - fracOffset, heightA
				);
			}
			
			//first the ground
			fill(100);
			quad(
				i * bg.spacing - fracOffset, heightA,
				(i+1) * bg.spacing - fracOffset + 1,heightB,
				(i+1) * bg.spacing - fracOffset + 1, windowHeight,
				i * bg.spacing - fracOffset, windowHeight
			);
			
			//now the grass
			fill(0,255,0)
			quad(
				i * bg.spacing - fracOffset, heightA,
				(i+1) * bg.spacing - fracOffset + 1, heightB,
				(i+1) * bg.spacing - fracOffset + 1, heightB + (grass.saturation + gr.saturation)/2,
				i * bg.spacing - fracOffset, heightA + (grass.saturation + gl.saturation)/2
			);
		} else {
			//just the ground
			fill(100);
			quad(
				i * bg.spacing - fracOffset, heightA,
				(i+1) * bg.spacing - fracOffset + 1,heightB,
				(i+1) * bg.spacing - fracOffset + 1, windowHeight,
				i * bg.spacing - fracOffset, windowHeight
			);
		}
		
		
	}
	fill(255);
}
function drawMenu(){
	noStroke();
	fill(255);
	textSize(120);
	textFont("Montserrat");
	text("CLOUD",windowWidth/2+10,windowHeight/2-50)
	textSize(20);
	text("by David Stark",windowWidth/2,windowHeight/2+60)
	textSize(14);
}