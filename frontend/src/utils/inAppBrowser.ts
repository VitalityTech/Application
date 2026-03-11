const TELEGRAM_UA_MARKER = "telegram";

export const isTelegramInAppBrowser = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.userAgent.toLowerCase().includes(TELEGRAM_UA_MARKER);
};