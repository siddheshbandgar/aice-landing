/**
 * Collects comprehensive user data for analytics
 */

export interface UserData {
  // Basic info
  email: string;
  subscribedAt: string;
  source: string;

  // Location data
  location?: {
    country?: string;
    countryCode?: string;
    region?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
  };

  // Device & Browser
  device: {
    userAgent: string;
    platform: string;
    language: string;
    languages: string[];
    screenWidth: number;
    screenHeight: number;
    screenColorDepth: number;
    pixelRatio: number;
    deviceType: "mobile" | "tablet" | "desktop";
    isMobile: boolean;
    cookieEnabled: boolean;
    online: boolean;
  };

  // Referral data
  referral?: {
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  };

  // Session data
  session: {
    sessionId: string;
    pageLoadTime: string;
    timeOnPage?: number;
  };
}

/**
 * Get device type from user agent
 */
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
  
  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  return "desktop";
}

/**
 * Get UTM parameters from URL
 */
function getUTMParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
  };
}

/**
 * Get location data from IP (using free API)
 */
async function getLocationData(): Promise<UserData["location"]> {
  try {
    // Using ip-api.com (free, no API key needed, 45 req/min)
    const response = await fetch("http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp");
    const data = await response.json();
    
    if (data.status === "success") {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
      };
    }
  } catch (error) {
    console.error("Error fetching location:", error);
  }
  return undefined;
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

/**
 * Collect all user data
 */
export async function collectUserData(email: string, source: string = "landing_page"): Promise<UserData> {
  if (typeof window === "undefined") {
    throw new Error("This function must be called in the browser");
  }

  const pageLoadTime = new Date().toISOString();
  const sessionId = generateSessionId();

  // Collect device data
  const device: UserData["device"] = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    deviceType: getDeviceType(),
    isMobile: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()),
    cookieEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
  };

  // Collect referral data
  const utmParams = getUTMParams();
  const referral: UserData["referral"] = {
    referrer: document.referrer || undefined,
    ...utmParams,
  };

  // Get location data (async)
  const location = await getLocationData();

  return {
    email,
    subscribedAt: new Date().toISOString(),
    source,
    location,
    device,
    referral,
    session: {
      sessionId,
      pageLoadTime,
    },
  };
}

