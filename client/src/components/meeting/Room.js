import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
//import socket from "../../socket.client";
import Peer from "simple-peer";
import BtnGroup from "./main-screen/BtnGroup";
import Video from "./main-screen/Video";
import Chat from "./chats/Chat";
import Participant from "./Participants";
import useScript from "../useScript";
import Userservice from "../../services/user.service";
import { saveAs } from "file-saver";

import Swal from "sweetalert2";
import "./chats/chats.css";
import "./main-screen/main-screen.css";
import { get } from "https";
const download = require("downloadjs");
const Room = (props) => {
  useScript("https://kit.fontawesome.com/c939d0e917.js");

  const { socket, isMeeting, setIsMeeting } = props;
  let prevNotOver = true;
  const userRef = useRef();
  let name = "";
  const [userName, setUserName] = useState(localStorage.getItem("user"));
  const [userId, setUserId] = useState("");
  const [divNo, setDivNo] = useState("2");
  const [participants, setParticipants] = useState(undefined);
  const [displayChat, setDisplayChat] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [presenterId, setPresenterId] = useState();
  const [isPresenter, setIsPresenter] = useState(false);
  const [isLeaver, setIsLeaver] = useState(false);
  const [disablejoin, setDisablejoin] = useState(true);
  const [displayParticipants, setDisplayParticipants] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const myVideoRef = {};
  const [peers, setPeers] = useState([]);
  const screenTrackRef = useRef();
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const prevUserVideoRef = useRef();
  const screenShareRef = useRef();

  const userStream = useRef(null);
  const prevUserStream = useRef();
  const fileChunks = [];
  const [userVideoAudio, setUserVideoAudio] = useState({
    me: { userId: "", isVideo: true, isAudio: true },
  });
  const { id } = useParams();
  const roomId = `room_${id}`;
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const getUserName = () => {
    name = prompt("Please enter your name");
    if (!name) {
      alert("Name can't be empty. Try again");

      getUserName();
    } else {
      sessionStorage.setItem("user", name);
      // setUserName(name);
      console.log("returning00" + name);
      return name;
    }
  };
  const getPermission = () => {
    console.log("in room id " + id);
    Userservice.joinMeeting(id).then((response) => {
      console.log("meeting response response" + response.data.participants);
      setParticipants(response.data.participants);
    });
  };

  const displaynotif = (name, isleave) => {
    const title = !isleave
      ? name + " slipped into the meet!"
      : name + " left the meeting";
    Swal.fire({
      toast: true,
      position: "top",
      title: title,
      showConfirmButton: false,
      timer: 1500,
    });
  };
  useEffect(() => {
    if (divNo === "3") {
      console.log("emittingprev comp");
      console.log(divNo);
      socket.emit("preview-complete");
    }
  }, [divNo]); // initialise
  useEffect(() => {
    console.log("initial" + userVideoRef);
    try {
      getPermission();
    } catch (err) {
      console.log(err);
      props.history.push("/");
    }
    //elseredirect to login..if no room exists in the db
    setIsMeeting(true);
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    }
    const name = JSON.parse(localStorage.getItem("user"));
    if (!name) {
      console.log(userName);
      setUserName(() => getUserName());
      console.log(userName);
    }
    setUserName(name);
    if (socket) {
      console.log("yeye sockettt");
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("just after getting" + userVideoRef);
        prevUserVideoRef.current.srcObject = stream;
        prevUserStream.current = stream;
        setDisablejoin(false);
        console.log(userVideoAudio);
        socket.on("set-your-stream", () => {
          console.log("div" + divNo);
          console.log("just after getting" + userVideoRef);
          console.log("setyour");
          console.log(userVideoRef);

          userVideoRef.current.srcObject = stream;
          userStream.current = stream;

          setUserVideoAudio((mediaList) => {
            let video = mediaList["me"].isVideo;
            let audio = mediaList["me"].isAudio;

            const userVideoTrack =
              userVideoRef.current.srcObject.getVideoTracks()[0];
            userVideoTrack.enabled = video;
            const userAudioTrack =
              userVideoRef.current.srcObject.getAudioTracks()[0];

            if (userAudioTrack) {
              userAudioTrack.enabled = audio;
            } else {
              userStream.current.getAudioTracks()[0].enabled = audio;
            }

            socket.emit("join-meeting-room", {
              chatroomId: id,
              roomId: roomId,
              name,
              isVideo: video,
              isAudio: audio,
            });

            return {
              ...mediaList,
            };
          });
        });

        window.addEventListener("popstate", goToBack);
        window.addEventListener("beforeunload", goToBack);

        socket.on("peer-wants-to-join", ({ userId, details }) => {
          let { name, isVideo, isAudio } = details;
          //create a peer to send offercuz someone wants to join

          //peersId,myid,mystream,not an initiater
          const peer = createPeer(userId, name, stream, true);

          peersRef.current.push({
            peerID: userId,
            peer,
            name: name,
          });
          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.name]: { userId, isVideo, isAudio },
            };
          });

          setPeers((users) => {
            return [...users, peer];
          });
          console.log("creating a peer and addingit");
          console.log(peer);
          //instance created for each already present member for the new peer, wont be initiater
          peer.on("signal", (offerData) => {
            socket.emit("sending-offer", {
              to: userId, //me, the first peer
              from: socket.id, //the peer just created
              offerData, //send signalling data
            });
          });

          peer.on("connect", () => {
            "displayyy notiggg";
            displaynotif(peer.name, false);
          });
        });
        socket.on("receive-offer", ({ offerData, details, from }) => {
          let { name, isVideo, isAudio } = details;
          console.log("im gonna create a peer to receive the offer ");
          //peersId,myid,mystream,not an initiater
          const peer = createPeer(from, name, stream, false);
          peersRef.current.push({
            peerID: from,
            peer,
            name: name,
          });

          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.name]: { from, isVideo, isAudio },
            };
          });

          setPeers((users) => {
            return [...users, peer];
          });
          //"creating a peer and addingit");

          peer.on("signal", (answerData) => {
            socket.emit("sending-answer", {
              to: from, //me, the first peer
              from: socket.id, //the peer just created
              answerData, //send signalling data
            });
          });

          peer.signal(offerData);
        });

        socket.on("receive-answer", ({ answerData, from }) => {
          //find'from' from peers, signal it with the anwer
          const peerIndex = peersRef.current.find(
            (peer) => peer.peerID === from
          );

          if (!peerIndex) {
          } else peerIndex.peer.signal(answerData);
        });

        socket.on("user-leaving", ({ userId, name }) => {
          displaynotif(name, true);
          const peerIdx = findPeer(userId);
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peerIdx.peer.destroy();
        });
        socket.on("started-screen-sharing", ({ userId, name }) => {
          if (userId !== socket.id) {
            setIsPresenter(false);
            setPresenterId(userId);
            setIsSharingScreen(true);
            //find peer by id
            //set
            const peer = findPeer(userId);
            screenShareRef.current.srcObject = peer.streams[0];
            Swal.fire({
              toast: true,
              position: "top",
              title: name + "started presenting",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        });
        socket.on("stopped-screen-sharing", ({ userId, name }) => {
          if (userId !== socket.id) {
            setPresenterId("");
            setIsSharingScreen(false);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });

    socket.on("update-toggled-media", ({ target, peerID }) => {
      const peerIndex = peersRef.current.find((peer) => peer.peerID === peerID);
      setUserVideoAudio((preList) => {
        let video = preList[peerIndex.peerID].isVideo;
        let audio = preList[peerIndex.peerID].isAudio;
        if (target === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIndex.peerID]: { video, audio },
        };
      });
    });

    return () => {
      console.log("unmounting");
      userStream.current.getTracks().forEach(function (track) {
        console.log("stopping tarck" + track);
        track.stop();
      });
      console.log("in return" + userVideoRef);
      setIsMeeting(false);
      //socket.disconnect();
    };
  }, []);

  function createPeer(userId, name, stream, isInitiater) {
    //new peer will be the initiater, sending its stream ..
    const peer = new Peer({
      initiator: isInitiater,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
        ],
      },
      stream,
    });
    peer.isLeaver = false;
    peer.name = name;
    peer.peerID = userId;
    //on recieving answer from other sides, will emit its presence to the server end to start call with the peer
    peer.on("data", (data) => {
      if (data.toString() === "Done!") {
        //all the chunks are received, combine them to form a Blob
        const file = new Blob(fileChunks);
        Swal.fire({
          toast: true,
          position: "top",
          title: "received a file from" + peer.name,
          showConfirmButton: false,
          timer: 1500,
        });
        console.log("Received", file);
        // Download the received file using downloadjs
        // download(file, "test.png");
        saveAs(file);
        //FileSaver saveAs(Blob/File/Url, optional DOMString filename, optional Object { autoBom })
      } else {
        //  appending  file chunks
        fileChunks.push(data);
      }
    });
    peer.on("close", () => {
      if (!isLeaver) {
        //reove peer from peerlist
        displaynotif(peer.name, true);
        peer.destroy();
      }
    });
    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }
  function createUserVideo(peer, index, arr) {
    return (
      <Video
        key={index}
        class={getClassName}
        key={index}
        peer={peer}
        number={arr.length}
        userVideoAudio={userVideoAudio}
      />
    );
  }
  function createParticipants({ name, index, isAudio, isVideo }) {
    return (
      <Participant
        key={index}
        name={name}
        isAudio={isAudio}
        isVideo={isVideo}
      />
    );
  }
  const changeVisibilities = async () => {
    console.log("change visibility clicked");
    console.log("before" + divNo);
    setDivNo("3");
    console.log("after" + divNo);

    console.log("prevcopm");
  };
  const destroyAllMyPeers = () => {
    peersRef.current.forEach((peerIndex) => {
      peerIndex.peer.destroy();
    });
  };
  const goToBack = (e) => {
    e.preventDefault();
    const name = JSON.parse(localStorage.getItem("user"));
    socket.emit("leave-room", { roomId, leaver: name });
  };

  const toggleCamera = (isPrev) => {
    setUserVideoAudio((mediaList) => {
      let video = mediaList["me"].isVideo;
      let audio = mediaList["me"].isAudio;
      console.log("before video" + video);
      video = !video;
      console.log("aftre video" + video);
      if (!isPrev) {
        const userVideoTrack =
          userVideoRef.current.srcObject.getVideoTracks()[0];
        userVideoTrack.enabled = video;
        socket.emit("toggle-media", { target: "video" });
      } else {
        const prevUserVideoTrack =
          prevUserVideoRef.current.srcObject.getVideoTracks()[0];
        prevUserVideoTrack.enabled = video;
      }

      return {
        ...mediaList,
        me: { isVideo: video, isAudio: audio },
      };
    });
  };

  const toggleMic = (isPrev) => {
    setUserVideoAudio((mediaList) => {
      let video = mediaList["me"].isVideo;
      let audio = mediaList["me"].isAudio;
      console.log("before video" + audio);
      audio = !audio;
      console.log("before video" + audio);

      if (isPrev) {
        const prevUserAudioTrack =
          prevUserVideoRef.current.srcObject.getAudioTracks()[0];

        if (prevUserAudioTrack) {
          prevUserAudioTrack.enabled = audio;
        } else {
          prevUserStream.current.getAudioTracks()[0].enabled = audio;
        }
      } else {
        const userAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];

        if (userAudioTrack) {
          userAudioTrack.enabled = audio;
        } else {
          userStream.current.getAudioTracks()[0].enabled = audio;
        }
        socket.emit("toggle-media", { target: "audio" });
      }

      return {
        ...mediaList,
        me: { isVideo: video, isAudio: audio },
      };
    });
  };

  const toggleChatView = () => {
    if (displayParticipants && !displayChat) {
      setDisplayParticipants(!displayParticipants);
    }
    setDisplayChat(!displayChat);
  };

  const toggleParticipantsView = () => {
    if (displayChat && !displayParticipants) {
      setDisplayChat(!displayChat);
    }
    setDisplayParticipants(!displayParticipants);
  };

  const getClassName = () => {
    if (!peers) {
      return "cls1";
    }
    const number = peers.length;
    const string =
      number == 0
        ? "cls1"
        : number == 1
        ? "cls2"
        : number < 4
        ? "cls3"
        : "cls4";

    return string;
  };
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = (event) => {
    event.preventDefault();
    console.log("sending file");

    selectedFile.arrayBuffer().then((buffer) => {
      const chunkSize = 16 * 1024;

      peersRef.current.forEach((peerIndex) => {
        while (buffer.byteLength) {
          const chunk = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize, buffer.byteLength);
          peerIndex.peer.send(chunk);
        }
        peerIndex.peer.send("Done!");
      });
    });
  };

  const clickScreenSharing = () => {
    if (!isSharingScreen) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];
          setIsPresenter(true);
          socket.emit("start-screen-sharing");
          peersRef.current.forEach(({ peer }) => {
            // addTrack ( newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          screenTrack.onended = () => {
            socket.emit("stop-screen-sharing");
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setIsPresenter(false);
            setIsSharingScreen(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setIsSharingScreen(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  return (
    <div>
      {divNo === "2" ? (
        <div id="Preview">
          <div className="container d-flex flex-column  align-items-center justify-content-center">
            <header className="jumbotron p-5">
              <h3>
                Ready to join,<span>{userName}</span> ?!
              </h3>
            </header>
            <video
              className="mb-4"
              ref={prevUserVideoRef}
              autoPlay={true}
            ></video>
            <div>
              <button
                disabled={disablejoin}
                id="audioBtn"
                onClick={() => toggleMic(true)}
                className={
                  userVideoAudio["me"].isAudio
                    ? " btn btn-rounded btn-dark"
                    : "btn btn-rounded btn-danger"
                }
              >
                <i
                  className={
                    userVideoAudio["me"].isAudio
                      ? " fa fa-microphone"
                      : " fa fa-microphone-slash"
                  }
                ></i>
              </button>

              <button
                disabled={disablejoin}
                id="videoBtn"
                onClick={() => toggleCamera(true)}
                className={
                  userVideoAudio["me"].isVideo
                    ? " btn btn-rounded btn-dark"
                    : " btn btn-rounded btn-danger"
                }
              >
                <i
                  className={
                    userVideoAudio["me"].isVideo
                      ? "fa fa-video"
                      : "fa fa-video-slash"
                  }
                ></i>
              </button>
            </div>

            <div className="p-5">
              <button
                disabled={disablejoin}
                className="btn btn-info btn-dark"
                onClick={() => changeVisibilities()}
              >
                {" "}
                Join
              </button>
            </div>
            {participants === 0 ? (
              <div> Be the first to join the meeting..</div>
            ) : participants === 1 ? (
              <div> There is 1 person in the meeting..</div>
            ) : (
              <div> There are {participants} people in the meeting..</div>
            )}
          </div>
        </div>
      ) : null}

      {divNo === "3" ? (
        <div id="Room">
          <div className="clearfix teamHeader">
            <div className="pull-left p-3">
              <p>Meeting in channel</p>
            </div>
            <div className="mt-3 pull-right">
              <BtnGroup
                socket={socket}
                history={props.history}
                userStream={userStream}
                sId={socket.id}
                idx={id}
                isLeaver={isLeaver}
                setIsLeaver={setIsLeaver}
                toggleCamera={toggleCamera}
                toggleMic={toggleMic}
                toggleChatView={toggleChatView}
                toggleParticipantsView={toggleParticipantsView}
                userVideoAudio={userVideoAudio["me"]}
                clickScreenSharing={clickScreenSharing}
                destroyAllMyPeers={destroyAllMyPeers}
              />
            </div>
          </div>

          <div className=" full-screen  ">
            {isSharingScreen && !isPresenter ? (
              <div className="vid-container">
                <video
                  ref={screenShareRef}
                  autoPlay={true}
                  height={"100vh"}
                  width={"100vw"}
                ></video>
              </div>
            ) : (
              <div className="vid-container">
                <video
                  className={getClassName()}
                  ref={userVideoRef}
                  autoPlay={true}
                ></video>

                {peers &&
                  peers.map((peer, index, arr) =>
                    createUserVideo(peer, index, arr)
                  )}
              </div>
            )}

            <div className="">
              {" "}
              <Chat
                displayChat={displayChat}
                userName={userName}
                id={id}
                userId={userId}
                peersinRoom={peers}
                changeHandler={changeHandler}
                handleSubmission={handleSubmission}
              />
              {displayParticipants && (
                <div className="meeting-chats">
                  <div className="chat-title">
                    <p>Participants</p>
                  </div>
                  <div>
                    <ul className="messages-container">
                      {createParticipants({
                        name: userName + " (You)",
                        index: socket.id,
                        isAudio: userVideoAudio["me"].isAudio,
                        isVideo: userVideoAudio["me"].isVideo,
                      })}
                      {peers &&
                        peers.map((peer) =>
                          createParticipants({
                            name: peer.name,
                            index: peer.peerID,
                            isAudio: userVideoAudio[peer.name].isAudio,
                            isVideo: userVideoAudio[peer.name].isVideo,
                          })
                        )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Room;
