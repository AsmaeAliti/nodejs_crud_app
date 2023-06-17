const express = require('express')
const router = express.Router()
// const stagiaire = require("../models/stagiaire")
const Stagiaire = require("../models/stagiaire"); // Use "Stagiaire" instead of "stagiaire" for importing the model
const fs = require("fs")
// ...
const multer = require("multer")

// Set up multer storage and upload configuration
const storage = multer.diskStorage({
  // Define the destination directory for uploaded files
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  // Define the filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_"+ Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('image'); // Specify the field name for file upload

// insert stagiare into db 
router.post('/add' , upload , async (req, res )=>{
    try {
      const newStagiaire = new Stagiaire({
          nom: req.body.nom,
          prenom: req.body.prenom,
          image: req.file.filename
      });
      await newStagiaire.save();
      req.session.message = {
          type: 'success',
          message: 'Stagiare est ajouté avec succès'
      };
      res.redirect('/');
  } catch (err) {
      res.json({ message: err.message, type: 'danger' });
  }
})

router.get("/", async (req, res) => {
  try {
    const stagiaires = await Stagiaire.find();
    res.render("index", {
      title: "Home page",
      stagiaires: stagiaires
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});


router.get("/add" , (req , res)=>{
    res.render('ajouter_stagiaire' , {title : "ajouter stagiaire"})
});

// ...


router.get("/modifier-stagiaire/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const fetchedStagiaire = await Stagiaire.findOne({ _id: id }).exec();
    
    if (!fetchedStagiaire) {
      return res.redirect("/");
    }
    
    res.render("modifier-stagiaire", {
      title: "Modifier Stagiaire",
      stagiaire: fetchedStagiaire,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});


router.post("/modifier/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let newImage = "";

    if (req.file) {
      newImage = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.oldImage.trim());
      } catch (err) {
        console.log(err);
      }
    } else {
      newImage = req.body.oldImage;
    }

    await Stagiaire.findByIdAndUpdate(id, {
      nom: req.body.nom,
      prenom: req.body.prenom,
      image: newImage
    });

    req.session.message = {
      type: "success",
      message: "Le Stagiaire est Modifier avec succès"
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// ...
router.get('/supprimer/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Stagiaire.findByIdAndRemove(id);

    if (result.image !== '') {
      try {
        fs.unlinkSync('./uploads/' + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    req.session.message = {
      type: 'info',
      message: 'Le Stagiaire est supprimer avec succès',
    };
    res.redirect('/');
  } catch (err) {
    res.json({ message: err.message });
  }
});
router.get("/search", async (req, res) => {
  try {
    const recherche = req.query.recherche;

    const stagiaires = await Stagiaire.find({
      $or: [
        { nom: { $regex: recherche, $options: "i" } },
        { prenom: { $regex: recherche, $options: "i" } },
      ],
    });

    res.render("index", { title: "Afficher Stagiaire", stagiaires, recherche });
  } catch (err) {
    res.json({ message: err.message, type: "red" });
  }
});


module.exports = router