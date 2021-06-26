import React from "react";
import styled from "styled-components";
import cookies from "js-cookie";

import title from "@assets/svg/title.svg";

const Header = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  background: #1d00cf;
  img {
    margin-left: 95px;
    @media (max-width: 500px) {
      margin-left: 10px;
    }
  }
`;

const VideoContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 20px;
  gap: 20px;
  @media (orientation: portrait) {
    flex-direction: column;
  }
`;

const VideoElement = styled.video`
  width: 50%;
  height: 350px;
  object-fit: cover;

  background: black;
  box-shadow: 5px 10px 30px -5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;

  @media (orientation: portrait) {
    width: 100%;
    height: 35vh;
  }
`;

const Button = styled.button`
  position: absolute;
  bottom: 0px;
  background: rgba(29, 0, 207);
  width: 100%;
  height: 50px;
  font: 900 18px Montserrat;
  color: white;
  transition: all 0.1s ease-in;
  cursor: pointer;
  outline: none;
  border: none;
  &:hover {
    box-shadow: inset 0 0 30px -5px rgba(0, 0, 0, 0.3);
  }
  &:active {
    box-shadow: inset 0 0 30px -5px rgba(0, 0, 0, 0.5);
  }
`;


const Video = React.forwardRef(({ children }, ref) => (
  <VideoElement ref={ref} />
));

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.localVideoElement = React.createRef();
    this.remoteVideoElement = React.createRef();
  }

  componentDidMount() {
    if (!cookies.get("token")) {
      cookies.set("token", Math.random().toString(36));
    }
    this.remoteVideoElement.current.autoplay = true;
    this.localVideoElement.current.autoplay = true;
    this.localVideoElement.current.muted = true;
    window.navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((localStream) => this.initLocalVideo(localStream))
      .catch(() => {
        window.navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then((localStream) => this.initLocalVideo(localStream));
      });
  }

  initLocalVideo(localStream) {
    this.localStream = localStream;
    this.localVideoElement.current.srcObject = localStream;
    this.initWebSocket();
  }

  initRemoteVideo() {
    console.log(123);
    this.remoteVideoElement.current.srcObject = new MediaStream(
      this.connection.getReceivers().map((receiver) => receiver.track)
    );
  }

  initWebSocket() {
    this.socket = new WebSocket(`wss://${location.host}${window.ENV === 'server' ? '/videochat/ws' : ''}`);

    this.socket.onmessage = async ({ data }) => {
      data = JSON.parse(data);
      if (data.offer) {
        console.log("recive offer");
        this.initWebRTC();
        await this.connection.setRemoteDescription(data.offer);
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
        this.socket.send(JSON.stringify({ answer }));
        console.log("send answer");
      }
      if (data.answer) {
        console.log("recive answer");
        await this.connection.setRemoteDescription(data.answer);
      }
      if (data.candidate) {
        console.log("recive candidate");
        this.connection.addIceCandidate(data.candidate);
      }
      if (data.ready) {
        this.initWebRTC();
        const offer = await this.connection.createOffer({
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1,
          iceRestart: true,
        });
        await this.connection.setLocalDescription(offer);
        this.socket.send(JSON.stringify({ offer }));
        console.log("send offer");
      }
      if (data.reconnect) {
        this.initWebRTC();
        this.socket.send(JSON.stringify({ new: true }));
      }
    };
  }

  initWebRTC() {
    if (this.connection) delete this.connection;
    this.connection = new RTCPeerConnection({
      sdpSemantics: "unified-plan",
      iceServers: [
        {
          urls: `turn:${location.hostname}`,
          username: "password",
          credential: "password",
        },
      ],
    });

    this.localStream
      .getTracks()
      .forEach((track) => this.connection.addTrack(track, this.localStream));
    this.connection.ontrack = () => this.initRemoteVideo();
    this.connection.onicecandidate = ({ candidate }) => {
      this.socket.send(JSON.stringify({ candidate }));
    };
  }

  skip() {
    if (this.connection) this.connection.close();
    this.initWebRTC();
    this.socket.send(JSON.stringify({ new: true }));
  }

  render() {
    return (
      <>
        <Header>
          <img src={title} />
        </Header>
        <VideoContainer>
          <Video ref={this.localVideoElement} />
          <Video ref={this.remoteVideoElement} />
        </VideoContainer>
        <Button onClick={this.skip.bind(this)}>Skip</Button>
      </>
    );
  }
}
