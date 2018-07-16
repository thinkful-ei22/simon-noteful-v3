'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query;
  let filter = {};
  if (searchTerm) {
    filter.title = { $regex: searchTerm };
  }
  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tagId = tagId;
  }
  return Note.find(filter).populate('tags').sort({ updatedAt: 'desc' })
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
  return Note.findById(id).populate('tags')
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
  const {title, content, folderId, tags} = req.body;
  const newItem = {
    title,
    content,
    folderId,
    tags
  };
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (!(mongoose.Types.ObjectId.isValid(folderId))) {
    const err = new Error('`folderId` not valid');
    err.status = 400;
    return next(err);
  }
  if (newItem.tags) {
    newItem.tags.forEach(item => {
      if(!mongoose.Types.ObjectId.isValid(item)) {
        const err = new Error('Tag not valid');
        err.status = 400;
        return next(err);
      }
    });
  }
  return Note.create(newItem)
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

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content, folderId, tags} = req.body;
  const updateObj = {
    title,
    content,
    folderId,
    tags
  };
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (!(mongoose.Types.ObjectId.isValid(folderId))) {
    const err = new Error('`folderId` not valid');
    err.status = 400;
    return next(err);
  }
  if (updateObj.tags) {
    updateObj.tags.forEach(item => {
      if(!mongoose.Types.ObjectId.isValid(item)) {
        const err = new Error('Tag not valid');
        err.status = 400;
        return next(err);
      }
    });
  }
  return Note.findByIdAndUpdate(id, updateObj, {new: true})
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
  return Note.findByIdAndRemove(id)
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