//below contains the set up to mongodb and other libraries
//I used what I had in project 5, however besides set up this project is not an extension

const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });
const uri = "mongodb+srv://adriangalsim22:AX30dhdJ8QmHqLID@cluster0.ooybd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const MONGO_COLLECTION = process.env.MONGO_COLLECTION;
const databaseCollection = {db: MONGO_DB_NAME, collection: MONGO_COLLECTION};
const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
const fs = require("fs");
process.stdin.setEncoding("utf8");
const port = process.argv[2];
let count = 0;
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

let curuser = "N/A";

app.get("/", (request, response) => {
    response.render("login");
  });

app.get("/signUp", (request, response) => {
      response.render("signUp");
});

app.post("/welcome", async (request, response) => {
    const {user, email, password, password2} = request.body;
    await addAccount(user, email, password);
    response.render("welcome", {user, email, password, password2});
});

app.get("/account", async (request, response) => {
  let name, email, gender, age, preference, language, university, description = curuser, curemail, curgender, curage, curpreference, curlanguage, curuniversity, curdescription;
  response.render("account", {name, email, gender, age, preference, language, university, description});
});

app.post("/account", async (request, response) => {
  let {gender, age, preference, language, university, description} = request.body;
  const answer = await editAccount(curUser, gender, age, preference, language, university, description);
  const name = curUser;
  const email = answer.email;
  response.render("account", {name, email, gender, age, preference, language, university, description});
});

app.get("/edit", (request, response) => {
  response.render("edit");
});

  //functions for mongodb
  async function addAccount(user, email, password){
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
      await client.connect();
      let app = {user: user, email: email, password: password, gender: "N/A", age: 18, gender: "N/A", preference: "N/A", language: "N/A", university: "N/A", description: "N/A"};
      curuser = user;
      const result = await client.db(databaseCollection.db).collection(databaseCollection.collection).insertOne(app);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  }
async function editAccount(user, gender, age, preference, language, university, description){
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    let filter = {user: user};
    const toUpdate = {$set: {gender: gender, age: age, preference: preference, language: language, university: university, description: description}};
    const updating = await client.db(databaseCollection.db).collection(databaseCollection.collection).updateOne(filter, toUpdate);
    const result = await client.db(databaseCollection.db).collection(databaseCollection.collection).findOne(filter);
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

  //use node finalProjServer.js (any number) to access

  app.listen(port);