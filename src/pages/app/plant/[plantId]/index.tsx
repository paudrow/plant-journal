import NextError from "next/error";
import { useRouter } from "next/router";
import { useS3Upload } from 'next-s3-upload';
import type { RouterInputs, RouterOutputs } from "../../../../utils/trpc";
import { trpc } from "../../../../utils/trpc";
import type { TaskType } from "../../../../types/TaskType";
import { TASK_TYPES } from "../../../../types/TaskType";
import dayjs from "dayjs";

type Plant = RouterOutputs["plants"]["byId"];
type UpdatePlant = RouterInputs["plants"]["update"];
type CreateTask = RouterInputs["taskRecord"]["create"];

function PlantItem(props: { plant: Plant }) {

  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const { plant } = props;
  if (!plant) {
    return <NextError statusCode={404} />;
  }

  const utils = trpc.useContext();
  const mutatePlant = trpc.plants.update.useMutation();
  const removePlantImage = trpc.plants.removeImage.useMutation({
    onSuccess() {
      utils.plants.invalidate();
    },
  });
  const queryNextTask = trpc.plants.getNextTask.useQuery({ plantId: plant.id });
  const createTasks = trpc.taskRecord.create.useMutation({
    onSuccess: () => {
      utils.taskRecord.invalidate();
      utils.plants.getNextTask.invalidate();
    },
  });
  const queryTasks = trpc.taskRecord.getForPlant.useQuery({
    plantId: plant.id,
  });
  const s3DeleteFile = trpc.s3.deleteFile.useMutation();

  const handleFileChange = async (file: File) => {
    const oldUrl = plant.imageUrl;

    const { url: imageUrl } = await uploadToS3(file);
    const updateProps: UpdatePlant = {
      id: plant.id,
      imageUrl,
    };
    await mutatePlant.mutateAsync(updateProps);
    utils.plants.invalidate();

    if (oldUrl) {
      await s3DeleteFile.mutateAsync({fileUrl: oldUrl});
    }
  };

  const deleteTask = trpc.taskRecord.delete.useMutation({
    onSuccess: () => {
      utils.taskRecord.invalidate();
      utils.plants.getNextTask.invalidate();
    },
  });

  return (
    <>
      <h1 className="text-5xl">{plant.name}</h1>
      <div>
        <FileInput onChange={handleFileChange} />
        {plant.imageUrl ? (
          <div>
            <img src={plant.imageUrl}/>
            <button onClick={openFileDialog}>Change image</button>
            <div />
            <button
              onClick={() => removePlantImage.mutateAsync({ id: plant.id })}
            >
              Remove photo
            </button>
          </div>
        ) : (
          <button onClick={openFileDialog}>Add photo</button>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const $form = e.currentTarget;
          const values = Object.fromEntries(new FormData($form));
          const updateProps: UpdatePlant = {
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

      <h2 className="text-4xl">Upcoming Tasks</h2>
      {queryNextTask.status === "success" && queryNextTask.data ? (
        <div>
          <em>
            Due {dayjs(queryNextTask.data.nextWaterDate).format("MMMM D, YYYY")}
          </em>
        </div>
      ) : (
        <div>No upcoming tasks</div>
      )}

      <h2 className="text-4xl">Record</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const $form = e.currentTarget;
          const values = Object.fromEntries(new FormData($form));
          const createProps: CreateTask = {
            status: "pending",
            doneDate: dayjs(values.dueDate as string).toDate(),
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
              <a href={`/plant/${plant.id}/task/${task.id}`}>
                {task.type} - Done: {task.doneDate.toDateString()}
              </a>
              {" - "}
              <button
                onClick={async () => {
                  try {
                    await deleteTask.mutateAsync({ id: task.id });
                    utils.taskRecord.invalidate();
                  } catch (cause) {
                    console.error({ cause }, "Failed to delete task");
                  }
                }}
              >
                x
              </button>
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
