
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const ejs = require('ejs');
const { response } = require('express');
const app = express();
const PORT =process.env.PORT || 3000;

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"))

const db = mongoose.createConnection("mongodb+srv://sarthak:1234@bankserver.xltblty.mongodb.net/User", { useNewUrlParser: true })

const Tdb= mongoose.createConnection("mongodb+srv://sarthak:1234@bankserver.xltblty.mongodb.net/transactions", { useNewUrlParser: true})

const User = db.model("User", new mongoose.Schema({
    name: String,
    email: String,
    Balance: Number,
    citizenship: String,
    AccountNumber:{
        type: String,
        required: true
    } ,
    AccountType:{
        type: String,
        required:[]
    },
}))

const transactions=Tdb.model("transactions", new mongoose.Schema({
    Semail: String,
    Remail: String,
    amount: Number
}

))

app.get('/', (req, res) => {
    res.render("home")
})
app.get('/customer', (req, res) => {
    User.find({}, function (err, founduser) {
        res.render("customer", { newUsers: founduser })

    })

})

app.get('/viewpage/:id',async function (req, res) {
    let oneUser
    oneUser=await User.findById(req.params.id)
    res.render("viewpage",{oneUser})
})


app.get("/user_info", (req, res) => {
    res.render("user_info")
})

app.get("/transaction_info", (req, res) => {
    transactions.find({},(err,foundtransactions)=>{
        res.render("transactions",{newTransaction:foundtransactions})
    })

})

app.get("/failed", (req, res) => {
    res.render("failed",{msg:''})
})

// //////////////////////////////////////////////////////////////////

app.post("/user_info", (req, res) => {
    const sender = req.body.senderEmail
    const reciver = req.body.reciverEmail
    const money = req.body.amount
    User.findOne({ email: sender }, (err, foundsender) => {
        if (err) {
            res.render("failed",{msg:'sender not found'})
        } else {
            if (foundsender) {
                User.findOne({ email: reciver }, (err, foundreciver) => {
                    if (err) {
                        res.render("failed",{msg:'reciver not found' })
                    } else {
                        if (foundreciver) {
                            if (money > foundsender.Balance) {
                                res.render("failed",{msg:'sender not have enough balance' })
                            } else {
                                const SenderAmount = foundsender.Balance - money
                                User.updateOne({ email: sender }, { Balance: SenderAmount }, (err) => {
                                    if (err) {
                                        res.redirect("failed",{msg:'transaction failed' })
                                    } else {
                                        console.log("updated successfully");
                                    }
                                    const ReciverAmount = foundreciver.Balance + Number(money)
                                    console.log(ReciverAmount);
                                    User.updateOne({ email: reciver }, { Balance: ReciverAmount }, (err) => {
                                        if (err) {
                                            res.render("failed",{msg:'transaction failed!' })
                                        } else {
                                            console.log("updated successfully");
                                            transactions.insertMany({Semail:sender,Remail:reciver,amount:money},(err)=>{
                                                if (err) {
                                                    res.render("failed",{msg:'transaction failed!' })
                                                }else{
                                                    console.log("table updated successfully");
                                                    User.find({}, function (err, founduser) {
                                                        res.render("customer", { newUsers: founduser })
                                                
                                                    })
                                                }
                                            })
                                            
                                        }
                                    })

                                })

                            }
                        }
                    }

                })
            }
        }
    })
})
app.listen(PORT, (res, req) => {
    console.log("server listening on port 3000");
})