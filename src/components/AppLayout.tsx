import Head from "next/head";
import { type FC } from "react";
import Link from "next/link";
import { signOut} from "next-auth/react";
import useRouter from "next/router";

const AppLayout: FC<{title: string, children: JSX.Element | JSX.Element[]}> = ({
  title,
  children,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="flex flex-row justify-between">
        <div className="flex flex-row gap-5">
          <Link href="/app">Home</Link>
          <Link href="/app/add-plant">Add plant</Link>
        </div>
        <Link href="/">Account</Link>
      </nav>
      <main>{children}</main>
    </>
  );
};

export default AppLayout;
