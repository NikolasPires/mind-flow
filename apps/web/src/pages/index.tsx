import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";

export default function Home() {
  return null; // Não renderiza nada, apenas redireciona no server
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/dashboard",
      permanent: false,
    },
  };
};
