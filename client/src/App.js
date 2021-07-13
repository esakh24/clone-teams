import React, { useState, useEffect } from "react";
import { Switch, Route, Link } from "react-router-dom";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./App.css";
import "./services/room.css";
import AuthService from "./services/auth.service";
import IndexPage from "./IndexPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import BoardUser from "./components/meeting/Room";
import Room from "./components/meeting/Room";
import Team from "./components/Team";
import UserTeams from "./components/UserTeams";
import socket from "./socket.client";

const App = (props) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isMeeting, setIsMeeting] = useState(false);
  const socketConnect = () => {
    const token = localStorage.getItem("token");
  };
  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
  };

  return (
    <div>
      {!isMeeting && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-4">
          <Link to={"/"} className="navbar-brand">
            Teams-clone
          </Link>

          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <a
                  href="/login"
                  className=" nav-item nav-link"
                  onClick={logOut}
                >
                  LogOut
                </a>
              </div>
            ) : (
              <div className="navbar-nav ml-auto">
                <Link to={"/login"} className=" nav-item nav-link">
                  Login
                </Link>

                <Link to={"/register"} className=" nav-item nav-link">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
      <div>
        <Switch>
          <Route exact path="/" component={IndexPage} exact />
          <Route exact path={"/home"} component={Home} />
          <Route
            exact
            path="/login"
            render={() => <Login socketConnect={socketConnect} />}
          />{" "}
          <Route exact path="/register" component={Register} />
          <Route exact path="/user" component={BoardUser} />
          <Route exact path="/teams" component={UserTeams} />
          <Route
            exact
            path="/teams/:id"
            render={() => <Team socket={socket} />}
          />
          <Route
            exact
            path="/teams/join/:id"
            render={() => (
              <Room
                socket={socket}
                isMeeting={isMeeting}
                setIsMeeting={setIsMeeting}
              />
            )}
          />
          {/* <Route
            exact
            path="/*"
             />404 NOT FOUND */}
        </Switch>
      </div>
    </div>
  );
};

export default App;
