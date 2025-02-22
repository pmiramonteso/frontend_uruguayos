import { User } from "./user";

export interface Access {
    code: number;
    message: string;
    data: {
        accessToken?: string;
        user: User;
    }
}