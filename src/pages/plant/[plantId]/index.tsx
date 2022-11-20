import NextError from "next/error";
import { useRouter } from "next/router";
import type { RouterInputs, RouterOutputs } from "../../../utils/trpc";
import { trpc } from "../../../utils/trpc";
import type { TaskType } from "../../../types/TaskType";
import { TASK_TYPES } from "../../../types/TaskType";
import dayjs from "dayjs";

type Plant = RouterOutputs["plants"]["byId"];
type CreateTask = RouterInputs["tasks"]["create"];

function PlantItem(props: { plant: Plant }) {
  const { plant } = props;
  if (!plant) {
    return <NextError statusCode={404} />;
  }

  const utils = trpc.useContext();
  const mutatePlant = trpc.plants.update.useMutation();
  const createTasks = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.invalidate();
    },
  });
  const queryTasks = trpc.tasks.getForPlant.useQuery({ plantId: plant.id });

  return (
    <>
      <h1 className="text-5xl">{plant.name}</h1>
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
            await mutatePlant.mutateAsync(updateProps);
            utils.plants.invalidate();
          } catch (cause) {
            console.error({ cause }, "Failed to update plant");
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
          defaultValue={plant.name}
        />
        <button type="submit">Update</button>
      </form>
      <em>Created {plant.createdAt.toLocaleDateString("en-us")}</em>
      <h2>Raw data:</h2>
      <pre>{JSON.stringify(plant, null, 4)}</pre>

      <h2 className="text-4xl">Tasks</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const $form = e.currentTarget;
          const values = Object.fromEntries(new FormData($form));
          const createProps: CreateTask = {
            status: "pending",
            dueDate: dayjs(values.dueDate as string).toDate(),
            plantId: plant.id,
            type: values.type as TaskType,
          };
          try {
            await createTasks.mutateAsync(createProps);
          } catch (cause) {
            console.error({ cause }, "Failed to create task");
          }
        }}
      >
        <label htmlFor="type">Task Type</label>
        <select
          id="type"
          name="type"
          required
          className="border-2 border-black"
          defaultValue={TASK_TYPES[0]}
        >
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          required
          className="border-2 border-black"
        />
        <button type="submit">Create</button>
      </form>
      {queryTasks.isLoading ? (
        <>Loading...</>
      ) : (
        <ul>
          {queryTasks.data?.map((task) => (
            <li key={task.id}>
              <a href={`/plant/${plant.id}/task/${task.id}`}>{task.type} - Due: {task.dueDate.toDateString()}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const PlantViewPage = () => {
  const id = useRouter().query.plantId as string;
  const postQuery = trpc.plants.byId.useQuery({ id });

  if (postQuery.error) {
    return (
      <NextError
        title={postQuery.error.message}
        statusCode={postQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (postQuery.status !== "success") {
    return <>Loading...</>;
  }
  const { data } = postQuery;
  return <PlantItem plant={data} />;
};

export default PlantViewPage;
