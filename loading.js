var loading = {
	loaded:false,
	color:{
		red:0,
		green:0,
		blue:0
	},
	size:100
}

function loadingAnimation(){
	time++;
	fill(0)
	rect(0,0,windowWidth,windowHeight);
	morphColor();
	morphSize();
	fill(loading.color.red,loading.color.green,loading.color.blue);
	ellipse(windowWidth/2,windowHeight/2,loading.size,loading.size);
	text("loading...",windowWidth/2+8,windowHeight/2+120);
	if (!loading.loaded){
		window.setTimeout(function(){
			loadingAnimation();
		},0)
	};
}
function morphColor(){
	loading.color.red = noise(time/1000) * 255;
	loading.color.green = noise(time/1000+10000) * 255;
	loading.color.blue = noise(time/1000+20000) * 255; 
}
function morphSize(){
	loading.size = 100 + noise(time/1000+30000)*100;
}