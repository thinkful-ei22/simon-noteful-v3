'use strict';

const express = require('express');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  let filter = {};
  if (searchTerm) {
    filter.title = { $regex: searchTerm };
  }
  return Note.find(filter).sort({ updatedAt: 'desc' })
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
  return Note.findById(id)
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
  const {title, content} = req.body;
  const newItem = {
    title,
    content
  };
  return Note.create(newItem)
    .then((results) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateObj = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  return Note.findByIdAndUpdate(id, updateObj, {new: true})
    .then((results) => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  return Note.findByIdAndRemove(id)
    .then((results) => {
      if (results) {
        res.json(1);
      } else {
        next();
      }
    })
    .catch((err) => next(err)); 
});

module.exports = router;