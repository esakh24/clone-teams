import React from "react";
//if logged in redirectt to teams page else to login
const IndexPage = (props) => {
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      props.history.push("/home");
    } else {
      props.history.push("/teams");
    }
  }, []);
  return <div></div>;
};

export default IndexPage;
