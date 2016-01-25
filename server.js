var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos?completed=true
app.get('/todos', function(req, res) {
  var queryParams = req.query;
  var filterdTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filterdTodos = _.where(filterdTodos, { completed: true });
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filterdTodos = _.where(filterdTodos, { completed: false });
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    filterdTodos = _.filter(filterdTodos, function (todo) {
      return todo.description.toLowerCase().indexOf(queryParams.q) > -1;
    });
  }

  res.json(filterdTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

// POST /todos
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  // check if todo is not already completed or has empty description
  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }
  body.description = body.description.trim();
  body.id = todoNextId++;
  // push data onto todos array
  todos.push(body);
  res.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (!matchedTodo) {
    res.status(404).json({"error": "no todo item with given id"});
  } else {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  }
});

// PUT /todos/:id

app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    res.status(404).json({"error": "no todo item with given id"});
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).json({"error": "invalid completed field"});
  }

  if (body.hasOwnProperty('description') && _isString(body.description) && body.description.trim() > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).json({"error": "invalid description field"});
  }

   matchedTodo = _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT + '!');
});
