if (!getCookie('token')) {
  setCookie('token', (Math.random()).toString(36))
}

let connection
let localStream;

const localVideo = document.querySelector("#local");
localVideo.autoplay = true;
localVideo.muted = true;

const remoteVideo = document.querySelector("#remote");
remoteVideo.autoplay = true;

async function localCamera() {
try {
  localStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
} catch (error) {
  localStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
  });
}

localVideo.srcObject = localStream;
}

async function remoteCamera() {
  console.log(connection.getReceivers());
  const remoteStream = new MediaStream(
    connection.getReceivers().map((receiver) => receiver.track)
  );
  remoteVideo.srcObject = remoteStream;
}


const newCon = (socket) => {
  if (connection) delete connection
  connection = new RTCPeerConnection({
    sdpSemantics: "unified-plan",
    iceServers: [
      {
        urls: `turn:${location.hostname}`,
        username: "password",
        credential: "password",
      },
    ],
    iceTransportPolicy: "relay",
  });
  // connection.onconnectionstatechange = () => {
  //   if (connection.connectionState == 'disconnected'){
  //     socket.send(JSON.stringify({new: true}))
  //     newCon(socket)
  //     console.log('dis new')
  //   }
  // }
  localStream
  .getTracks()
  .forEach((track) => connection.addTrack(track, localStream));
  connection.ontrack = () => remoteCamera()
  connection.onicecandidate = async function ({ candidate }) {
    socket.send(JSON.stringify({ candidate }));
  };
  return connection
}

localCamera().then(() => {
  const socket = new WebSocket(`wss://${location.host}`);
  
  document.querySelector('#next').addEventListener('click', () => {
    console.log('new')
    if (connection)
    connection.close()
    newCon(socket)
    socket.send(JSON.stringify({new: true}))
  })


  
  socket.onmessage = async ({ data }) => {
    data = JSON.parse(data);
    if (data.offer) {
      console.log('recive offer')
      newCon(socket)
      await connection.setRemoteDescription(data.offer);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      socket.send(JSON.stringify({ answer }));
      console.log('send answer')
    }
    if (data.answer) {
      console.log('recive answer')
      await connection.setRemoteDescription(data.answer);
    }
    if (data.candidate) {
      console.log('recive candidate')
      connection.addIceCandidate(data.candidate);
    }
    if (data.ready) {
      newCon(socket)
      const offer = await connection.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
        iceRestart:true
      });
      await connection.setLocalDescription(offer);
      socket.send(JSON.stringify({ offer }));
      console.log('send offer')
    }
    if (data.reconnect) {
      newCon(socket)
      socket.send(JSON.stringify({new: true}))
    }
  };
})


function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

  options = {
    path: '/',
    // при необходимости добавьте другие значения по умолчанию
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}