const TELEGRAM_UA_MARKER = "telegram";
const ANDROID_UA_MARKER = "android";
const IOS_UA_REGEX = /iphone|ipad|ipod/i;

export const isTelegramInAppBrowser = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.userAgent.toLowerCase().includes(TELEGRAM_UA_MARKER);
};

export const isAndroidDevice = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.userAgent.toLowerCase().includes(ANDROID_UA_MARKER);
};

export const isIosDevice = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return IOS_UA_REGEX.test(navigator.userAgent);
};

export const getTelegramExternalBrowserHref = (currentUrl: string): string => {
  if (!isTelegramInAppBrowser()) {
    return currentUrl;
  }

  if (!isAndroidDevice()) {
    if (isIosDevice()) {
      // iOS Telegram usually opens x-safari-* links in the system Safari browser.
      return `x-safari-${currentUrl}`;
    }

    return currentUrl;
  }

  try {
    const parsedUrl = new URL(currentUrl);
    const pathWithQuery = `${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    const protocol = parsedUrl.protocol.replace(":", "") || "https";

    // Android Telegram often keeps links inside webview; intent:// asks OS to open Chrome.
    return `intent://${pathWithQuery}#Intent;scheme=${protocol};package=com.android.chrome;end`;
  } catch {
    return currentUrl;
  }
};
