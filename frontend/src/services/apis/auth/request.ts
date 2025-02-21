import keyValue from "@/commons/key-value";
import api from "@/services/apis/api";
import {
  IAuthLogin,
  IResponseAuthLogin,
  IResponseGetNonce,
  IResponseUploadFile,
} from "./types";

export const authLogin = async (
  body: IAuthLogin
): Promise<IResponseAuthLogin> => {
  const response = await api.post("/auth/login", {
    wallet_address: body.wallet_address,
    signature: body.signature,
  });
  return response.data;
};

export const authLogout = () => {
  localStorage.removeItem(keyValue.accessToken);
  localStorage.removeItem(keyValue.user);
};

// API call to upload the file
export const uploadFileRequest = async (
  body: FormData
): Promise<IResponseUploadFile> => {
  const response = await api.post("/upload-file", body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const authGetNonce = async (
  wallet_address: string
): Promise<IResponseGetNonce> => {
  const response = await api.get(
    `/auth/nonce?wallet_address=${wallet_address}`
  );
  return response.data;
};
