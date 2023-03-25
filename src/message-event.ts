import {Contact} from "wechaty";

export interface MessageEvent {
    id: string;
    message: string;
    userId: string;
    userName: string;
    timestamp: number;
}