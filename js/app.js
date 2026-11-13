// listen for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", loadRecipes);

// get references to the recipe form and recipe list container
const recipeForm = document.getElementById("recipeForm");
const recipeList = document.getElementById("recipeList");

// listen for search event
document.getElementById("searchBar").addEventListener("input", function() {
    // apply to all recipes
    applyFilters(); 
    // apply to favorites
    applyFavoriteFilters(); 
});
// listen for filter event 
document.getElementById("categoryFilter").addEventListener("change", function() {
     // apply to all recipes
    applyFilters();
    // apply to favorites
    applyFavoriteFilters();  
});
// listen for sort event 
document.getElementById("sortCriteria").addEventListener("change", function() {
    // apply to all recipes
    applyFilters();
    // apply to favorites
    applyFavoriteFilters();  
});

// variable to store the full list of recipes
let allRecipes = [];

// function to load all recipes from local storage and display them
function loadRecipes() {
    // get the element where recipes will be displayed
    const recipeList = document.getElementById('recipeList');
    
    // clear the current content in the recipe list container
    recipeList.innerHTML = "";

    // retrieve the recipes from local storage
    // if no recipes are found, initialize an empty array
    allRecipes = JSON.parse(localStorage.getItem("recipes")) || [];

    // apply filters to the list of recipes to show relevant recipes
    applyFilters();  
    // update the recipe dashboard with stats and other relevant data
    updateDashboard(); 
}



// function to apply search, filter, and sort criteria for all recipes list
function applyFilters() {
    // get the user's search input
    // convert to lowercase for case-insensitive matching
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();

    // get the selected category from the category filter dropdown
    const selectedCategory = document.getElementById("categoryFilter").value;

    // get the selected sorting criteria from the sort options dropdown
    const sortCriteria = document.getElementById("sortCriteria").value;

    // Initialize filteredRecipes with all recipes to apply filters step by step
    let filteredRecipes = Array.from(allRecipes);

    // apply search filter
    if (searchQuery) {
        filteredRecipes = filteredRecipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchQuery)
        );
    }

    // apply category filter
    if (selectedCategory) {
        filteredRecipes = filteredRecipes.filter(recipe =>
            recipe.category === selectedCategory
        );
    }

    // apply sorting based on the selected criteria
    // if user chooses time
    if (sortCriteria === "time") {
        // sort recipes by cooking/preparation time (ascending)
        filteredRecipes.sort((a, b) => (a.time || 0) - (b.time || 0));
    // if user chooses alphabetical
    } else if (sortCriteria === "alphabetical") {
        // sort recipes alphabetically by name
        filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
    // if user chooses dateAdded
    } else if (sortCriteria === "dateAdded") {
        // sort recipes by the date they were added (most recent first)
        filteredRecipes.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }


    // get the recipe list container element 
    const recipeList = document.getElementById("recipeList");
    // clear its current contents
    recipeList.innerHTML = "";

    // populate the recipe list with the filtered and sorted recipes
    filteredRecipes.forEach(recipe => createRecipeCard(recipe, recipeList));
}

