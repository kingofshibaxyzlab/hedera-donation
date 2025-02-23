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
// export const uploadFileRequest = async (
//   body: FormData
// ): Promise<IResponseUploadFile> => {
//   const response = await api.post("/upload-file", body, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return response.data;
// };

export const uploadFileRequest = async (
  body: FormData
): Promise<IResponseUploadFile> => {
  try {
    // Extract the file and its name from the provided FormData.
    const file = body.get("file") as File;
    const fileName = file.name;
    if (!file || !fileName) {
      throw new Error("Missing file or fileName in form data");
    }

    // Step 1: Request pre-signed POST data from the backend.
    const presignedPostResponse = await api.post(
      `/generate-presigned-post`,
      { key: fileName },
      { headers: { accept: "application/json" } }
    );
    const { url, fields } = presignedPostResponse.data;
    const uniqueFileName = fields.key;
    // Step 2: Build a new FormData object for the S3 upload.
    const s3FormData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      s3FormData.append(key, value as string);
    });
    s3FormData.append("file", file);

    // Step 3: Upload the file directly to S3 using the pre-signed POST URL.
    const s3UploadResponse = await fetch(url, {
      method: "POST",
      body: s3FormData,
    });
    if (!s3UploadResponse.ok) {
      throw new Error("File upload to S3 failed");
    }

    // Step 4: Request a pre-signed GET URL for the uploaded file.
    const presignedGetResponse = await api.post(
      `/generate-presigned-get-url`,
      { key: uniqueFileName },
      { headers: { accept: "application/json" } }
    );
    const { url: fileUrl } = presignedGetResponse.data;

    // Return the GET URL and file name.
    return { file_url: fileUrl, file_name: uniqueFileName };
  } catch (error) {
    console.error("Error during file upload flow:", error);
    throw error;
  }
};

export const authGetNonce = async (
  wallet_address: string
): Promise<IResponseGetNonce> => {
  const response = await api.get(
    `/auth/nonce?wallet_address=${wallet_address}`
  );
  return response.data;
};
