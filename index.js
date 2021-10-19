const fs = require('fs');
const https = require('https');
const { execSync: exec } = require('child_process');
const { Deepgram } = require('@deepgram/sdk');
const ffmpegStatic = require('ffmpeg-static');
const deepgram = new Deepgram(process.env.DG_KEY);

// Uncomment one of these
// transcribeLocalVideo('deepgram.mp4');
// transcribeRemoteVideo('https://rawcdn.githack.com/deepgram-devs/transcribe-videos/62fc7769d6e2bf38e420ee5224060922af4546f7/deepgram.mp4');

async function transcribeLocalVideo(filePath) {
	cmd(ffmpeg, `-hide_banner -y -i ${filePath} ${filePath}.wav`);
	const audioFile = { buffer: fs.readFileSync(`${filePath}.wav`), mimetype: 'audio/wav' };
	const response = await deepgram.transcription.preRecorded(audioFile, { punctuation: true });
	return response.results;
}

async function transcribeRemoteVideo(url) {
	const filePath = await downloadFile(url);
	const transcript = await transcribeLocalVideo(filePath);
}

async function downloadFile(url) {
	return new Promise((resolve, reject) => {
		const request = https.get(url, response => {
			const fileName = url.split('/').slice(-1)[0]; // Get the final part of the URL only
			const fileStream = fs.createWriteStream(fileName);
			response.pipe(fileStream);
			response.on('end', () => {
				fileStream.close();
				resolve(fileName);
			 })
		})
	})
}

async function ffmpeg(command) {
	return new Promise((resolve, reject) => {
		exec(`${ffmpegStatic} ${command}`, (err, stderr, stdout) => {
			if (err) reject(err);
			resolve(stdout);
		});
	});
}