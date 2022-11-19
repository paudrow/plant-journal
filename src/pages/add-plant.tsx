import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import * as z from "zod";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const createPlant = trpc.plants.create.useMutation();

  const router = useRouter();
  const { data: sessionData, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const {
      currentTarget: {
        name: { value: name },
      },
    } = z
      .object({
        currentTarget: z.object({
          name: z.object({
            value: z.string(),
          }),
        }),
      })
      .parse(e);
    console.log(name);
    if (!sessionData.user) {
      return;
    }
    createPlant.mutate({
      name,
    });
  };

  return (
    <>
      <Head>
        <title>Add plant</title>
        <meta name="description" content="Add a plant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-5xl">Add plant</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Plant Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={20}
            className="border-2 border-black"
          />
          <button type="submit">Submit</button>
        </form>
      </main>
    </>
  );
};

export default Home;
