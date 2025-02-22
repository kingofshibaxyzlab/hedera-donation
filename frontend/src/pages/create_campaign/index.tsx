import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavBar";
import env from "@/env";
import { useUploadFile } from "@/services/apis/auth";
import {
  useCampaignTypes,
  useCreateCampaign,
  useTokens,
} from "@/services/apis/core";
import { Editor } from "@tinymce/tinymce-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface FormValues {
  title: string;
  campaign_type_id: string;
  summary: string;
  description: string;
  token_id: string;
  goal: number;
  video_link?: string;
  project_url?: string;
  image?: string;
}

const CreateCampaignPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      campaign_type_id: "",
      summary: "",
      description: "",
      token_id: "",
      goal: 0,
      video_link: "",
      project_url: "",
    },
  });

  const { data: campaignTypes, isLoading: isTypesLoading } = useCampaignTypes();
  const { data: tokens, isLoading: isTokensLoading } = useTokens();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { mutate: uploadFile, isPending: isPendingUploadFile } =
    useUploadFile();

  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [descriptionValue, setDescriptionValue] = useState<string>("");

  useEffect(() => {
    if (campaignTypes && campaignTypes.length > 0) {
      setValue("campaign_type_id", String(campaignTypes[0].id));
    }
  }, [campaignTypes, setValue]);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setValue("token_id", String(tokens[0].id));
    }
  }, [tokens, setValue]);

  const handleImageUpload = (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);

    uploadFile(uploadData, {
      onSuccess: (data) => {
        setUploadedImage(`${data.file_url}`);
        toast.success("Image uploaded successfully!");
      },
      onError: (error: any) => {
        toast.error(`Error uploading image: ${error.message}`);
      },
    });
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      image: uploadedImage,
      goal: Number(data.goal),
      description: descriptionValue,
    };
    createCampaign(payload, {
      onSuccess: () => {
        toast.success("Campaign created successfully!");
        reset();
        setUploadedImage("");
        setDescriptionValue("");
      },
      onError: (error) => {
        toast.error(`Error creating campaign: ${error.message}`);
      },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavigationBar />
      <div className="flex justify-center items-center flex-1 py-16 px-6">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-3xl">
          <h2 className="text-4xl font-bold text-blue-800 mb-8 text-center">
            Create a Campaign
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Campaign Title */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter campaign title"
                {...register("title", {
                  required: "Campaign title is required",
                })}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Campaign Type */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Type
              </label>
              <select
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                {...register("campaign_type_id", {
                  required: "Campaign type is required",
                })}
                disabled={isTypesLoading}
              >
                <option value="" disabled>
                  {isTypesLoading ? "Loading..." : "Select campaign type"}
                </option>
                {campaignTypes?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.campaign_type_id && (
                <p className="text-red-500">
                  {errors.campaign_type_id.message}
                </p>
              )}
            </div>

            {/* Campaign Summary */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Summary
              </label>
              <textarea
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Provide a short summary of your campaign"
                rows={3}
                {...register("summary", {
                  required: "Summary is required",
                })}
              ></textarea>
              {errors.summary && (
                <p className="text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Campaign Description using TinyMCE Editor */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Description
              </label>
              <Editor
                apiKey={env.TINYMCE_API_KEY}
                value={descriptionValue}
                init={{
                  branding: false,
                  height: 300,
                  menubar: false,
                  plugins:
                    "link image media table codesample fullscreen preview code lists",
                  toolbar:
                    "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | link image media | fullscreen preview code",
                }}
                onEditorChange={(content) => setDescriptionValue(content)}
              />
            </div>

            {/* Donation Goal */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Donation Goal
              </label>
              <div className="flex items-center mt-2 space-x-4">
                {/* Token Type Selector */}
                <select
                  className="w-1/3 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  {...register("token_id", {
                    required: "Token type is required",
                  })}
                  disabled={isTokensLoading}
                >
                  <option value="" disabled>
                    {isTokensLoading ? "Loading..." : "Select token"}
                  </option>
                  {tokens?.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                {/* Goal Amount */}
                <input
                  type="number"
                  className="w-2/3 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter goal amount"
                  {...register("goal", { required: "Goal amount is required" })}
                />
              </div>
              {errors.token_id && (
                <p className="text-red-500">{errors.token_id.message}</p>
              )}
              {errors.goal && (
                <p className="text-red-500">{errors.goal.message}</p>
              )}
            </div>

            {/* Campaign Image */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
              {isPendingUploadFile ? (
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-700">
                    Uploading...
                  </h4>
                  <div className="animate-pulse flex flex-col space-y-4">
                    <div className="h-48 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              ) : (
                uploadedImage && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-700">
                      Preview:
                    </h4>
                    <img
                      src={uploadedImage}
                      alt="Uploaded Preview"
                      className="w-full h-auto rounded-md shadow-md mt-2"
                    />
                  </div>
                )
              )}
            </div>

            {/* Campaign Video Link */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Video Link (Optional)
              </label>
              <input
                type="url"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter YouTube or Vimeo link"
                {...register("video_link")}
              />
            </div>

            {/* Project URL */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700">
                Project URL (Optional)
              </label>
              <input
                type="url"
                className="w-full mt-2 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter link to the project website"
                {...register("project_url")}
              />
            </div>
            <div className="text-center text-red-600 text-sm mb-4">
              <p>
                Campaigns require admin approval. Please wait for the admin to
                review and approve your campaign. Once approved, your campaign
                will be published. *
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-400 text-blue-800 py-3 px-6 rounded-full font-semibold shadow-md hover:bg-yellow-500 hover:shadow-lg transition-all duration-300 mt-8"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Campaign"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateCampaignPage;
