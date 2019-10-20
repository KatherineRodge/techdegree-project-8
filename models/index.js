"use strict"

const fs = require ('fs');
const path = require('path');
const Sequelize = require('sequelize');
const db = {};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db',
  logging: false // disable logging
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//const model = sequelize['import']("library.db");
//  db[model.name] = model;

db.sequelize = sequelize; //Add any new model to the `db` object
db.Sequelize = Sequelize; //Assign the Sequelize module to a `Sequelize` property in the `db` object


module.exports = db; //export `db` object
