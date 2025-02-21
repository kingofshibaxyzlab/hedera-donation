import { createMutation, createQuery } from "react-query-kit";
import { authGetNonce, authLogin, uploadFileRequest } from "./request";
import { IResponseGetNonce } from "./types";

export const useLogin = createMutation({
  mutationFn: authLogin,
});

export const useUploadFile = createMutation({
  mutationFn: uploadFileRequest,
});

export const useNonce = createQuery<
  IResponseGetNonce,
  { walletAddress: string }
>({
  queryKey: ["useNonce"],
  fetcher: ({ walletAddress }) => authGetNonce(walletAddress),
});
