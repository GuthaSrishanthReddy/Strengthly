import { api } from "./api";
import type { UserProfile } from "../types/user.types";

export const fetchUserProfile = () =>
  api<UserProfile>("/users/me");
