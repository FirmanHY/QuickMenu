import axios from "axios"; // Gunakan axios
import { CLOUDINARY_CONFIG } from "../constants/config";
import { ImagePickerResponse } from "react-native-image-picker";

const CLOUDINARY_CLOUD_NAME = CLOUDINARY_CONFIG.CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_CONFIG.UPLOAD_PRESET;

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
}

export const uploadImageToCloudinary = async (
    imageUri: ImagePickerResponse | null,
    folder: string = "recipes"
): Promise<CloudinaryUploadResponse> => {
    try {
        if (!imageUri?.assets || imageUri.assets.length === 0) {
            throw new Error("Tidak ada gambar yang dipilih");
        }

        const imageData = imageUri.assets[0];
        if (!imageData.base64) {
            throw new Error(
                "Base64 string not found. Pastikan includeBase64: true di ImagePicker"
            );
        }

        const base64Img = `data:${imageData.type};base64,${imageData.base64}`;

        const formData = new FormData();

        formData.append("file", base64Img);

        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", folder);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return {
            secure_url: response.data.secure_url,
            public_id: response.data.public_id,
            width: response.data.width,
            height: response.data.height
        };
    } catch (error: any) {
        if (error.response) {
            console.error("Cloudinary Error Data:", error.response.data);
            console.error("Cloudinary Error Status:", error.response.status);
            throw new Error(
                error.response.data.error?.message ||
                    "Gagal upload ke Cloudinary"
            );
        } else if (error.request) {
            console.error("No response from Cloudinary:", error.request);
            throw new Error("Masalah koneksi internet atau Network Error");
        } else {
            console.error("Error setup:", error.message);
            throw error;
        }
    }
};

export const deleteImageFromCloudinary = async (
    publicId: string
): Promise<void> => {
    try {
        // Note: Delete requires authentication,
        // better to do this from backend for security
        // For now, we skip deletion (images stay in Cloudinary)
        console.log("Delete not implemented (requires backend):", publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
};

export const getOptimizedImageUrl = (
    url: string,
    width: number = 800,
    quality: number = 80
): string => {
    if (!url || !url.includes("cloudinary")) return url;
    const parts = url.split("/upload/");
    if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
    }

    return url;
};
