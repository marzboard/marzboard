export const getAuthToken = () => localStorage.getItem("token") || "";
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};
export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

export const getMarzbanServer = () =>
  localStorage.getItem("marzbanserver") || "";
export const setMarzbanServer = (marzbanserver: string) => {
  localStorage.setItem("marzbanserver", marzbanserver);
};
