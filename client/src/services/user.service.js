import axios from "axios";

const API_URL = "http://localhost:8081";
const getTeams = () => {
  console.log(API_URL + "getting all eamss" + localStorage.getItem("token"));
  return axios.get(API_URL + "/api/user/teams", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
};

const getMsgs = (id) => {
  console.log("posting to " + id);
  return axios.post(
    `${API_URL}/api/user/teams/msgs`,
    {
      id: id,
    },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};

const joinMeeting = (id) => {
  return axios.post(
    `${API_URL}/api/user/teams/join`,
    {
      RoomId: `room_${id}`,
      teamId: id,
    },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};

const addTeam = (teamName, isCode) => {
  console.log("posting " + teamName + isCode);
  return axios.post(
    API_URL + "/api/user/add_team",
    {
      name: teamName,
      isCode: isCode,
    },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};

// const getModeratorBoard = () => {
//   return axios.get(API_URL + "mod", { headers: authHeader() });
// };

// const getAdminBoard = () => {
//   return axios.get(API_URL + "admin", { headers: authHeader() });
// };

export default {
  getTeams,
  addTeam,
  getMsgs,
  joinMeeting,
};

//a service for accessing data