// function to create a recipe card to display the recipe in the UI
function createRecipeCard(recipe, targetContainer) {
    // create a div to hold the card
    const card = document.createElement("div");
    // add classes for styling
    card.classList.add("card", "mb-3", "recipe-card");

    // create an image element for the recipe's image
    const img = document.createElement("img");
    // add class for image styling
    img.classList.add("card-img-top");
    // set alt text for accessibility
    img.alt = "Recipe Image";
    // set image source to the recipe's image or "default.jpg" if none exists
    img.src = recipe.image || "default.jpg"; 

    // create the card body to hold recipe details 
    const cardBody = document.createElement("div");
    // add class for styling
    cardBody.classList.add("card-body");

    // create and set the recipe's title 
    const cardTitle = document.createElement("h5");
    // add class for styling
    cardTitle.classList.add("card-title");
    // set the recipe's name as the title
    cardTitle.textContent = recipe.name;

    // create a paragraph element for the category
    const cardText = document.createElement("p");
    // add class for styling
    cardText.classList.add("card-text");
    // set category text
    cardText.innerHTML = "<strong>Category:</strong> " + recipe.category;

    // create a paragraph element for the time 
    const timeText = document.createElement("p");
    // add class for styling
    timeText.classList.add("card-text"); 
    // check if time is available
    if (recipe.time) {
        // display time if available
        timeText.innerHTML = "<strong>Time:</strong> " + recipe.time + " minutes";
    } else {
        // display "N/A" if no time is available
        timeText.innerHTML = "<strong>Time:</strong> N/A";
    }

    // create the "View Details" button
    const viewButton = document.createElement("button");
    // add classes for styling
    viewButton.classList.add("btn", "btn-primary", "me-2");
    // set the button text
    viewButton.textContent = "View Details";
    // add event listener for the button
    viewButton.onclick = function() {
        // call the function to show recipe details in a modal
        showRecipeDetailsInModal(recipe);
    };

    // create the "Edit" button
    const editButton = document.createElement("button");
    // add classes for styling
    editButton.classList.add("btn", "btn-secondary", "me-2");
    // set the button text
    editButton.textContent = "Edit"; 
    // add event listener for the button
    editButton.onclick = function() { 
         // call the function to edit the recipe by its name
        editRecipe(recipe.name);
    };

    // create the "Delete" button
    const deleteButton = document.createElement("button");
    // add classes for styling
    deleteButton.classList.add("btn", "btn-danger");
    // set the button text
    deleteButton.textContent = "Delete";
    // add event listener for the button
    deleteButton.onclick = function() { 
        // call the function to delete the recipe by its name
        deleteRecipe(recipe.name);
    };

    // create the favorite/unfavorite button only for all recipes
    const favoriteButton = document.createElement("button");

    // add css classes for the button's base styling
    favoriteButton.classList.add("btn", "btn-outline-warning", "btn-favorite");

    // check if the recipe is marked as a favorite
    // if the recipe is already a favorite
    if (recipe.isFavorite) {
        // set the button text to "Unfavorite"
        favoriteButton.textContent = "Unfavorite";

        // update the button's styling to indicate the "Unfavorite" state
        favoriteButton.classList.remove("btn-outline-warning");
        favoriteButton.classList.add("btn-warning");
    
        // if the recipe is not a favorite
    } else {
        // set the button text to "Favorite"
        favoriteButton.textContent = "Favorite";

        // update the button's styling to indicate the "Favorite" state
        favoriteButton.classList.remove("btn-warning");
        favoriteButton.classList.add("btn-outline-warning");
    }

    // append all elements to the card body
        // add the title
    cardBody.appendChild(cardTitle);
        // add the category
    cardBody.appendChild(cardText);
        // add the time
    cardBody.appendChild(timeText);
        // add the "View Details" button
    cardBody.appendChild(viewButton);
        // add the "Edit" button
    cardBody.appendChild(editButton);
        // add the "Delete" button
    cardBody.appendChild(deleteButton);
    // Only add the favorite button in All Recipes (not in Favorites list)
    if (targetContainer === recipeList) {
        cardBody.appendChild(favoriteButton);
    }

    // add the image to the card
    card.appendChild(img); 
    // add the body to the card
    card.appendChild(cardBody);

    // append the card to the target container (favoritesList or recipeList)
    targetContainer.appendChild(card);
    
    // event listener for the favorite button to handle favorite/unfavorite action
    favoriteButton.addEventListener("click", function() {
        // when the button is clicked, toggle the favorite status for this recipe
        toggleFavoriteStatus(recipe.name, favoriteButton);
    });
}

// function to show the recipe details in a modal pop-up
function showRecipeDetailsInModal(recipe) {
    // create a new modal instance
    const modal = new bootstrap.Modal(document.getElementById("recipeModal"));
    // set recipe name in the modal
    document.getElementById("modalRecipeName").textContent = recipe.name;
    // set ingredients in the modal
    document.getElementById("modalRecipeIngredients").textContent = recipe.ingredients;
    // set steps in the modal
    document.getElementById("modalRecipeSteps").textContent = recipe.steps;
    // set category in the modal
    document.getElementById("modalRecipeCategory").textContent = recipe.category;
    // set time or "N/A" in the modal
    if (recipe.time) {
        document.getElementById("modalRecipeTime").textContent = recipe.time + " minutes";
    } else {
        document.getElementById("modalRecipeTime").textContent = "N/A";
    }
    // show the modal
    modal.show();
}

