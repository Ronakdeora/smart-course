import { useState } from "react";
import { Button } from "./ui/button";
import apiClient from "@/lib/api-client/general-api-client";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const onsubmit = () => {
    apiClient
      .get("user-service/user/getUser")
      .then((response) => {
        const user = response.data;
        setUser(user);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return <Button onClick={onsubmit}> {user || "Submit"}</Button>;
};

export default UserProfile;
