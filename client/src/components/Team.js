import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Input from "react-validation/build/input";
import Form from "react-validation/build/form";
import useClippy from "use-clippy";
import axios from "axios";
import { Link } from "react-router-dom";
import Userservice from "../services/user.service";
import { withRouter } from "react-router-dom";
import Swal from "sweetalert2";
const Team = (props) => {
  const { id } = useParams();
  const socket = props.socket;
  const [messages, setMessages] = useState([]);
  const messageRef = useRef();
  const [userId, setUserId] = useState("");

  const [teamName, setTeamName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [clipboard, setClipboard] = useClippy();
  const userName = JSON.parse(localStorage.getItem("user"));
  const getAllMsgs = () => {
    console.log("getting msgs");
    Userservice.getMsgs(id)
      .then((response) => {
        console.log("got response");
        console.log("msgs response" + response.data.info);
        const { name, allmsgs } = response.data.info;
        console.log(name);
        console.log(allmsgs);
        setTeamName(name);
        setMessages(allmsgs);
      })
      .catch((err) => {
        console.log("errorin rete msgs" + err);
        // setTimeout(getAllTeams, 3000);
      });
  };
  const required = (value) => {
    if (!value) {
      return (
        <div className="alert alert-danger p-5" role="alert">
          This field is required!
        </div>
      );
    }
  };
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage) {
      if (socket) {
        socket.emit("sendMessage", {
          userId,
          userName,
          id,
          message: newMessage,
        });

        setNewMessage("");
      }
    }
  };
  const joinMeeting = () => {
    console.log("joinmeeetingclicked");
    props.history.push("/teams/join/" + id);
  };
  const shareCode = async (id) => {
    const { value: teamId } = await Swal.fire({
      title: "Copy this code to invite them to the team!",
      input: "text",
      inputValue: id,
      confirmButtonText: `Copy`,
      showCancelButton: false,
    });
    if (teamId) {
      //req team addition

      setClipboard(teamId);
    }
  };
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));

    //setUsername(name);
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
      console.log(payload.id);
    }
    if (socket) {
      socket.emit("join-chat-room", {
        id,
        userId,
      });

      // eslint-disable-next-line
    }
    getAllMsgs();
    return () => {
      //Component Unmount
      if (Swal.isVisible()) {
        Swal.close();
      }
      if (socket) {
        socket.emit("leaveRoom", {
          id,
        });
      }
    };
  }, []);
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      //msg has:id, userId, msg, username
      const newMessages = [...messages, message];
      console.log("all msgsss" + newMessages);
      setMessages(newMessages);
    });
    // return () => {
    //   setMessages("");
    // };
  }, [messages]);
  return (
    <div className="chatroomPage">
      <div className="chatroomSection">
        <div className="teamHeader clearfix">
          <div className=" teamname pull-left p-4">{teamName}</div>
          <div className="pull-right p-4">
            <button className="join btn btn-light" onClick={joinMeeting}>
              Meet now
            </button>
          </div>
          <div className="pull-right p-4">
            <button
              className="join btn btn-light"
              onClick={() => shareCode(id)}
            >
              Invite others!
            </button>
          </div>
        </div>
        <div className="messages-container">
          {messages.map((message, i) => (
            <div className="m-3">
              <span
                key={i}
                className={
                  userId === message.userId
                    ? "myMessage ml-auto"
                    : "otherMessage mr-auto"
                }
              >
                {userId !== message.userId && (
                  <span className="person-name">{message.username}:</span>
                )}
                <span className="message-text">{message.msg}</span>
              </span>
              <br></br>
            </div>
          ))}
        </div>
        <div className="chatroomActions  footer">
          <Form onSubmit={(event) => sendMessage(event)}>
            <div>
              <div className="form-group">
                <Input
                  type="text"
                  value={newMessage}
                  className="form-control"
                  placeholder="Say something!"
                  onChange={(e) => setNewMessage(e.target.value.trim())}
                />
              </div>

              <div className="form-group">
                <button className="btn btn-dark btn-rounded join" type="submit">
                  Send
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Team);
