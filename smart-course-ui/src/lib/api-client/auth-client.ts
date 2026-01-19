import type { registerRequest } from "@/hooks/auth-hooks/useAuth";
import apiClient from "./general-api-client";
import type { loginRequest } from "@/hooks/auth-hooks/useLogin";

class AuthClient {
  public register(request: registerRequest) {
    return apiClient.post("auth-service/auth/register", {
      email: request.email,
      full_name: request.full_name,
      password: request.password,
    });
  }
  public login(request: loginRequest) {
    return apiClient.post("auth-service/auth/login", {
      email: request.email,
      password: request.password,
    });
  }

  public logout() {
    return apiClient.post("auth-service/auth/logout");
  }

  public googleTokenExchange(authorizationCode: string) {
    return apiClient.post("auth-service/auth/google/exchange", {
      code: authorizationCode,
    });
  }
}

export default AuthClient;
