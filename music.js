var music = {
	isPlaying:false,
	track:{},
	tracks:{
		unloaded:[
			"music/Avec Soin.mp3",
			"music/Pensif.mp3",
			"music/Calmant.mp3",
			"music/Facile.mp3",
			"music/Pepper's Theme.mp3"
		],
		loaded:[]
	}
};

function toggleMusic(){
	music.isPlaying ? pauseMusic() : resumeMusic();
}
function pauseMusic(){
	music.track.pause()
	music.isPlaying = false;
}
function resumeMusic(){
	music.track.play()
	music.isPlaying = true;
}
function loadTrack(){
	if (music.tracks.unloaded.length > 0){
		var track = music.tracks.unloaded[Math.floor(music.tracks.unloaded.length * Math.random())];
		music.tracks.loaded.push(loadSound(track,function(){
			console.log("Loaded " + music.tracks.loaded[music.tracks.loaded.length-1].url);
			loadTrack();
		}));
		music.tracks.unloaded.splice(music.tracks.unloaded.indexOf(track),1);
	}
}
function checkMusic(){
	if (music.isPlaying){
		if (music.track.currentTime() < music.track.duration() - 1){
			return true
		} else {
			pickNewTrack();
		}
	}
}
function pickNewTrack(){
	var track = music.tracks.loaded[Math.floor(music.tracks.loaded.length * Math.random())];
	music.track = track;
	music.track.play();
}