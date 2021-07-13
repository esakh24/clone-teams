import React, { useEffect, useState, useRef } from "react";
import "./chats.css";
import { useParams } from "react-router-dom";
import Form from "react-validation/build/form";

import Input from "react-validation/build/input";
import socket from "../../../socket.client";
const Chat = ({
  displayChat,
  id,
  userId,
  userName,
  changeHandler,
  handleSubmission,
}) => {
  const [messages, setMessages] = useState([]);
  const messagesEnd = useRef(null);
  const messageRef = useRef();

  //on msg receive,update the msgList
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      //msg has:id, userId, msg, username
      const newMessages = [...messages, message];
      console.log("all msgsss" + newMessages);
      setMessages(newMessages);
    });
  }, [messages]);

  // Scroll to Bottom of Message List
  //  useEffect(() => {scrollToBottom()}, [messages])

  // const scrollToBottom = () => {
  //   messagesEnd.current.scrollIntoView({ behavior: 'smooth'});
  // }

  const sendMessage = () => {
    const msg = messageRef.current.value.trim();
    if (msg !== null || msg != "") {
      if (socket) {
        socket.emit("sendMessage", {
          userId,
          userName,
          id,
          message: messageRef.current.value,
        });

        messageRef.current.value = "";
      }
    }
  };
  return !displayChat ? (
    <></>
  ) : (
    <div className="meeting-chats">
      <div className="chat-title">
        <p>Meeting Chats</p>
      </div>
      <div className="messages-container ">
        {messages &&
          messages.map((message, i) => (
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
        <div>
          <span>
            <input
              type="text"
              name="message"
              placeholder="Say something!"
              ref={messageRef}
            />
          </span>
          <span>
            <button className="join" onClick={sendMessage}>
              Send
            </button>
          </span>
          <div>
            <input type="file" name="file" onChange={changeHandler} />

            <button onClick={handleSubmission}>Submit</button>
          </div>
        </div>
      </div>

      <div style={{ float: "left", clear: "both" }} ref={messagesEnd} />
    </div>
  );
};

export default Chat;
