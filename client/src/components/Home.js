//don’t need to log in to view this page.
import React, { useState, useEffect } from "react";
import "../App.css";

const Home = () => {
  useEffect(() => {}, []);

  return (
    <div className="banner-section-bg-container">
      <div className="container">
        {/* <h3>{content}</h3> */}
        <div class=" d-flex flex-column justify-content-center">
          <div class="text-center ">
            <h1 class="banner-heading m-3">Teams-Clone</h1>
            <h3 class="top-heading">One-place to chat with your friends!</h3>
            <div className="my-card">
              {" "}
              <h3>
                Signup, create teams and share team-codes to invite your
                friends...
              </h3>
            </div>
            <div className="my-card">
              <h5>Make group video calls!!</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
