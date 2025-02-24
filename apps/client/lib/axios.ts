import axios from "axios";
import { HTTP_URL } from "./config";

export const AxiosInstance = axios.create({
    baseURL: HTTP_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})