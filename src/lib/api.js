const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port === '3000' || !window.location.port ? '4000' : window.location.port;

  return `${protocol}//${hostname}:${port}/api`;
};

const getUploadsUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const baseUrl = envUrl ? envUrl.replace('/api', '') : `${window.location.protocol}//${window.location.hostname}:4000`;
  return `${baseUrl}/uploads`;
};

export const API_URL = getApiUrl();
export const UPLOADS_URL = getUploadsUrl();
