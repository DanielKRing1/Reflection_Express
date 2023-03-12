import express from "express";

export default (req: express.Request, res: express.Response) => {
  console.log("hi");
  res.send("hi");
};
