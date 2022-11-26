import { type NextPage } from "next";
import Link from "next/link";
import AppLayout from "../../components/AppLayout";

import { trpc } from "../../utils/trpc";

const Home: NextPage = () => {
  const utils = trpc.useContext();

  const plants = trpc.plants.getAll.useQuery();
  const deletePlant = trpc.plants.delete.useMutation({
    onSuccess() {
      utils.plants.invalidate()
    }
  });

  return (
    <AppLayout title="Plant Journal Dashboard">
        <h1 className="text-5xl">Your plants</h1>
        {plants.isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {plants.data?.map((plant) => (
              <li key={plant.id}>
                <Link href={`/app/plant/${plant.id}`}>{plant.name}</Link>
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
    </AppLayout>
  );
};

export default Home;
