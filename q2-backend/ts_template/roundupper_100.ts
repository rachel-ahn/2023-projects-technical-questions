import express from "express";
import { nextTick } from "process";

// location is the simple (x, y) coordinates of an entity within the system
// spaceCowboy models a cowboy in our super amazing system
// spaceAnimal models a single animal in our amazing system
type location = { x: number; y: number };
type spaceCowboy = { name: string; lassoLength: number };
type spaceAnimal = { type: "pig" | "cow" | "flying_burger" };

// spaceEntity models an entity in the super amazing (ROUND UPPER 100) system
type spaceEntity =
  | { type: "space_cowboy"; metadata: spaceCowboy; location: location }
  | { type: "space_animal"; metadata: spaceAnimal; location: location };

// === ADD YOUR CODE BELOW :D ===

function entityFunction(entities: spaceEntity[]) {
  // for each object in the array of entities
  entities.forEach(entity => 
    {
      if (entity.type === "space_cowboy") {
        const { name, lassoLength} = entity.metadata; 
        const { location } = entity;
        // check if space_cowboy name exists in the database
        if (spaceDatabase.some(entity => entity.type === "space_cowboy" && entity.metadata.name === name)) {
          const updateMetadata = {"name": name, "lassoLength": lassoLength};
          const index = spaceDatabase.findIndex(entity => entity.type == "space_cowboy" && entity.metadata.name == name);
          spaceDatabase[index].metadata = updateMetadata;
          spaceDatabase[index].location = location;
        // if space_cowboy name doesn't exist in the database
        } else {
          spaceDatabase.push(entity);
        }
      } else if (entity.type === "space_animal") {
        spaceDatabase.push(entity);
      } 
    }
  );
  
  return {message: "Entities created"}
}

// ==============================

type lassoableAnimal = {
  type: "pig" | "cow" | "flying_burger",
  location: location
}

function getLasso(entity: spaceEntity) {
  if ('type' in entity && entity.type === 'space_cowboy') {
    return entity.metadata.lassoLength;
  } 
}

function lassoableFunction(cowboy_name: string, database: spaceEntity[]) {
  let space_animals = [] as spaceAnimal[];

  const index = spaceDatabase.findIndex(entity => entity.type === "space_cowboy" && entity.metadata.name === cowboy_name);
  if (index === -1) throw new Error;

  const cowboyLocation = spaceDatabase[index].location;
  let cowboyLasso: number = getLasso(spaceDatabase[index]) as number;

  database.forEach(entity => {
    if (entity.type === "space_animal") {
      const distX = (entity.location.x - cowboyLocation.x) ** 2;
      const distY = (entity.location.y - cowboyLocation.y) ** 2;
      const distance = Math.sqrt(distX + distY);
      const lassoable: lassoableAnimal = {type: entity.metadata.type, location: { x: entity.location.x, y: entity.location.y }}
      if (distance <= cowboyLasso) {
        space_animals.push(lassoable);
      }
    }
  })
  return space_animals;
}

// === ExpressJS setup + Server setup ===
const spaceDatabase = [] as spaceEntity[];
const app = express();

app.use(express.json())
// the POST /entity endpoint adds an entity to your global space database
app.post("/entity", (req, res) => {
  const { entities } = req.body;
  return res.send(entityFunction(entities));
});

app.get("/lassoable", (req, res, next) => {
  setTimeout(() => {
    try {
      const { cowboy_name } = req.body;
      return res.send(lassoableFunction(cowboy_name, spaceDatabase));
    } catch (error) {
      next(error)
      return res.sendStatus(400)
    }
  }, 1000)

});

app.listen(8080);