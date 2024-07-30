import axios from "axios";

const BUNNY_CDN_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL;
const BUNNY_STORAGE_REGION = process.env.NEXT_PUBLIC_BUNNY_STORAGE_REGION;
const BUNNY_STORAGE_ZONE_NAME = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE_NAME;
const BUNNY_API_ACCESS_KEY = process.env.NEXT_PUBLIC_BUNNY_API_ACCESS_KEY;

export const getFreebieZip = async (filePath: string) => {
  try {
    // define request params
    const endpoint = `https://${BUNNY_STORAGE_REGION}.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE_NAME}/zipfile/${filePath}`;
    const headers = {
      AccessKey: BUNNY_API_ACCESS_KEY,
    };
    // make request
    const response = await axios.get(endpoint, { headers });

    // check response status
    if (response.status !== 200) {
      throw new Error("Failed to fetch DB schemas");
    } else {
      console.error("Got the response object:", response);
    }
  } catch (error: any) {
    console.error("Error fetching Zipfile:", error);
  }
};
