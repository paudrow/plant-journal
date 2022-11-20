import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import type { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "../server/trpc/router/_app";

type CreateProps = inferProcedureInput<AppRouter["plants"]["create"]>;

const Home: NextPage = () => {
  const createPlant = trpc.plants.create.useMutation();

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
        <h1 className="text-5xl">Add plant</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const $form = e.currentTarget;
            const values = Object.fromEntries(new FormData($form));
            const createProps: CreateProps = {
              name: values.name as string,
            };
            try {
              await createPlant.mutateAsync(createProps);
              $form.reset();
            } catch (cause) {
              console.error({ cause }, "Failed to add post");
            }
          }}
        >
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
