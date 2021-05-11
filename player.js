const fs = require('fs');
// where you import your packages
const mpvAPI = require('node-mpv');
// where you want to initialise the API
const mpv = new mpvAPI();


let configFile = 'config.json';
let labelFile = 'label.txt';
let config;
let fileName = "";
let tracklist = []; // [[seconds, 'trackname'], '...']

async function main() {
  await mpv.start();


  await mpv.loadPlaylist("playlist.txt");
  await mpv.loopPlaylist("inf");

  try {
    config = JSON.parse(fs.readFileSync(configFile).toString());
  } catch(err) {
    config = { playlistPos: 0, seekPos: 0 }
  }

  await mpv.jump(config.playlistPos);
  await mpv.goToPosition(config.seekPos);


  mpv.on('status', obj=>{
    if (obj.property == "playlist-pos" && obj.value != null) {
      config.playlistPos = obj.value
      fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
    }
    if (obj.property == "filename" && obj.value != null) {
      fileName = obj.value;
      doFileName(obj.value);
    }
  });

  mpv.on('timeposition', async secs=>{
    config.seekPos = secs;
    fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
    let mpvDur = await mpv.getDuration();

    let trackName = "";
    if (tracklist.length) {
      let track = null;
      let nextTrack = null;
      for (let i=tracklist.length-1; i>0; i--) {
        track = tracklist[i];
        nextTrack = tracklist[i+1];
        if (secs > tracklist[i][0]) {
          break;
        }
      }
      trackName = track[1]
      let trackstartsec = track[0]
      let trackdur = nextTrack ? (nextTrack[0]- trackstartsec ) : (mpvDur - trackstartsec);
      let hms = new Date((secs - trackstartsec) * 1000).toISOString().substr(11, 8)
      let dhms = new Date(trackdur * 1000).toISOString().substr(11, 8)
      fs.writeFileSync(labelFile, "DragonShadow - "+trackName+"\n"+hms+"/"+dhms);
    } else {
      let hms = new Date(secs * 1000).toISOString().substr(11, 8)
      let dhms = new Date(mpvDur * 1000).toISOString().substr(11, 8)
      fs.writeFileSync(labelFile, fileName+"\n"+hms+"/"+dhms);
    }
  });

  fileName = await mpv.getFilename();
  doFileName(fileName);

  console.log("playing");
}

function doFileName(filename) {
  let tracklistFile = filename+'.tracklist';
  tracklist = [];
  if (fs.existsSync(tracklistFile)) {
    fs.readFileSync(tracklistFile).toString().split('\n').forEach(line=>{
      let row = line.trim().split(',');
      if (row.length == 2) {
        let hms = row[0];
        let trackname = row[1];
        let a = hms.split(':'); // split it at the colons
        let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
        tracklist.push([seconds, trackname])
      }
    });
  }
  fs.writeFileSync(labelFile, filename);
}

main();
