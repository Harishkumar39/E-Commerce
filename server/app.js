const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const Razorpay = require('razorpay')
const mailer = require('nodemailer')
const crypto = require('crypto')

const {MongoClient} = require('mongodb');
const { Collection } = require('mongoose')
// let { Collection } = require('mongoose');

const url="mongodb://127.0.0.1:27017/"
const dbname = "ECommerce"

let dbcollection = "products"

const client = new MongoClient(url);

const app =express()

app.use(express.static('public'))
app.use(bodyParser.json({limit: '50mb'}))

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        return cb(null, './public/images')
    },
    filename: function(req, file, cb){
        return cb(null, `${file.originalname}`)
    }
})

const upload = multer({storage})


// const writeDataToFile = (data) => {
//     const filepth = 'products.js';
//     const filecnt = `export const products = [${JSON.stringify(data, null, 2)}]`

//     fs.writeFile(filepth, filecnt, (err)=>{
//         if(err){
//             console.log("Error");
//             return;
//         }
//         console.log("Data has been written");
//     })
// }


let list1 = []
let cartList = []
let id=0, cartId=0

let db = null
let collection = null
let dbdata = null

const api = "3902@7299&123"

app.use(cors({
    origin:'http://localhost:3000',
    methods:['GET', 'POST'],
}))

app.get("/", async (req, res)=>{
    dbcollection = "products"
    collection = db.collection(dbcollection)
    dbdata = await collection.find({}).toArray();
    res.json(dbdata);
})

app.get('/Cart', async (req, res)=>{

    dbcollection = "cart"
    collection = db.collection(dbcollection)
    dbdata = await collection.find({}).toArray();
    res.json(dbdata);

})

app.post('/Cart', async (req, res) => {
    try {
        dbcollection = "cart"
        collection = db.collection(dbcollection)
        const newItem = req.body;
        await insertIntoCollection(newItem)
        console.log('Length '+newItem.length);
        console.log("Here");
        console.log(newItem);
        // cartList.push(newItem);  
        res.json({ success: true, newItem });
    } catch (error) {
        console.log("Error "+error);
    }
    
});

app.post('/cart/updateQty', async(req, res)=>{
    dbcollection = "cart"
    collection = db.collection(dbcollection)
    const id = req.body.id
    const qty = req.body.qty
    await updateCollection(id, qty)
    res.json({message:'success'})
})

app.post('/api/Insert', (req, res)=>{
    const {name, price} = req.body
    list1.push({id, name, price});
    // console.log("list");
    // console.log(list1);
    res.json({message:[name, price]})
    id+=1
})



app.post("/uploads", upload.single('file'), async(req, res)=>{
    dbcollection = "products"
    collection = db.collection(dbcollection)
    let len = list1.length
    if (req.file) {
        console.log("File uploaded:", req.file);
        const imageUrl = `http://localhost:5000/images/${req.file.filename}`;
        const newItem = { ...list1[list1.length - 1],"imageUrl": imageUrl };
        list1[list1.length - 1] = newItem;
        console.log(list1.length);
        insertIntoCollection(newItem)
        //Insertion code to be placed here if not working as separate fn
        list1=[]
        return res.json({ success: true });
    } else {
        // Handle file upload failure
        console.error("File upload failed:", req.file);
        return res.status(400).json({ success: false, message: "File upload failed" });
    }
})

app.post("/removeFromCart", async (req, res)=>{
    // dbcollection = "cart"
    // collection = db.collection(dbcollection)
    // console.log(req.body.index);
    await deleteFromCollection(req.body.index)
    res.json({message:"success"})
})

const razorpay = new Razorpay({
    key_id: 'rzp_test_UHvz6ZssWrtKoB',
    key_secret: 'frrBLsR9TGAwrcw8Us6ltGTM'
});  

