import express from "express";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

const startServer = (port: number) => {
    app.listen(port, () => {
        console.log(`[EXPRESS] Listening on Port: ${port}`);
    });
};

export { startServer };
