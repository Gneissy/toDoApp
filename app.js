const express = require("express"); // Express is required
const app = express(); // I'll use "app" for accesing express
const https = require("https"); // https is required for get request
app.use(express.urlencoded({extended:true})); // Body-parser
app.use(express.static("public")); // Static method in order to access local files like css and images
const _ = require("lodash"); // Requiring lodash
var Parse = require('parse/node'); // Back4App Activating

// Parse.initialize("ojI5fzgskPxNNxbKNtPhs3IfyqZ32boc2Ficxylt","KF62WwPD0xwqW62wyex44IkpUQ2RPtMhOue3Cr3Y"); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
// Parse.serverURL = 'https://parseapi.back4app.com/'

const date = require (__dirname + "/date.js")
app.set("view engine", "ejs"); // Activating ejs

// ___________________________________________________________Database related
const mongoose = require("mongoose"); // Requiring mongoose
mongoose.connect('mongodb+srv://admin-ahmet:2503199600@cluster0.n8hirrx.mongodb.net/todolistDB'); // Creates the DB and connects to it


// Creating a DB Schema
const itemSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: [true, "The item requires a name."]
  }
});
const Item = mongoose.model("Item", itemSchema); // "items" collection is created


//  Creating custom DB List Schema
const customListSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const CustomList = mongoose.model("customList", customListSchema);


// Creating document
const task1 = new Item ({
  name: "Welcome to My 2DoList!"
});
const task2 = new Item ({
  name: "You can add your tasks by + button."
});
const task3 = new Item ({
  name: "👈 Press this when you've done!"
});

const defaultItems = [task1, task2, task3];


//_________________________________________________________________get requests
app.get("/", function(req, res) { // Displaying home route
  // date.getDate();
  Item.find({}, function(err, foundItem){ // select * from Item
    if (foundItem.length==0){ // If it's empty, add default items
      Item.insertMany([task1, task2, task3], function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Successfully added 3 items.");
          res.redirect("/");
        }
      });
    }else{
      res.render("list", {
        dayShown : "Today",
        newTaskItem: foundItem // our Item collection
      });
    }
  });
});



app.get("/:input", function(req, res){ // Displaying any custom route
    const input = _.capitalize(req.params.input);

    CustomList.findOne({name: input}, function(err, foundList){ // Search in customlist collection
      if(!err){ // If there's no error,
        if(!foundList){ // If there's no founding
          // Create a new custom list
            const customList = new CustomList({
              name: input, // that user entered
              items: defaultItems
            });
            customList.save(); // Save into DB
            res.redirect("/"+ input); // Redirect so that it can go "else" statement.
        }else{
          // Show the existing list
            res.render("list", { // Display the website
              dayShown: foundList.name, // Found object's name
              newTaskItem: foundList.items // Found object's items (default at first)
            });
        }
      }
    });
});

app.get("/about", function(req,res){
  res.render("about");
});

//________________________________________________________________post requests
app.post("/", function(req,res){
  let newTask = req.body.newItem; // Body parser to get user inputs as JS variables
  let listName = req.body.submitButton; // Body parser to get the value of "dayShown"
  // List name is found from submitButton's value: "dayShown"

  let newItem = new Item({ // Create a new object having the properties user inputted:
    name: newTask
  });

  if (listName === "Today"){ // If user is in home page,
    newItem.save(); // Add the new item into home page's list
    res.redirect("/"); // Return home page
  }else{ // If user is in a custom list page,
    CustomList.findOne({name: listName}, function (err, foundList){
      // Search for its list name, in the collection "customlists"
      // "CustomList" here is the "model" name
      // "foundList" here is the object we found via the function
      foundList.items.push(newItem); // Add the task into foundList's items array
      foundList.save(); // Save it into DB
      res.redirect("/"+listName); // Redirect to the corresponding page
      });
    }
  });


app.post("/delete", function(req, res) { // Deleting checked item
  let checkedItemID = req.body.deleteItemCheckbox; // We reach checkbox's "value" from its "name".
  let listName = req.body.listName; // We reach the value of "which list the item belongs to" from listName.

  if (listName === "Today") { // If user is on main page
    Item.deleteOne({_id: checkedItemID}, function(err) { // Find item according to checked item's id and remove it.
        if (!err) {
          console.log("Successfully deleted.");
          res.redirect("/"); // Return to home page.
        }
      });
} else { // If user is not on the main page
  CustomList.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err,foundList){
    if(!err){
      res.redirect("/"+listName); // Redirect to the corresponding page
    }
  });
  }
});

// __________________________________________________________Running the server
app.listen(process.env.PORT || 3000, function(){
  console.log("Server is on and ready to wrack baby");
});
