const cors = require("cors");
const express = require("express");
const { testDatabaseConnection } = require("./db/dbconnect.js");
const { createTables } = require("./db/tables.js");
const { runMigrations } = require("./db/migrations/run.js");
const achievmentRoute = require("./routes/achievement.js");
const authRoute = require("./routes/auth.js");
const blogRoute = require("./routes/blogs.js");
const electionRoute = require("./routes/elections.js");
const eventRoute = require("./routes/events.js");
const eventUpdateRoute = require("./routes/eventUpdate.js");
const noticeRoute = require("./routes/generalNotice.js");
const roleRoute = require("./routes/role.js");
const skillsRoute = require("./routes/skill.js");
const userRoute = require("./routes/users.js");
const candidateRoute = require("./routes/candidate.js");
const voteRoute = require("./routes/votes.js");
const paymentRoute = require("./routes/payment.js");
const societyFeeRoute = require("./routes/societyFee.js");
const testing = require("./routes/testing.js")

const PORT = 5050

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
)

app.get("/", (req, res) => {
  res.send("Swe society starting")
})
app.use("/auth", authRoute)
app.use("/notice", noticeRoute)
app.use("/users", userRoute)
app.use("/event", eventRoute)
app.use("/eventupdate", eventUpdateRoute)
app.use("/skills", skillsRoute)
app.use("/achievement", achievmentRoute)
app.use("/blog", blogRoute)
app.use("/election", electionRoute)
app.use("/role", roleRoute)
app.use("/candidate", candidateRoute)
app.use("/vote", voteRoute)
app.use("/payment", paymentRoute)
app.use("/society-fee", societyFeeRoute)
app.use("/testing",testing)


app.listen(PORT, async () => {
  // await connectToDB();
  await testDatabaseConnection()
  await createTables()
  await runMigrations()
  console.log(`Server is running in ${PORT}`)
})

