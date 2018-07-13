'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose =  require('mongoose');

const app = require('../server');

const {TEST_MONGODB_URI} = require('../config');

const Tag = require('../models/tag');

const seedTags = require('../db/seed/tags');

const expect = chai.expect; 
chai.use(chaiHttp);

describe('Tags API resource', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Tag.insertMany(seedTags);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  // TEST FOR GET;

  describe('GET /api/tags', function() {
    it('should return correct number of tags', function() {
      return chai.request(app).get('/api/tags')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Tag.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
  });

  // TEST FOR GET WITH ID;

  describe('GET /api/tags/:id', function() {
    it('it should return correct tag', function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  });

  // TEST FOR POST;

  describe('POST /api/tags', function() {
    it('should insert new tag', function() {
      const newItem = {
        'name': 'TAG THANG'
      };
      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
  });
  it('should return an error when missing name', function () {
    const newItem = {
      'content': 'LAME CONTENT'
    };
    return chai.request(app)
      .post('/api/tags')
      .send(newItem)
      .then(res => {
        expect(res).to.have.status(400);
      });
  });

  // TEST FOR PUT;

  describe('PUT /api/tags/:id', function () {
    it('should update the tag when provided valid data', function () {
      const updateItem = {
        'name': 'DIS BE THE TAG NAME'
      };
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
        });
    });
    it('should return an error when missing name', function () {
      const updateItem = {
        'content': 'woof woof'
      };
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  // TEST FOR DeLETE;

  describe('DELETE /api/tag/:id', function () {
    it('should delete an existing tag', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          return Tag.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });
});