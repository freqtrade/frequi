export interface AuthPayload {
  url: string;
  username: string;
  password: string;
}

export interface AuthStorage {
  apiUrl: string;
  refreshToken: string;
  accessToken: string;
}
