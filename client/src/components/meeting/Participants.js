import React, { useEffect, useState, useRef } from "react";

import socket from "../../socket.client";
const Participant = ({ key, name, isVideo, isAudio }) => {
  const currentUser = sessionStorage.getItem("user");
  const [participants, setParticipants] = useState([]);

  return (
    <li key={key} className="participant-card ">
      <div class="btn-group">
        {" "}
        <p className=" p-2">
          <span className="avatar ">{name.charAt(0).toUpperCase()}</span>
        </p>
        <button type="button" class="btn btn-light">
          {name}
        </button>
        <span>
          <i
            className={isVideo ? "p-2 fa fa-video" : "p-2 fa fa-video-slash"}
          />{" "}
        </span>
        <span>
          <i
            className={
              isAudio ? "p-2 fa fa-microphone" : "p-2 fa fa-microphone-slash"
            }
          />{" "}
        </span>
      </div>
    </li>
  );
};

export default Participant;
