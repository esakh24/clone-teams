const config = require("../config/auth.config");

const mongoose = require("mongoose");
const Team = mongoose.model("Team");
const User = mongoose.model("User");
const Message = mongoose.model("Message");

const { v4: uuidv4 } = require("uuid");
const server = require("../server");
exports.addTeam = async (req, res) => {
  const { name, isCode } = req.body;
  if (!isCode) {
    const team = new Team({
      _id: uuidv4(),
      name,
    });
    await team.save();
    const user = await User.findOne({
      _id: req.userId,
    });

    user.teams.push({ name: name, _id: team._id });
    await user.save();
    res.status(200).send(team);
  } else {
    const team = await Team.findOne({
      _id: name,
    });
    const exists = !team ? "false" : "true";
    if (exists) {
      const update = {
        $addToSet: {
          teams: { name: team.name, _id: team._id },
        },
      };
      const user = await User.findByIdAndUpdate(
        req.userId,

        update,
        { returnOriginal: false }
      );
    }
    res.status(200).send({ team: team, exists: exists });
  }
};

exports.getAllTeams = async (req, res) => {
  const user = await User.findOne({
    _id: req.userId,
  });
  const myTeams = user.teams;
  res.status(200).send(myTeams);
};

exports.getPreviousMsgs = async (req, res) => {
  const id = req.body.id;

  const allmsgs = await Message.find({ teamId: id });
  const team = await Team.findOne({
    _id: id,
  });
  const name = team.name;
  res.status(200).send({ info: { name, allmsgs } });
};

exports.getPermission = async (req, res) => {
  const { RoomId, teamId } = req.body;
  const team = await Team.findOne({
    _id: teamId,
  });
  // add user if not
  //throe error
  const name = team.name;
  if (!team) {
    throw "team doesnt exist";
  }

  const update = {
    $addToSet: {
      teams: { name: team.name, _id: team._id },
    },
  };

  const user = await User.findByIdAndUpdate(req.userId, update, {
    returnOriginal: false,
  });

  const number = server.findNoOfParticipants(RoomId);
  res.status(200).send({ participants: number });
};
