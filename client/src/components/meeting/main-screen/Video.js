import React, { useEffect, useState, useRef } from "react";
import "./main-screen.css";
import "../../../../node_modules/font-awesome/css/font-awesome.css";

const Video = (props) => {
  const userVideoAudio = props.userVideoAudio;
  const ref = useRef();
  const peer = props.peer;
  const [video, setVideo] = useState(props.isVideo);
  const [audio, setAudio] = useState(props.isAudio);
  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on("track", (track, stream) => {
      console.log("on track");
    });
  }, [peer]);

  return (
    <>
      <video class={props.class()} ref={ref} autoPlay={true}></video>
    </>
  );
};
export default Video;
