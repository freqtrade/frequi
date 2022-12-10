/**
 * Payload the user enters, which is required for login.
 */
export interface AuthPayload {
  botName: string;
  url: string;
  username: string;
  password: string;
}

/** Response from the API */
export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
}

/** Stored Authentication */
export interface AuthStorage {
  botName: string;
  apiUrl: string;
  username?: string;
  refreshToken: string;
  accessToken: string;
  autoRefresh: boolean;
}

/** Auth Storage container */
export interface AuthStorageMulti {
  [key: string]: AuthStorage;
}

export interface BotDescriptor {
  botName: string;
  botId: string;
  botUrl: string;
}

export interface BotDescriptors {
  [key: string]: BotDescriptor;
}

export interface RenameBotPayload {
  botId: string;
  botName: string;
}
