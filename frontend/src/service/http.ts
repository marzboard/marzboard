import { $fetch as ohMyFetch, FetchOptions } from "ohmyfetch";
import { getAuthToken, getMarzbanServer } from "../auth/authStorage";

export const $fetch = ohMyFetch.create({
  baseURL: "/api/",
});

export const fetcher = (url: string, ops: FetchOptions<"json"> = {}) => {
  const token = getAuthToken();
  const server = getMarzbanServer();
  if (token) {
    ops["headers"] = {
      ...(ops?.headers || {}),
      Authorization: token,
      Marzbanserver: server,
    };
  }
  return $fetch(url, ops);
};

export const fetch = fetcher;
