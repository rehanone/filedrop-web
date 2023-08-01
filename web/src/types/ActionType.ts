export enum ActionType {
  // Application state
  SET_ERROR = 'SET_ERROR',
  SET_CONNECTED = 'SET_CONNECTED',
  SET_RTC_CONFIGURATION = 'SET_RTC_CONFIGURATION',
  SET_NETWORK_NAME = 'SET_NETWORK_NAME',
  SET_CLIENT_ID = 'SET_CLIENT_ID',
  SET_CLIENT_NAME = 'SET_CLIENT_NAME',
  SET_SUGGESTED_NETWORK_NAME = 'SET_SUGGESTED_NETWORK_NAME',
  SET_LOCAL_NETWORK_NAMES = 'SET_LOCAL_NETWORK_NAMES',
  SET_REMOTE_ADDRESS = 'SET_REMOTE_ADDRESS',
  SET_NETWORK = 'SET_NETWORK',
  SET_MAX_SIZE = 'SET_MAX_SIZE',
  SET_NOTICE = 'SET_NOTICE',
  SET_KEY_PAIR = 'SET_KEY_PAIR',

  // App info
  SET_APP_NAME = 'SET_APP_NAME',
  SET_ABUSE_EMAIL = 'SET_ABUSE_EMAIL',

  // Dismiss
  DISMISS_ERROR = 'DISMISS_ERROR',

  // Web Sockets
  PREPARE_MESSAGE = 'PREPARE_MESSAGE',
  WS_SEND_MESSAGE = 'WS_SEND_MESSAGE',
  WS_MESSAGE = 'WS_MESSAGE',
  WS_CONNECTED = 'WS_CONNECTED',
  WS_DISCONNECTED = 'WS_DISCONNECTED',
  WS_CONNECT = 'WS_CONNECT',

  // Transfers
  ADD_TRANSFER = 'ADD_TRANSFER',
  REMOVE_TRANSFER = 'REMOVE_TRANSFER',
  UPDATE_TRANSFER = 'UPDATE_TRANSFER',

  // Incoming transfers
  ACCEPT_TRANSFER = 'ACCEPT_TRANSFER',
  REJECT_TRANSFER = 'REJECT_TRANSFER',

  // Outgoing transfers
  CREATE_TRANSFER = 'CREATE_TRANSFER',
  CANCEL_TRANSFER = 'CANCEL_TRANSFER',

  // Active transfers
  ADD_ICE_CANDIDATE = 'ADD_ICE_CANDIDATE',
  SET_LOCAL_DESCRIPTION = 'SET_LOCAL_DESCRIPTION',
  SET_REMOTE_DESCRIPTION = 'SET_REMOTE_DESCRIPTION',

  // Chat
  ADD_CHAT_ITEM = 'ADD_CHAT_ITEM',
  SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE',

  // Settings
  SET_AUTO_ACCEPT = 'SET_AUTO_ACCEPT',
}
