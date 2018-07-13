'use strict';

const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: {type: String, require: true, unique: true},
});

tagsSchema.set('timestamops', true);

tagsSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Tag', tagsSchema);

