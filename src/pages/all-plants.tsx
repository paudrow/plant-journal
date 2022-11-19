import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import * as z from "zod";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.plants.getAll.useQuery();
  const deletePlant = trpc.plants.delete.useMutation();

  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Add plant</title>
        <meta name="description" content="Add a plant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-5xl">Your plants</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {data?.map((plant) => (
              <li key={plant.id}>
                {plant.name}
                <button className="mx-4" onClick={ () => {
                  deletePlant.mutate({id: plant.id})
                  // router.reload()
                }}>x</button>
                </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
};

export default Home;
