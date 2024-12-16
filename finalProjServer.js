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
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/image', express.static(path.join(__dirname, 'image')));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

//API using fetch from rapidAPI
const url = 'https://nerdy-pickup-lines1.p.rapidapi.com/pickup_lines';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': 'a565de5e7bmsh79627f7261eadf1p15e847jsn522bed93c0f2',
		'x-rapidapi-host': 'nerdy-pickup-lines1.p.rapidapi.com'
	}
};

app.get("/", (request, response) => {
  const error = "";
    response.render("logIn", {error});
  });

  app.get("/logIn", (request, response) => {
    const error = "";
      response.render("logIn", {error});
    });

app.get("/signUp", (request, response) => {
      response.render("signUp");
});

app.post("/welcome", async (request, response) => {
    const {user, email, password, password2} = request.body;
    await addAccount(user, email, password);
    response.render("welcome", {user, email, password, password2});
});

app.post("/account", async (request, response) => {
  let {name, gender, age, preference, language, university, description} = request.body;
  const answer = await editAccount(name, gender, age, preference, language, university, description);
  if (!answer){
    response.render("edit");
  } else {
    const email = answer.email;
    response.render("account", {name, email, gender, age, preference, language, university, description});
  }

});

app.post("/accountLogIn", async (request, response) => {
  let {user, password} = request.body;
  const answer = await accessInfo(user);
  if (!answer || password != answer.password){
    const error = "Wrong Credentials";
    response.render("login", {error});
  } else {
    const name = user;
    const email = answer.email;
    const gender = answer.gender;
    const age = answer.age;
    const preference = answer.preference;
    const language = answer.language;
    const university = answer.university;
    const description = answer.description;
    response.render("account", {name, email, gender, age, preference, language, university, description});
  }

});



app.get("/edit", (request, response) => {
  response.render("edit");
});

app.get("/match", async (request, response) => {
  const answer = await randomUser();
  const name = answer.user;
  const email = answer.email;
  const gender = answer.gender;
  const age = answer.age;
  const preference = answer.preference;
  const language = answer.language;
  const university = answer.university;
  const description = answer.description;
  response.render("match", {name, gender, age, preference, language, university, description});
})

app.post("/matched", async (request, response) => {
  let {matched} = request.body;
  let access = await accessInfo(matched);
  if (!access){
    const answer = await randomUser();
    const name = answer.user;
    const gender = answer.gender;
    const age = answer.age;
    const preference = answer.preference;
    const language = answer.language;
    const university = answer.university;
    const description = answer.description;
    response.render("match", {name, gender, age, preference, language, university, description});
  } else {
    const name = access.user;
    const email = access.email;
    const pickup = await getJoke();
    response.render("matched", {name, email, pickup});
  }
})

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
async function accessInfo(user){
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    let filter = {user: user};
    const result = await client.db(databaseCollection.db).collection(databaseCollection.collection).findOne(filter);
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
async function randomUser(){
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const result = await client.db(databaseCollection.db).collection(databaseCollection.collection).aggregate([{$sample: {size: 1}}]).next();
    return result
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function getJoke(){
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    let linesList = result.nerdy_pickup_lines;
    const randomNum = Math.floor(Math.random()*linesList.length);
    let line = linesList[randomNum];
    return line;

  } catch (error) {
    console.error(error);
  }
}

  //use node finalProjServer.js (any number) to access

  app.listen(port);