//zrfxpmzfnpnhrytz - harish200903@gmail.com
app.post('/cart/checkout', async(req, res)=>{
    await deleteCart()
    const {totalAmount, currency="INR"} = req.body;
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: `receipt_order_${new Date().getTime()}`
    };
    try {
        const response = await razorpay.orders.create(options);
        
        res.json({
            orderId: response.id,
            amount: response.amount,
            currency: response.currency
        });
        // const subject = "Regarding the order you have placed."
        // const text = "You have successfully placed the order."
        // await mailing(req.body.email, subject, text)

    } catch (error) {
        res.status(500).send('Error creating order: ' + error.message);
    }    
})

let otps={}

function generateOtp(){
    return crypto.randomBytes(3).toString('hex');
}

app.post('/cart/verify', async(req, res)=>{
    
    const {email} = req.body;
    const otp = generateOtp();

    otps[email] = otp;
    try {
        const subject = 'Otp for Email verification.'
        const text = otp
        await mailing(email, subject, text)
        res.json({message:"OTP sent to your mail successfully!!"})    
    } catch (error) {
        res.status(500).json("Error in Sending Otp ");
    }
    
})

app.post('/cart/validate-otp', async(req, res)=>{
    const {email, otp}= req.body;
    if(otps[email] === otp){
        delete otps[email]
        res.json({valid: true});
    }
    else{
        res.json({valid: false});
    }
})

app.post('/cart/checkout/order', async(req, res)=>{
    const {email} = req.body
    const subject = "Regarding the order you have placed."
    const text = "You have successfully placed the order."
    await mailing(email, subject, text)

})


app.listen(5000, async () => {
    try {
        await connectMongoDB(); // Connect to MongoDB before starting the server
        console.log("Server is running on port 5000");
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); // Exit the process if server startup fails
    }
});

async function connectMongoDB() {
    try {
        // const client = new MongoClient(url);
        await client.connect();
        db = client.db(dbname);
        collection = db.collection(dbcollection);
        dbdata = await collection.find({}).toArray();
        console.log("Connected to MongoDB");
        console.log(dbdata);
        return collection; // Return the collection for further use
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // Throw the error for proper error handling
    }
}

async function deleteCart(){
    try {
        dbcollection = "cart";
        collection = db.collection(dbcollection);
        await collection.deleteMany({});
        console.log("Success");
        
    } catch (error) {
        console.log("Error in Deleting cart"+error);
    }
}

async function updateCollection(id, qty){
    try {
        const filter = {id: id}
        const updatedDoc = {
            $set:{qty:qty}
        }
        await collection.updateOne(filter, updatedDoc)
        console.log("Update successful");
    } catch (error) {
        console.log("UpdateQty : "+error);
    }
}

async function insertIntoCollection(newItem){
    try{
        const dt = await collection.insertOne(newItem)
        console.log("Inserted Successfully!!!");
        console.log(dt);
        
    }catch(error){
        console.log("Error " + error);
    }
}

async function deleteFromCollection(id){
    try{
        dbcollection = "cart"
        collection = db.collection(dbcollection)
        const result = await collection.deleteOne(Object(id));

        // Check if the item was successfully removed
        if (result.deletedCount === 1) {
            console.log('Item removed successfully');
        } else {
            console.log('Item not found or already removed');
        }
    }
    catch(error){
        console.log("Error "+error);
    }
}

async function mailing(mail, sub, txt){
    var transporter = mailer.createTransport({
        service:'gmail',
        auth:{
            user:'harish200903@gmail.com',
            pass:'zrfxpmzfnpnhrytz'
        }
    })

    var mails = {
        from: 'harish200903@gmail.com',
        to: mail,
        subject: sub,
        text: txt
    }
    transporter.sendMail(mails, function(error, info){
        
        if (error) {
            console.log("Error in sending mail");
        }
        else{
            console.log("Mail sent");
        }
    })
}

//Mics

// try{
//     const dt = await collection.insertOne({id, name, price})
//     console.log("Inserted Successfully!!!");
//     console.log(dt);
//     list1.push({id, name, price});
//     console.log("list");
//     console.log(list1);
//     res.json({message:[name, price]})
    
// }catch(error){
//     console.log("Error " + error);
// }