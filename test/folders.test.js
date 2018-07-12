'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose =  require('mongoose');

const app = require('../server');

const {TEST_MONGODB_URI} = require('../config');

const Folder = require('../models/folder');

const seedFolders = require('../db/seed/folders');

const expect = chai.expect; 
chai.use(chaiHttp);

describe('Folders API resource', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  // TEST FOR GET;

  describe('GET /api/folders', function() {
    it('should return correct number of folders', function() {
      return chai.request(app).get('/api/folders')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Folder.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
  });

  // TEST FOR GET WITH ID;

  describe('GET /api/folders/:id', function() {
    it('it should return correct folder', function() {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
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

  describe('POST /api/folders', function() {
    it('should insert new folder', function() {
      const newItem = {
        'name': 'FOLDER THANG'
      };
      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
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
      .post('/api/folders')
      .send(newItem)
      .then(res => {
        expect(res).to.have.status(400);
      });
  });

  // TEST FOR PUT;

  describe('PUT /api/folders/:id', function () {
    it('should update the folder when provided valid data', function () {
      const updateItem = {
        'name': 'dis be a name'
      };
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
        });
    });
    it('should return an error when missing title', function () {
      const updateItem = {
        'content': 'woof woof'
      };
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  // TEST FOR DeLETE;

  describe('DELETE /api/folders/:id', function () {
    it('should delete an existing folder', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          return Folder.count({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });
});