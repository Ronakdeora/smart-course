import apiClient from "@/lib/api-client/general-api-client";
import type { UserProfileDto } from "../utils/dto";

class UserClient {
  public updateUserProfile(request: UserProfileDto) {
    return apiClient.patch("user-service/profile", request);
  }

  public getUserProfile() {
    return apiClient.get("user-service/profile");
  }
}

export default UserClient;
