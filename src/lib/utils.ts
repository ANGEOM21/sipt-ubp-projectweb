import axios, { AxiosError } from "axios";
import { axiosInstance } from "./axios";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[] | string>;
  status_code?: string | number;
};

export function extractAxiosMessage(err: AxiosError<ApiErrorBody> | Error | unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const apiMsg = err.response?.data?.message;
    return apiMsg ?? err.message ?? "Terjadi kesalahan jaringan";
  }
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan yang tidak diketahui";
}

export function setAuthHeaderFromToken(token: string | null) {
  if (!token) return;
  axiosInstance.defaults.headers.common["Authorization"] = token;
}


// ==== NEW: status helpers ====
export function normalizeStatusCode(code: string | number | undefined): string {
  if (code === undefined || code === null) return ""; // tidak ada → biarkan HTTP yg bicara
  return String(code).trim();
}

export function isApiUnauthorized(code: string | number | undefined): boolean {
  const s = normalizeStatusCode(code);
  return s === "401" || s === "403";
}

export function isApiOk(code: string | number | undefined, messages?: string): boolean {
  const s = normalizeStatusCode(code);
  // API lokal pakai "000"/"00"/"0" buat success
  const zeroLike = s === "0" || s === "00" || s === "000";
  const httpOk = s === "200" || s === "201" || s === "204" || s === ""; // "" = ga ada status_code
  const messageOk = typeof messages === "string" && messages.toLowerCase() === "success";
  return zeroLike || httpOk || messageOk;
}
