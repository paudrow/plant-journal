import NextError from "next/error";
import { useRouter } from "next/router";
import type { RouterOutputs } from "../../../../../utils/trpc";
import { trpc } from "../../../../../utils/trpc";

type Task = RouterOutputs["taskRecord"]["byId"];

function TaskItem(props: { task: Task }) {
  const { task } = props;
  if (!task) {
    return <NextError statusCode={404} />;
  }
  return (
    <>
      <h1>{task.type}</h1>
      <em>Created {task.createdAt.toLocaleDateString("en-us")}</em>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(task, null, 4)}</pre>
    </>
  );
}

const TasksViewPage = () => {
  const id = useRouter().query.taskId as string;
  const postQuery = trpc.taskRecord.byId.useQuery({ id });

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
  return <TaskItem task={data} />;
};

export default TasksViewPage;
