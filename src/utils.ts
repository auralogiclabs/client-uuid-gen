/**
 * Client UUID Generation
 * (c) Auralogic Labs, 2025
 */

export const getOS = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown OS';
  const ua = navigator.userAgent;

  const iosMatch = /OS (\d+)_/.exec(ua);
  if (/iPhone|iPad|iPod/.test(ua)) return iosMatch ? `iOS ${iosMatch[1]}` : 'iOS';

  const androidMatch = /Android (\d+(\.\d+)?)/.exec(ua);
  if (/Android/.test(ua)) return androidMatch ? `Android ${androidMatch[1]}` : 'Android';

  const winMatch = /Windows NT (\d+\.\d+)/.exec(ua);
  if (/Windows NT/.test(ua)) return winMatch ? `Windows ${winMatch[1]}` : 'Windows';

  const macMatch = /Mac OS X (\d+[_\d]*)/.exec(ua);
  if (/Mac OS X/.test(ua))
    return macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';

  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
};

export const getBrowser = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown Browser';
  const ua = navigator.userAgent;

  const edgeMatch = /Edg\/(\d+)/.exec(ua);
  if (/Edg\//.test(ua)) return edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';

  const chromeMatch = /Chrome\/(\d+)/.exec(ua);
  if (/Chrome\//.test(ua) && !/Edg/.test(ua))
    return chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';

  const safariMatch = /Version\/(\d+)/.exec(ua);
  if (/Safari\//.test(ua) && !/Chrome/.test(ua))
    return safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';

  const ffMatch = /Firefox\/(\d+)/.exec(ua);
  if (/Firefox\//.test(ua)) return ffMatch ? `Firefox ${ffMatch[1]}` : 'Firefox';

  return 'Unknown Browser';
};

export const getDeviceType = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  if (/iPad|Tablet|PlayBook/i.test(ua)) return 'tablet';
  if (/Smart-?TV|GoogleTV|AppleTV|HbbTV|NetCast\.TV/i.test(ua)) return 'smarttv';
  return 'desktop';
};
