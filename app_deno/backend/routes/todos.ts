import { ObjectId } from "https://deno.land/x/mongo/mod.ts";
import { Router } from "https://deno.land/x/oak/mod.ts";
import { getDb } from "../helpers/db_client.ts";

const router = new Router();

interface Todo {
  id?: string;
  text: string;
}

router.get("/todos", async (ctx) => {
  const todos = await getDb().collection("todos").find();
  const transformedTodos = todos.map((todo: any) => ({
    id: todo._id.$oid,
    text: todo.text,
  }));
  ctx.response.body = { todos: transformedTodos };
});

router.post("/todos", async (ctx) => {
  const data = await ctx.request.body().value;
  const newTodo: Todo = {
    text: data.text,
  };

  const id = await getDb().collection("todos").insertOne(newTodo);

  newTodo.id = id.$oid;

  ctx.response.body = { message: "Todo created", todo: newTodo };
});

router.put("/todos/:todoId", async (ctx) => {
  const data = await ctx.request.body().value;
  const tid = ctx.params.todoId!;

  await getDb().collection("todos").updateOne(
    { _id: ObjectId(tid) },
    { $set: { text: data.text } },
  );

  ctx.response.body = { message: "Updated todo" };
});

router.delete("/todos/:todoId", async (ctx) => {
  const tid = ctx.params.todoId!;

  await getDb().collection("todos").deleteOne({ _id: ObjectId(tid) });

  ctx.response.body = { message: "Deleted todo" };
});

export default router;
