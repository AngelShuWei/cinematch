const express = require('express');
const db = require('../db/models');
const { csrfProtection, asyncHandler } = require('./utils');
const { check, validationResult } = require('express-validator');


const router = express.Router();
const { loginUser, logoutUser, restoreUser } = require('../auth');
const { string } = require('yargs');

const notLoggedInError = (req, res, next) => {
  const error = Error("Not Logged In");
  error.status = 404;
  const message = "Please log in or register to view and create collections :)";
  res.render('error', { error, message });
};

router.get('/', asyncHandler(async (req, res, next) => {
  if (req.session.auth) {
    const userId = req.session.auth.userId;
    console.log("req.session.auth---------------------", req.session.auth);
    console.log("userId---------------------", userId);
    const collections = await db.Collection.findAll({ where: { userId } });
    console.log(collections);
    res.render('collection-list', { title: "My Collections", collections });
  } else {
    next(notLoggedInError(req, res, next));
  };

}));

const collectionValidators = [
  check('name')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for your Collection')
    .isLength({ max: 50 })
    .withMessage('The Collection name must not be more than 50 characters long')
  // .custom((value) => { //value is whatever the user passed in. It gets fed into the chain
  //   return db.Collection.findOne({ where: {
  //     name: value,
  //     userId: req.session.auth.userId //means that for EACH user, needs to have unique collection name
  //    }})
  //     .then((collection) => { //if true, then will reject that request
  //       if (collection) {
  //         return Promise.reject('The Collection name already exists');
  //       }
  //     });
  // }),
];


router.get('/add', csrfProtection, asyncHandler(async (req, res, next) => {
  if (req.session.auth) {
    const userId = req.session.auth.userId;
    console.log("userId--------------------", userId);
    const collection = db.Collection.build();
    res.render('add-collection', {
      title: 'Create New Collection',
      collection,
      userId,
      csrfToken: req.csrfToken(),
    });
  } else {
    next(notLoggedInError(req, res, next));
  };
}));

router.post('/add', csrfProtection, collectionValidators, asyncHandler(async (req, res) => {
  // const id = req.session.auth.userId;
  // console.log(id);

  const { name, userId } = req.body;

  const collection = db.Collection.build({ name, userId });

  const validatorErrors = validationResult(req);

  const errors = validatorErrors.array().map(error => error.msg); //map through the validation results. Are there errors?
  const collectionExists = await db.Collection.findOne({
    where: {
      name, //coming into the body as name
      userId: parseInt(userId, 10) //means that for EACH user, needs to have unique collection name. If invalid integer type, and references dialect/postgres/queryy means the query is incorrect
    }
  })

  if (collectionExists) {
    errors.push('The Collection name already exists')
  }

  if (!errors.length) { //there is NO length in the errors arary meaning it's GOOOOOOD SHIT
    await collection.save(); //dont want to save until know that there isn't an error
    res.redirect('/collections');
  } else {
    // const errors = validatorErrors.array().map((error) => error.msg);
    // const collectionExists = await db.Collection.findOne({ where: {
    //   name, //coming into the body as name
    //   userId //means that for EACH user, needs to have unique collection name
    // }})
    // if (collectionExists) {
    //   errors.push('The Collection name already exists')
    // }
    res.render('add-collection', {
      title: 'Create New Collection',
      collection,
      errors,
      csrfToken: req.csrfToken(),
    });
  }
})
);

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  // const movies = await db.Collection.findByPk(id);
  const userId = req.session.auth.userId;
  const collections = await db.Collection.findAll({ where: { userId } });
  const collection = await db.Collection.findByPk(id);
  const collectionId = id

  const collectionMovies = await db.CollectionMovie.findAll({ where: { collectionId } })

  let movieIds = [];
  collectionMovies.forEach(movie => {
    movieIds.push(movie.movieId)
  })

  let movieObjects = [];

  for (let i = 0; i < movieIds.length; i++) {
    let movie = movieIds[i]
    let movieDetails = await db.Movie.findByPk(movie);
    movieObjects.push(movieDetails)
  }

  res.render('collection', { movieObjects })

}));

router.get('/test', csrfProtection, (req, res) => {
  const collectionMovie = db.CollectionMovie.build();
  res.render('add-movie-to-collection', {
    title: 'Collection Movie',
    collectionMovie,
    csrfToken: req.csrfToken(),
  });
});


router.post('/add-movie', csrfProtection, asyncHandler(async (req, res) => {
  const userId = req.session.auth.userId;

  const {
    addToCollections
  } = req.body;

  const body = addToCollections.split('#');
  const collectionIdStr = body[0];
  const movieIdStr = body[1];
  const collectionId = parseInt(collectionIdStr, 10);
  const movieId = parseInt(movieIdStr, 10);

  const tableExists = await db.CollectionMovie.findOne({
    where: {
      movieId,
      collectionId
    }
  })

  if (!tableExists) {
    const collectionMovie = db.CollectionMovie.build({
      movieId,
      collectionId
    });

    await collectionMovie.save();
    res.redirect(`/collections/${collectionId}`)
    // res.redirect('/movies/1')
  } else {
    //TO DO
    //RE RENDER PAGE WITH ERROR BECAUSE JOIN TABLE EXISTS ALREADY
    res.send('Cannot add same movie into this collection');
  }

})
);


module.exports = router;
