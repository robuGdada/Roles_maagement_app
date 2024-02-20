import { app } from "./app";
import { seeding } from "./seeding/seed";
const Port = process.env.PORT;
app.listen(Port, () => {
  // seeding();

  console.log(`Server running at ${Port}`);
});
