import express from "express"
import authRouter from "./Router/auth"
import profileRouter from "./Router/profile"
import salesRouter from "./Router/sales"
const app = express()
app.use(express.json())


app.use("/api/auth",authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/sale", salesRouter)

app.listen(8080, () => {
    console.log("The server is running of PORT 8080")
})