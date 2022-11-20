import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const utils = trpc.useContext();

  const plants = trpc.plants.getAll.useQuery();
  const deletePlant = trpc.plants.delete.useMutation({
    onSuccess() {
      utils.plants.invalidate()
    }
  });

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
        {plants.isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {plants.data?.map((plant) => (
              <li key={plant.id}>
                <Link href={`/plant/${plant.id}`}>{plant.name}</Link>
                <button
                  className="mx-4"
                  onClick={() => deletePlant.mutate({ id: plant.id })}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
};

export default Home;
