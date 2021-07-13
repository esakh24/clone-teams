import React, { useState, useRef } from "react";
import "./main-screen.css";
import "../../../../node_modules/font-awesome/css/font-awesome.css";
import { withRouter } from "react-router-dom";
const BtnGroup = (props) => {
  const {
    isLeaver,
    setIsLeaver,
    clickScreenSharing,
    socket,
    toggleCamera,
    toggleChatView,
    toggleMic,
    toggleParticipantsView,
    destroyAllMyPeers,
  } = props;
  const currentUser = localStorage.getItem("user");
  const id = props.idx;
  const roomId = `join_${props.sId}`;
  const handleDisconnect = () => {
    //   socketInstance.current?.destoryConnection();
    setIsLeaver(true);
    props.userStream.current.getTracks().forEach(function (track) {
      track.stop();
    });

    destroyAllMyPeers();
    socket.emit("leave-room", { roomId, leaver: currentUser });

    props.history.push("/teams/" + id);
    // window.location.reload();
  };

  return (
    <div id="bottomButtons">
      <div
        className="btn-toolbar"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group me-2" role="group" aria-label="First group">
          <button
            id="audioBtn"
            type="button"
            className="btn btn-dark"
            onClick={() => toggleMic(false)}
          >
            <i
              className={
                props.userVideoAudio.isAudio
                  ? "fas fa-microphone"
                  : "fas fa-microphone-slash"
              }
            ></i>
          </button>

          <button
            id="videoBtn"
            type="button"
            className="btn btn-dark"
            onClick={() => toggleCamera(false)}
          >
            <i
              className={
                props.userVideoAudio.isVideo
                  ? "fas fa-video"
                  : "fas fa-video-slash"
              }
            ></i>
          </button>

          <button id="recordBtn" type="button" className="btn btn-dark">
            <i className="fas fa-record-vinyl"></i>
          </button>

          <button
            id="chatBtn"
            type="button"
            className="btn btn-dark"
            onClick={() => toggleChatView()}
          >
            <i className="fab fa-rocketchat"></i>
          </button>

          <button
            id="screenShareBtn"
            type="button"
            className="btn btn-dark"
            onClick={() => clickScreenSharing()}
          >
            <i className="fas fa-share-square"></i>
          </button>

          <button id="whiteBoardBtn" type="button" className="btn btn-dark">
            <i
              className="fas fa-chalkboard"
              onClick={() => toggleParticipantsView()}
            ></i>
          </button>

          <button
            id="leaveBtn"
            type="button"
            className="btn btn-dark"
            onClick={handleDisconnect}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default withRouter(BtnGroup);
