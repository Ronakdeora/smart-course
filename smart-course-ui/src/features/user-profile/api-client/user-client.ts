import apiClient from "@/lib/api-client/general-api-client";
import type { UserProfileDto } from "../utils/dto";

class UserClient {
  public updateUserProfile(request: UserProfileDto) {
    return apiClient.patch("user-service/users", request);
  }
}

export default UserClient;
