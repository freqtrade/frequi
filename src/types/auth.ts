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
  sortId?: number;
}

export interface AuthStorageWithBotId extends AuthStorage {
  botId: string;
}

/** Auth Storage container */
export interface AuthStorageMulti {
  [key: string]: AuthStorage;
}

export interface BotDescriptor {
  botName: string;
  botId: string;
  botUrl: string;
  sortId?: number;
}

export interface BotDescriptors {
  [key: string]: BotDescriptor;
}
