import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import Swal from "sweetalert2";
import Userservice from "../services/user.service";
//create a valid field alert

const UserTeams = (props) => {
  const [isMeeting, setIsMeeting] = useState(false);
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState([]);
  const [username, setUsername] = useState("");

  const getAllTeams = () => {
    console.log("getting all eamss");
    Userservice.getTeams()
      .then((response) => {
        console.log("teams response" + response.data);
        setTeams(response.data);
      })
      .catch((err) => {
        // setTimeout(getAllTeams, 3000);
      });
  };

  const addTeam = (team, isCode) => {
    Userservice.addTeam(team, isCode)
      .then((response) => {
        console.log("teams add response" + response.data);

        if (!isCode) {
          const { _id } = response.data;
          Swal.fire("created successfully");
          props.history.push(`teams/${_id}`);
        } else {
          if (response.data.exists) {
            const { _id } = response.data.team;
            Swal.fire("Team added successfully");
            props.history.push(`teams/${_id}`);
          } else throw "team doest exist try making a new one";
        }
      })
      // Swal.fire(`successfully added: ${team}`).then(() => {
      //   console.log(teams);
      //   teams.push(response.data);
      //   setTeams(teams);
      //   console.log(teams);
      //   console.log(response.data._id);
      // });

      //add to teams..the response data...
      // setTeams(response.data);

      .catch((err) => {
        console.log(err);
        // if (!isCode) {
        //   Swal.fire("created not successfully");
        // } else {
        //   Swal.fire("Team not added successfully");
        // }
        Swal.fire(err);
      });
  };
  const handleJoin = async () => {
    const { value: teamcode } = await Swal.fire({
      title: "Enter team code",
      input: "text",
      //inputLabel: "Your team name",
      inputPlaceholder: "Team code goes here",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    if (teamcode) {
      //req team addition
      console.log("requesting aadding" + teamcode);
      addTeam(teamcode, true);
      // .then((response) => {
      //   console.log(response);
      //   if (response.data.exists) {
      //     console.log(response.data.exists);
      //     console.log(response.data.team._id);
      //     const { _id } = response.data.team;
      //     props.history.push(`teams/${_id}`);
      //   } else Swal.fire("Team doesn't exist, try creating a new one");
      // });
    }
  };

  const handleClick = async () => {
    const { value: teamname } = await Swal.fire({
      title: "Enter team name",
      input: "text",
      //inputLabel: "Your team name",
      inputPlaceholder: "Team name goes here",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    if (teamname) {
      //req team addition
      addTeam(teamname, false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      props.history.push("/");
    }
    setUsername(localStorage.getItem("user"));
    getAllTeams();
    return () => {
      //Component Unmount
      if (Swal.isVisible()) {
        Swal.close();
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className=" bg-grey">
      <div className="teamHeader clearfix">
        <div className=" teamname pull-left p-4">Welcome {username}!</div>
        <div className="pull-right p-4">
          <button className="join btn btn-light" onClick={handleJoin}>
            Join team with a code
          </button>
        </div>
        <div className="pull-right p-4 ">
          <p>OR</p>
        </div>
        <div className="pull-right p-4">
          <button
            type="button"
            className="btn btn-dark pull-right pull-bottom"
            onClick={handleClick}
          >
            Create a new Team
          </button>
        </div>
      </div>
      <div className="team-container align-center ">
        {teams.map((team) => (
          <Link to={`/teams/${team._id}`}>
            <div key={team._id} className="team clearfix">
              <div className="  pull-left p-4"> {team.name}</div>
              <div className="pull-right p-4">
                <div className="join">Join</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserTeams;
