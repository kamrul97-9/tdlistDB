const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


//var items = [];

// const items = ["Buy Food", "Cook Food", "Sell Food"]; //see line 19
// const workItems = [];

//connect mongoose server
mongoose.connect("mongodb://localhost:27017/tdlistDB",
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
//create new database inside a schema
const itemSchema ={
    name: String
};
//create schema model
const Item = mongoose.model("Item", itemSchema);

//create new document using Item (mongoose model)
const item1 = new Item({
    name: "Welcome to you todolist!!"
});

const item2 = new Item({
    name: "Hit the + button to off a new item"
});

const item3 = new Item({
    name: "<--Hit this to delete item."
}) ;

const defualItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

// Item.insertMany(defualItems, function(error){
//     if(error){
//         console.log(error);
//     } else{
//         console.log("Successfully saved default items to database");
//     }
// });

app.get('/', (req, res, next) =>{

    //show items in webpages
   Item.find({}, function(error, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defualItems, function(error){
                if(error){
                    console.log(error);
                } else{
                    console.log("Successfully saved default items to database");
                }
            });
            res.redirect('/');

        } else{
             //console.log(foundItems);
       res.render("list", { listTitle: "Today", newListItems: foundItems}); // see 1-8
        }   
   });
});

app.get('/:customListName', (req, res, next)=>{
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (error, foundList)=>{
        if(!error){
            if(!foundList){
                //console.log("Doesn't exist!!");
                //create a new list    
                const list = new List({
                    name: customListName,
                    items: defualItems,
                });
                list.save();
                res.redirect('/' + customListName);
            } else{
                //console.log("Exists");
                //Show an existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.post("/", (req, res, next) => {
    //var item = req.body.newItem;
    // item = req.body.newItem;

     const itemName = req.body.newItem;
     const listName = req.body.list;

     const item = new Item({
         name: itemName
     });
     if(listName === "Today"){
        item.save();
        res.redirect("/");
     } else{
        List.findOne({name: listName}, (error, foundList)=>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
        });
     }
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    
    
    //res.send(item);
    //res.render("list", {newlistItem: item}); // see line 1-6
     //return res.redirect("/");
});
app.post('/delete', (req, res, next)=>{
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, (err)=>{
            if(err){
                console.log(error);
            } else{
                console.log("This item has been deleted succesfully");  
            }
        });
        res.redirect('/');
    } else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(error, foundList){
            if(!error){
                res.redirect("/" + listName);
            }
        });
    }
});

const port = 3003;
app.listen(port, () =>{
    console.log(`This server is running on https://localhost:${port}`);  
})