// function to allow editing of an existing recipe
function editRecipe(recipeName) {
    // retrieve the list of recipes from local storage
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

    // find the recipe that matches the provided recipe name
    const recipe = recipes.find(r => r.name === recipeName);

    // check if the recipe exists
    if (recipe) {
        // populate the form fields with the selected recipe's data
        document.getElementById("recipeName").value = recipe.name;
        document.getElementById("recipeIngredients").value = recipe.ingredients;
        document.getElementById("recipeSteps").value = recipe.steps;
        document.getElementById("recipeCategory").value = recipe.category;
        document.getElementById("recipeTime").value = recipe.time || ""; 

        // mark the form to indicate it's editing the current recipe
        document.getElementById("recipeForm").dataset.editing = recipe.name;
    }
}

// function to delete a recipe from the list (all recipes and favorites lists)
function deleteRecipe(recipeName) {
    // get recipes from local storage
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // filter out the recipe that matches the given name from both lists
    recipes = recipes.filter(recipe => recipe.name !== recipeName);
    favorites = favorites.filter(recipe => recipe.name !== recipeName);

    // save the updated lists to local storage
    localStorage.setItem("recipes", JSON.stringify(recipes));
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // reload the recipe lists
    loadRecipes();
    displayFavorites();

    // alert user that the recipe was deleted
    alert("Recipe deleted successfully!");
}

// function to validate the form before submitting
function validateForm() {
    // get the name input value
    const name = document.getElementById("recipeName").value;
    // get the ingredients input value
    const ingredients = document.getElementById("recipeIngredients").value;
    // get the steps input value
    const steps = document.getElementById("recipeSteps").value;
    // get the category input value
    const category = document.getElementById("recipeCategory").value;

    // check if any required field is empty 
    if (!name || !ingredients || !steps || !category) {
        // alert the user to fill out all fields
        alert("Please fill out all fields.");
        // prevent form submission if any field is empty
        return false; 
    }
    // allow form submission if all fields are filled
    return true;
}

// listen for form submission to save or update a recipe
recipeForm.addEventListener("submit", function(e) {
    // prevent the form from refreshing the page on submit
    e.preventDefault();
    // validate the form before proceeding
    if (!validateForm()) return;

    // get the form values
    const name = document.getElementById("recipeName").value;
    const ingredients = document.getElementById("recipeIngredients").value;
    const steps = document.getElementById("recipeSteps").value;
    const category = document.getElementById("recipeCategory").value;
    const time = document.getElementById("recipeTime").value;
    // get the uploaded image file
    const imageFile = document.getElementById("recipeImage").files[0];
    
    // use "default.jpg" if no image is uploaded
    let image = "default.jpg";
    if (imageFile) {
        // create a URL for the uploaded image
        image = URL.createObjectURL(imageFile);
    }
    // save the recipe
    saveRecipe({ name, ingredients, steps, category, time, image }); 
    recipeForm.reset();
});

// function to save or update a recipe in local storage
function saveRecipe(recipe) {
    // retrieve recipes and favorites from local storage
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // get the name of the recipe being edited
    const editingName = document.getElementById("recipeForm").dataset.editing;
    // if it's being edited
    if (editingName) {
        // update the recipe in the all recipes list
        recipes = recipes.map(r => {
            // check if the current recipe name matches the name of the recipe being edited
            if (r.name === editingName) {
                // replace the current recipe with the updated recipe
                return recipe;
            // if no match
            } else {
                // keep the current recipe unchanged
                return r;
            }
        });

        // update the recipe in the favorites list
        favorites = favorites.map(f => {
            // check if the current favorite recipe name matches the name of the recipe being edited
            if (f.name === editingName) {
                // replace the current favorite with the updated recipe
                return recipe;
            // if no match
            } else {
                // keep the current favorite recipe unchanged
                return f;
            }
        });

        // remove the editing marker
        delete document.getElementById("recipeForm").dataset.editing;
    } else {
        // add a dateAdded field to the new recipe
        const currentDate = new Date();
        const dateAdded = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate(); // Format as YYYY-MM-DD

        // add the formatted date to the recipe
        recipe.dateAdded = dateAdded;

        // push the new recipe to the recipes list
        recipes.push(recipe);
    }

    // save the updated recipes and favorites to local storage
    localStorage.setItem("recipes", JSON.stringify(recipes));
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // reload the recipes and favorites lists to reflect changes
    loadRecipes();
    displayFavorites();
    // update dashboard after saving
    updateDashboard(); 
    
    // hide the form after saving the recipe
    document.getElementById("recipeForm").style.display = "none";
    
    // reset the recipe form for the next input
    document.getElementById("recipeForm").reset();
    console.log("Recipe saved successfully!");
}

