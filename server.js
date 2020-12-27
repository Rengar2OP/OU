const express = require('express');
const session = require('cookie-session');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://rengar2op:appleSA44@cluster0.bolyd.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';
const fs = require('fs');
const assert = require('assert');
const formidable = require('express-formidable');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(formidable());
app.set('view engine','ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'demo', password: ''},
	{name: '12651162', password: ''}
);

app.set('view engine','ejs');

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY]
}));

const insertDocument = (db, doc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        db.collection('Restaurant').insertOne(doc, 
            {
                $set : doc,
            },
            (err, results) => {
            client.close();
            assert.equal(err,null);          
            callback(results);
        }
        );
        db.collection('Restaurant').update(
            { 
                "grades": "",
                "rate" : "",
            },
            { 
                "$push": {
                    "groups.$.groupMembers" : "bill"
                }
            }
        )
        
    });
}

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('Restaurant').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
        assert.equal(err,null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}

const deleteDocument = (db, criteria, callback) => {
    db.collection('Restaurant').deleteOne(criteria, (err,results) => {
        assert.equal(err,null);
        console.log('deleteMany was successful');
        callback(results);
    })
}

const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('Restaurant').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Create = (user,req, res, criteria) => {

    var DOCID = {};
    DOCID['_id'] = ObjectID(req.fields._id);
    var updateDoc = {};
    updateDoc['name'] = req.fields.name1;
	updateDoc['borough'] = req.fields.borough;
	updateDoc['cuisine'] = req.fields.cuisine;
	updateDoc['street'] = req.fields.street;
	updateDoc['building'] = req.fields.building;
	updateDoc['zipcode'] = req.fields.zipcode;
	updateDoc['coordlon'] = req.fields.lon;
    updateDoc['coordlat'] = req.fields.lat;
    updateDoc['owner'] = user;
    if (req.files.photo.size > 0) {
        fs.readFile(req.files.photo.path, (err,data) => {
            assert.equal(err,null);
            updateDoc['photo'] = new Buffer.from(data).toString('base64');
            insertDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Document created`})
                });
            });
        } else {
            insertDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Document created`})
            });
        }
}

const handle_Read = (user, res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('read',{name:user,Restaurant: docs});
        });
    });
}

const handle_Find = (name, borough, cuisine,res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('result',{name,borough,cuisine,Restaurant: docs});
        });
    });
}

const handle_Display = (user, res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        findDocument(db, DOCID, (docs) => {  
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {name:user,Restaurant: docs[0]});
        });
    });
}

const handle_Edit = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('Restaurant').find(DOCID);
        cursor.toArray((err,docs) => {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{c: docs[0]});
        });

    });
}

const handle_Delete = (id,res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        
        deleteDocument(db, criteria, (results) => {
            client.close();
            console.log("Closed DB connection");
            console.log(results);
            res.status(200).render('info', {message: `Document deleted`})
        });
    });
}

const handle_Rate= (req, res, criteria) => {

    var DOCID = {};
    DOCID['_id'] = ObjectID(req.fields._id);
    var updateDoc = {};
    updateDoc['rate'] = 

	updateDoc['coordlat'] = req.fields.lat;
        updateDocument(DOCID, updateDoc, (results) => {
        res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
    });
}



const handle_Update = (req, res, criteria) => {

    var DOCID = {};
    DOCID['_id'] = ObjectID(req.fields._id);
    var updateDoc = {};
    updateDoc['name'] = req.fields.name1;
	updateDoc['borough'] = req.fields.borough;
	updateDoc['cuisine'] = req.fields.cuisine;
	updateDoc['street'] = req.fields.street;
	updateDoc['building'] = req.fields.building;
	updateDoc['zipcode'] = req.fields.zipcode;
	updateDoc['coordlon'] = req.fields.lon;
	updateDoc['coordlat'] = req.fields.lat;
    if (req.files.photo.size > 0) {
        fs.readFile(req.files.photo.path, (err,data) => {
            assert.equal(err,null);
            updateDoc['photo'] = new Buffer.from(data).toString('base64');
            updateDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
                });
            });
        } else {
            updateDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
            });
        }
}

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) { 
		res.redirect('/login');
	} else {
		res.redirect('/read');
	}
});

app.get('/login', (req,res) => {
	res.status(200).render('login',{});
});

app.post('/login', (req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {
			req.session.authenticated = true;        
			req.session.username = req.body.name;	 	
		}
	});
	res.redirect('/');
});

app.get('/read', (req,res) => {
	if (!req.session.authenticated) { 
		res.redirect('/login');
	} else {
		const user = req.session.username;
		handle_Read(user,res, req.query.docs);
	}
})

app.get('/new', (req,res) => {
	if (!req.session.authenticated) { 
		res.redirect('/login');
	} else {
		res.status(200).render('new',{name:req.session.username});
	}
})

app.post('/create', (req,res) => {
    const user = req.session.username;
    handle_Create(user,req,res, req.query);
})

app.get('/find', (req,res) => {
    res.status(200).render('find',{});
})

app.post('/result', (req,res) => {
    var name = req.body.name;
    var borough = req.body.borough;
    var cuisine = req.body.cuisine; 
    handle_Find(name,borough,cuisine,res, req.query.docs);
})

app.post('/rated', (req,res) => {
    const user = req.session.username;
    var score = req.body.rate;
    handle_Rate(score,user,res, req.query.docs);
})

app.get('/display', (req,res) => {
	const user = req.session.username;
	handle_Display(user,res, req.query);
})

app.get('/gmap', (req,res) => {
	res.status(200).render("leaflet.ejs", {
		lat:req.query.lat,
		lon:req.query.lon,
		zoom:req.query.zoom ? req.query.zoom : 15
	});
	res.end();
})

app.get('/rate', (req,res) => {
	const user = req.session.username;
	res.status(200).render('rate',{user});
})

app.get('/edit', (req,res) => {	
	handle_Edit(res, req.query);
})

app.get('/delete', (req,res) => {	
	handle_Delete(res, req.query);
})
app.post('/update', (req,res) => {
    handle_Update(req, res, req.query);
})

app.get('/api/restaurant/name/:name',(req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
})

app.get('/api/restaurant/borough/:borough',(req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['borough'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing borough"});
    }
})

app.get('/api/restaurant/cuisine/:cuisine',(req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['cuisine'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing cuisine"});
    }
})

app.get('/logout', (req,res) => {
	req.session = null;   
	res.redirect('/');
});

app.listen(process.env.PORT || 8099);