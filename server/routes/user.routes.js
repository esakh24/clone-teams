const { jwtAuth } = require("../middleware");
const controller = require("../controllers/userTeams.controller");
//apis for user interface
module.exports = function (app) {
  app.get("/api/user/teams", [jwtAuth.verifyToken], controller.getAllTeams);

  app.post("/api/user/add_team", [jwtAuth.verifyToken], controller.addTeam);

  app.post(
    "/api/user/teams/msgs",
    [jwtAuth.verifyToken],
    controller.getPreviousMsgs
  );
  app.post(
    "/api/user/teams/join",
    [jwtAuth.verifyToken],
    controller.getPermission
  );
};
