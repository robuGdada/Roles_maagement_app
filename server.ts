const app = require("./app");
const Port = process.env.PORT;
app.listen(Port, () => {
  // seeding();
  console.log(`Server running at ${Port}`);
});
