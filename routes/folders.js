'use strict';

const express = require('express');
const Folder = require('../models/folder');
const mongoose = require('mongoose');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  let filter = {};
  if (searchTerm) {
    filter.name = { $regex: searchTerm };
  }
  return Folder.find(filter).sort({ updatedAt: 'asc' })
    .then((results) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Id not valid');
    err.status = 404;
    return next(err);
  }
  return Folder.findById(id)
    .then((results) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const {name} = req.body;
  const newItem = {
    name
  };
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Folder.create(newItem)
    .then((results) => {
      if (results) {
        res.location(`${req.originalUrl}/${res.id}`).status(201).json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {name} = req.body;
  const updateObj = {
    name
  };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Id not valid');
    err.status = 404;
    return next(err);
  }
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  return Folder.findByIdAndUpdate(id, updateObj, {new: true})
    .then((results) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  return Folder.findByIdAndRemove(id)
    .then((results) => {
      if (results) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

module.exports = router;