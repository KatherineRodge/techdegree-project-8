const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Book = require('../models').Book;
let page = 0;
let pageSize = 10;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

//https://www.mcieslar.com/pagination-with-sequelize-explained
const paginate = function( page, pageSize ) {
  const offset = page * pageSize;
  const limit = offset + pageSize;

  return {
    offset,
    limit,
  };
};



/* GET books listing into index table */
router.get('/', asyncHandler(async (req, res) => {
  let books = await Book.findAll({
      order: [['id', 'ASC']],
      ...paginate(page, pageSize)
   })
   res.render('index', {books});
}));

router.get("/forward", asyncHandler(async (req, res) => {
    page = page + 1;
    let books = await Book.findAll({
        order: [['id', 'ASC']],
        ...paginate(page, pageSize)
     })
     res.redirect("/");
}));

router.get("/back", asyncHandler(async (req, res) => {
    if (page === 0) {
      page === 0;
    } else {
      page = page - 1;
    }
    let books = await Book.findAll({
        order: [['id', 'ASC']],
        ...paginate(page, pageSize)
     })
     res.redirect("/");
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("new-book", { book: {} } );
});

/*Create new book*/
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors})
    } else {
      throw error;
    }
  }
}));

//GET search results
//Help via https://www.youtube.com/watch?v=6jbrWF3BWM0&t=1142s
router.get('/search', asyncHandler(async (req, res) => {
  page = 0;
  let search = req.query.search
  let books = await Book.findAll({
    where: {[Op.or]:[
        { genre: {[Op.like]: '%' + search + '%'}},
        { author: {[Op.like]: '%' + search + '%'}},
        { title: {[Op.like]: '%' + search + '%'}},
        { year: {[Op.like]: '%' + search + '%'}}
      ]
    }
   })
  .then(books => res.render('search', {books}))
  .catch(err => console.log(err));
}))


/* GET individual book details */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", {book});
  } else {
    res.render('page-not-found');
  }
}));

/* Update a book's information */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    book = await book.update(req.body);
    res.redirect("/books");
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", { book, errors: error.errors})
    } else {
      res.render('page-not-found');
    }
  }
}));


/* GET delete book */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.redirect("/", {book});
  } else {
    res.sendStatus(404);
  }
}));

/*Delete Book from Database*/
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));


module.exports = router;
