import { auth } from "../../lib/auth.js";
import { UserRepository } from "./user.repository.js";
import type { RegisterDTO, LoginDTO } from "./user.schema.js";

export const UserService = {
  register: async (data: RegisterDTO) => {
    const user = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/chat",
      },
      returnHeaders: true,
    });
    return user;
  },

  login: async (data: LoginDTO) => {
    const user = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        callbackURL: "/chat",
      },
      returnHeaders: true
    });
    return user;
  },

  search: async (email: string) => {
    return await UserRepository.search(email)
  },
};
