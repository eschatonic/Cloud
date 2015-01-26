
var cloud;
var fps;
var time = 0;
var images = {}
var bg = {
	menu:true,
	offset:{
		x:0,
		y:0
	},
	land:[],
	clouds:[],
	raindrops:[]
}
var debug = true;

function Cloud(x,y,dx,dy,spreadX,spreadY,weight,raining){
	this.x = x, //position on screen, not absolute
	this.y = y,
	this.dx = dx,
	this.dy = dy
	this.spreadX = spreadX;
	this.spreadY = spreadY;
	this.weight = weight;
	this.raining = raining;
}
function Raindrop(x,y,variance){
	this.x = x + (Math.random() - 0.5) * variance; //position on screen, not absolute
	this.y = y;
	this.length = Math.random() * 10 + 10;
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
	cloud = new Cloud(windowWidth/2,windowHeight/2,0,0,250,100,1,false);
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
		
		//background
		background(33,142,181); //clear blue sky :)
		calculateFPS();
		text(Math.floor(fps) + "",20,20);
		for (var bgCloud in bg.clouds){
			moveCloud(bg.clouds[bgCloud],true);
		};
		for (var bgRaindrop in bg.raindrops){
			moveRaindrop(bg.raindrops[bgRaindrop]);
		}
		drawBackground();
		if (bg.menu) drawMenu();
		checkMusic();
		
		//player
		controls();
		moveCloud(cloud,false);
		drawCloud(cloud,false);
}

function controls() {
	if (!bg.menu){
		cloud.raining = false;
		if (keyIsDown(LEFT_ARROW)) cloud.dx -= fps/30;
		if (keyIsDown(RIGHT_ARROW)) cloud.dx += fps/30;
		if (keyIsDown(UP_ARROW)) cloud.dy -= 0.5 * fps/30;
		if (keyIsDown(DOWN_ARROW)) cloud.dy += 0.5 * fps/30;
		cloud.raining = keyIsDown(32);
		
		if (mouseIsPressed){
			var dX = mouseX - cloud.x + bg.offset.x;
			var dY = mouseY - cloud.y;
			var hyp = Math.sqrt(dX*dX + dY*dY);
			
			if (hyp < cloud.spreadX/4){
				cloud.raining = true;
			} else {
				cloud.dx += dX/hyp;
				cloud.dy += dY/hyp;
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
	if (raindrop.y > windowHeight) bg.raindrops.splice(bg.raindrops.indexOf(raindrop),1);
}
function wind(dimension){
	if (dimension === "x"){
		return (noise(time/500) - 0.5) * 5;
	} else if (dimension === "y"){
		//return noise(time/500) - 0.5;
		return 0;
	}
}

function drawCloud(cloud,bgOffset){
	noStroke();
	fill(255,255,255,50);
	for (var i=0; i<cloud.spreadX/5; i++){
		var offsetX = (noise(i + time/1000 + cloud.weight*i) - 0.5) * (cloud.spreadX - cloud.spreadX/2)/cloud.weight;
		var offsetY = (noise(i + 20000 + time/1000 + cloud.weight*10) - 0.5) * (cloud.spreadY - cloud.spreadY/2)/cloud.weight;
		if (!bgOffset){
			ellipse(cloud.x + offsetX - bg.offset.x,cloud.y + offsetY,30,30);
		} else {
			ellipse(cloud.x + offsetX - bg.offset.x,cloud.y + offsetY - bg.offset.y,30/cloud.weight,30/cloud.weight);
		}
	}
}
function drawRaindrop(raindrop){
	stroke(128, 218, 235);
	line(raindrop.x - bg.offset.x,raindrop.y,raindrop.x - bg.offset.x,raindrop.y+raindrop.length);
	noStroke();
}
function drawBackground(){
	noStroke();
	fill(100);
	
	for (var raindrop in bg.raindrops){
		drawRaindrop(bg.raindrops[raindrop]);
	}
	
	var spacing = 20,
		scaleFactor = 0.1,
		fracOffset = bg.offset.x % spacing,
		w = Math.ceil(windowWidth/spacing)
	for (var i=-1;i<=w;i++){
		var heightA = noise(Math.floor(i + (bg.offset.x/spacing)) * scaleFactor) * windowHeight * 1/4 + windowHeight * 3/4;
		var heightB = noise(Math.floor(i+1 + (bg.offset.x/spacing)) * scaleFactor) * windowHeight * 1/4 + windowHeight * 3/4;
		quad(
			i * spacing - fracOffset, heightA,
			(i+1)*spacing - fracOffset + 1,heightB,
			(i+1)*spacing - fracOffset + 1, windowHeight,
			i * spacing - fracOffset, windowHeight
		);
	}
	for (var cloud in bg.clouds){
		drawCloud(bg.clouds[cloud],true);
	}
	
	if (!debug){
		var soundImage = music.isPlaying ? images.play : images.mute;
		image(soundImage,windowWidth-70,windowHeight-70,60,60);
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