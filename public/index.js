
async function getChatKey() {
	console.log("getting ephemeral key...");
	const response = await fetch("/realtime_session_key"); // request to local server
	if (!response.ok) throw new Error("Failed to fetch chat session", response);
	const ephemeralKey = await response.text();
	console.log("Got chat key:", ephemeralKey);
	if (!ephemeralKey) throw new Error("Problem getting ephemeral key from OpenAI");
	
	return ephemeralKey;
}

async function getRtcSession(ephemeralKey) {
	const openaiRealtimeUrl = "https://api.openai.com/v1/realtime/calls"; // Note: this is the "GA" API, not the Beta from 2024
	const openaiRealtimeModel = "gpt-realtime-mini-2025-10-06";
	console.log("Creating RTC peer connection...");
	const rtcPeerConnection = new RTCPeerConnection();
	const robotSpeechElement = document.getElementById("robot-audio");
	robotSpeechElement.autoplay = true;
	rtcPeerConnection.ontrack = e => robotSpeechElement.srcObject = e.streams[0];

	console.log("Getting media (mic) stream");
	const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

	rtcPeerConnection.addTrack(micStream.getTracks()[0]);

	const rtcDataChannel = rtcPeerConnection.createDataChannel("oai-events");
	rtcDataChannel.addEventListener("message", handleRtcMessage);

	// Create a new offer and set as local description
	const rtcOffer = await rtcPeerConnection.createOffer();
	await rtcPeerConnection.setLocalDescription(rtcOffer);
	// Get a new answer from the server using the new ephemeral key
	const realtime_session_url = `${openaiRealtimeUrl}?model=${openaiRealtimeModel}`;
	const realtime_session_request = {
		method: "POST",
		body: rtcOffer.sdp,
		headers: {
			Authorization: `Bearer ${ephemeralKey}`,
			"Content-Type": "application/sdp",
		},
	};
	console.log({ realtime_session_url, realtime_session_request });
	const sdpResponse = await fetch(
		realtime_session_url,
		realtime_session_request,
	);
	const sdpAnswer = {
		type: "answer",
		sdp: await sdpResponse.text(),
	};

	await rtcPeerConnection.setRemoteDescription(sdpAnswer);
	console.log("RTC session created with new ephemeral key.");
}

// Handling messages that come from the realtime API
function handleRtcMessage(message) {
  const rtc_data = JSON.parse(message.data);

	console.log(rtc_data);

	const humanTextElement = document.getElementById("smallBox");
	const robotTextElement = document.getElementById("largeBox");

	switch (rtc_data.type) {
		case "session.created":
			document.getElementById("status").innerHTML = "Ready!";
			break;
		case "input_audio_buffer.speech_started":
			humanTextElement.innerHTML = "";
			break;
		case "conversation.item.input_audio_transcription.delta":
			humanTextElement.innerHTML += rtc_data.delta;			
			// console.log("human speech delta", rtc_data);
			break;
		case "response.output_audio_transcript.delta":
			robotTextElement.innerHTML += rtc_data.delta;
			break;
		case "response.output_audio_transcript.done":
			robotTextElement.innerHTML += "\n\n";
			break;
		default:
			// console.log("RTC message type:", rtc_data.type, rtc_data);
			break;
	}

	return;
}

const ephemeralKey = await getChatKey();
await getRtcSession(ephemeralKey);
