export interface AuthPayload {
  botName: string;
  url: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
}

export interface AuthStorage {
  botName: string;
  apiUrl: string;
  refreshToken: string;
  accessToken: string;
  autoRefresh: boolean;
}

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