// function to toggle the favorite status of a recipe
function toggleFavoriteStatus(recipeName, button) {
    // get recipes from localStorage
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // find the recipe by name
    const recipe = recipes.find(r => r.name === recipeName);

    // toggle the favorite status
    recipe.isFavorite = !recipe.isFavorite;

    // update button styling and text based on the recipe's favorite status
    // if the recipe is marked as a favorite
    if (recipe.isFavorite) {
        // set the button text to "Unfavorite"
        button.textContent = "Unfavorite";
    // if the recipe is not a favorite
    } else {
        // set the button text to "Favorite"
    button.textContent = "Favorite";
    }
    // toggle the "btn-warning" class on the button if the recipe is a favorite
    button.classList.toggle("btn-warning", recipe.isFavorite);

    // toggle the "btn-outline-warning" class on the button if the recipe is NOT a favorite
    button.classList.toggle("btn-outline-warning", !recipe.isFavorite);

    // update favorites array based on the recipe's favorite status
    // if the recipe is a favorite
    if (recipe.isFavorite) {
        // check if the recipe is already in the favorites list
        // if the recipe is not already in the favorites list
        if (!favorites.some(r => r.name === recipe.name)) {
            // add it
            favorites.push(recipe);
        }
    // if the recipe is NOT a favorite
    } else {
        // find the index of the recipe in the favorites list
        const index = favorites.findIndex(r => r.name === recipe.name);
        
        // if the recipe is found in the favorites list (index >= 0)
        if (index > -1) {
            // remove the recipe from the favorites list
            favorites.splice(index, 1);
        }
    }

    // save updated arrays to localStorage
    localStorage.setItem("recipes", JSON.stringify(recipes));
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // update the UI
    displayFavorites();
    updateDashboard();

    // log the recipe's name and its updated favorite status to the console
    console.log(recipe.name + " is now " + (recipe.isFavorite ? "a favorite" : "not a favorite"));
}


// function to add a recipe to the favorites list in localStorage
function addRecipeToFavorites(recipe) {
    // retrieve the existing favorites list from localStorage
    // or initialize it as an empty array if it doesn't exist
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // check if the recipe is not already in the favorites list to avoid duplicates
    if (!favorites.some(r => r.name === recipe.name)) {
        // add the recipe to the favorites list 
        favorites.push(recipe);
    }

    // save the updated favorites list back to localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
}


// function to remove a recipe from the favorites list in localStorage
function removeRecipeFromFavorites(recipe) {
    // retrieve the existing favorites list from localStorage
    // or initialize it as an empty array if it doesn't exist
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // filter to create a new array without the recipe that needs to be removed
    favorites = favorites.filter(r => r.name !== recipe.name);

    // save the updated favorites list back to localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
}


// function to update the recipe in the recipes list stored in localStorage
function updateRecipeInLocalStorage(updatedRecipe) {
    // retrieve the existing recipes list from localStorage
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];

    // update the recipe in the recipes list
    // check if the recipe name matches
    for (let i = 0; i < recipes.length; i++) {
        // if it matches
        if (recipes[i].name === updatedRecipe.name) {
            // replace the recipe with the updated one 
            recipes[i] = updatedRecipe;
        }
    }
    // save the updated recipes list back to localStorage
    localStorage.setItem("recipes", JSON.stringify(recipes));
}


// display all favorited recipes under the favorites section
function displayFavorites() {
    // retrieve the favorites list from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // get the HTML element where the favorites will be displayed
    const favoritesList = document.getElementById('favoritesList');
    
    // clear the current content inside the favorites list 
    favoritesList.innerHTML = '';

    // apply filters to the favorites list before displaying
    applyFavoriteFilters(); 
}

