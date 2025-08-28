import { Request, Response } from "express";
import UserService from "../services/UserService";
import { successResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

export default class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public getUsers = asyncHandler(async (req: Request, res: Response) => {
        const users = await this.userService.getUsers();
        res.json(successResponse(users));
    });

    public createUser = asyncHandler(async (req: Request, res: Response) => {
        const { email, first_name, last_name } = req.body;
        const user = await this.userService.createUser(email, first_name, last_name);
        res.json(successResponse(user, "User berhasil didaftarkan"));
    })

    public updateProfilePicture = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "File gagal upload"});
        }

        const user = await this.userService.updateProfilePicture(Number(id), req.file.buffer);
        res.json(successResponse(user, "Profile picture berhasil diupddate"));
    })
}