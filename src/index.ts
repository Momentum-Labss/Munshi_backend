import express from "express"
import authRouter from "./Router/auth"
import profileRouter from "./Router/profile"
import salesRouter from "./Router/sales"
import inventoryRouter from "./Router/inventory"
import uddharRouter from "./Router/uddhar"
import agentRouter from "./Router/agent"
const app = express()
app.use(express.json())


app.use("/api/auth",authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/sale", salesRouter)
app.use("/api/uddhar", uddharRouter)
app.use("/api/inventory", inventoryRouter)
app.use("/api/agent", agentRouter)

app.listen(8080, () => {
    console.log("The server is running of PORT 8080")
})