// function to apply search, filter, and sort criteria for the Favorites List
function applyFavoriteFilters() {
    // retrieve the search query from the search bar and convert it to lowercase
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    
    // retrieve the selected category filter
    const selectedCategory = document.getElementById("categoryFilter").value;
    
    // retrieve the selected sorting criteria 
    const sortCriteria = document.getElementById("sortCriteria").value;

    // retrieve the list of favorite recipes from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // create a copy of the favorites array to apply filters without modifying the original array
    let filteredFavorites = Array.from(favorites);

    // apply search filter
    // only include recipes whose names contain the search query
    if (searchQuery) {
        filteredFavorites = filteredFavorites.filter(recipe =>
            // check if the name includes the search query
            recipe.name.toLowerCase().includes(searchQuery)
        );
    }

    // apply category filter
    // only include recipes that belong to the selected category
    if (selectedCategory) {
        filteredFavorites = filteredFavorites.filter(recipe =>
            // check if the recipe category matches the selected one
            recipe.category === selectedCategory 
        );
    }

    // apply sorting based on the selected criteria
    switch (sortCriteria) {
        // if user chooses time
        case "time":
            // sort by cooking/preparation time (ascending)
            filteredFavorites.sort((a, b) => (a.time || 0) - (b.time || 0));
            break;
        // if user chooses alphabetical
        case "alphabetical":
            // sort alphabetically by recipe name
            filteredFavorites.sort((a, b) => a.name.localeCompare(b.name));
            break;
        // if user chooses dateAdded
        case "dateAdded":
            // sort by the date the recipe was added (most recent first)
            filteredFavorites.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
    }

    // clear the current content inside the favorites list container
    const favoritesList = document.getElementById("favoritesList");
    favoritesList.innerHTML = "";

    // repopulate the favorites list with the filtered and sorted recipes
    filteredFavorites.forEach(recipe => createRecipeCard(recipe, favoritesList));
}

// function to update the dashboard with total recipes, favorited recipes, and recently added recipes
function updateDashboard() {
    // retrieve the recipes and favorites lists from localStorage 
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // update the total number of recipes on the dashboard
    document.getElementById("totalRecipes").textContent = recipes.length;

    // update the number of favorited recipes on the dashboard
    document.getElementById("favoritedRecipes").textContent = favorites.length;

    // get the container to display recently added recipes
    const recentRecipesContainer = document.getElementById("recentRecipes");
    
    // clear the current list of recently added recipes
    recentRecipesContainer.innerHTML = "";

    // create a copy of the recipes list to avoid changing the original list
    let recentRecipes = [];

    // loop through each recipe in the recipes array
    for (let i = 0; i < recipes.length; i++) {
        recentRecipes.push(recipes[i]);
    }

    // sort the recipes by the most recent ones first 
    recentRecipes.sort(function(a, b) {
        // convert 'dateAdded' from both recipes into Date objects for comparison
        let dateA = new Date(a.dateAdded);
        let dateB = new Date(b.dateAdded);

        // compare the dates: the most recent date should come first
        // if 'a' is older than 'b', 'b' comes first
        if (dateA < dateB) {
            return 1;
        // if 'a' is newer than 'b', 'a' comes first
        } else if (dateA > dateB) {
            return -1;
        } else {
        // if both dates are the same, keep them in the same order
            return 0;
        }
    });

    // get only the top 3 most recent recipes
    recentRecipes = recentRecipes.slice(0, 3);
    
    // display each of the recent recipes as a list item
    recentRecipes.forEach(recipe => {
        const listItem = document.createElement("li");
        // set the name of the recipe as text
        listItem.textContent = recipe.name; 
        // append the list item to the container
        recentRecipesContainer.appendChild(listItem);
    });
}

// function to update the favorited recipes count on the dashboard
function updateFavoriteCount() {
    // retrieve the favorites list from localStorage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // get the element where the favorited count will be displayed
    const favoriteCountElement = document.getElementById("favoriteCount");

    // update the text content to reflect the current number of favorites
    favoriteCountElement.textContent = favorites.length;
}

// toggle the visibility of the recipe form when the "Add Recipe" button is clicked
document.getElementById("toggleFormBtn").addEventListener("click", function() {
    const form = document.getElementById("recipeForm");
    
    // check if the form is currently hidden or has no defined display property
    // if hidden or no display style
    if (form.style.display === "none" || form.style.display === "") {
        // set it to "block" (show the form)
        form.style.display = "block";
    // otherwise 
    } else {
        // set it to "none" (hide the form)
        form.style.display = "none";
    }
});

// call displayFavorites when the page loads to show the stored favorites list
document.addEventListener('DOMContentLoaded', displayFavorites);
