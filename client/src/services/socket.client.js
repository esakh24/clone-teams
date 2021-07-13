const iceServers = {
  iceServers: [
    { url: "stun:stun.services.mozilla.com" },
    { url: "stun:stun.l.google.com:19302" },
  ],
};

const streamConstraints = { audio: true, video: true };
const isCaller = "false";
