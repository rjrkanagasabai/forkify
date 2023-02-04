import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultView from './view/resultView.js';
import paginationView from './view/paginationView.js';
import bookmarskView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime'; //polyfiling async await
import recipeView from './view/recipeView.js';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);
    if (!id) return;
    //guard class when there is no id..
    //loading recipe
    recipeView.renderSpinner();

    //update result view to mark selected search results
    resultView.update(model.getSearchResultsPage());

    // updating bookmarkview

    bookmarskView.update(model.state.bookmarks);
    // const res = await fetch(
    //   // 'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604691c37cdc054bd0bc'
    //   `https://forkify-api.herokuapp.com/api/v2/recipes/${id}`
    // );
    // const data = await res.json();
    // if (!res.ok) throw new Error(`${data.message}(${res.status})`);
    // console.log(data);

    // let { recipe } = data.data;
    // recipe = {
    //   id: recipe.id,
    //   title: recipe.title,
    //   publisher: recipe.publisher,
    //   sourceUrl: recipe.source_url,
    //   image: recipe.image_url,
    //   servings: recipe.servings,
    //   cookingTime: recipe.cooking_time,
    //   ingredients: recipe.ingredients,
    // };
    // console.log(recipe);

    //Loading recipe

    await model.loadRecipe(id);
    // const { recipe } = model.state;
    //rendering receipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // console.log(err);
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    //get search query
    const query = searchView.getQuery();

    if (!query) return;

    //load search result
    await model.loadSearchResults(query);
    // console.log(model.state.search.results);
    // resultView.render(model.state.search.results);
    //render results
    resultView.render(model.getSearchResultsPage(1));

    //render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();
const controlPagination = function (goToPage) {
  //render new results
  resultView.render(model.getSearchResultsPage(goToPage));

  //render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);
  // console.log(model.state.recipe);
  //update recipe view
  recipeView.update(model.state.recipe);
  bookmarskView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarskView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //loading spinner
    addRecipeView.renderSpinner();
    //upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    //success message
    addRecipeView.renderMessage();
    //render bookmark view
    bookmarskView.render(model.state.bookmarks);

    //change Id in URl
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();
    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarskView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
