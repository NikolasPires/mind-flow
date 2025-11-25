// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!login|cadastro|_next|favicon.ico).*)", // Protege tudo, exceto /login
  ],
};
