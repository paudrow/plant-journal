import NextError from 'next/error';
import { useRouter } from 'next/router';
import type { RouterOutputs } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";

type Plant = RouterOutputs['plants']['byId'];

function PlantItem(props: { plant: Plant }) {

  const utils = trpc.useContext();
  const mutate = trpc.plants.update.useMutation();
  const { plant } = props;
  if (!plant) {
    return <NextError statusCode={404} />;
  }
  return (
    <>
      <h1>{plant.name}</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const $form = e.currentTarget;
          const values = Object.fromEntries(new FormData($form));
          const updateProps = {
            id: plant.id,
            name: values.name as string,
          };
          try {
            await mutate.mutateAsync(updateProps);
            utils.plants.invalidate()
          } catch (cause) {
            console.error({ cause }, 'Failed to update plant');
          }
        }}>
        <label htmlFor="name">Plant Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={20}
          className="border-2 border-black"
          defaultValue={plant.name}
        />
        <button type="submit">Update</button>
      </form>
      <em>Created {plant.createdAt.toLocaleDateString('en-us')}</em>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(plant, null, 4)}</pre>
    </>
  );
}

const PlantViewPage = () => {
  const id = useRouter().query.id as string;
  const postQuery = trpc.plants.byId.useQuery({ id });

  if (postQuery.error) {
    return (
      <NextError
        title={postQuery.error.message}
        statusCode={postQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (postQuery.status !== 'success') {
    return <>Loading...</>;
  }
  const { data } = postQuery;
  return <PlantItem plant={data} />;
};

export default PlantViewPage;