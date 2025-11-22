import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
  }
}