const fs = require('fs');
const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');

const upload = multer({ dest: './uploads/imagenes' });

const PUERTO = 8080;
const app = express();
const hbs = exphbs.create();
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  res.render('home_equipos', {
    layout: 'ui',
    equipos,
  });
});
function obtenerEqipoJSON(equiposJSON, value) {
  const equipo = equiposJSON.filter((equipo) => equipo.tla === value);
  return equipo[0];
}
app.get('/formulario', (req, res) => {
  res.render('form', {
    layout: 'ui',
  });
});
app.get('/ver/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const jugadores = JSON.parse(fs.readFileSync(`./data/equipos/${req.params['tla']}.json`));
  const equipo = jugadores.squad
  const data = obtenerEqipoJSON(equipos, `${req.params['tla']}`);
  res.render('equipo', {
    layout: 'ui',
    data,
    equipo,
  });
});
app.get('/editar/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const data = obtenerEqipoJSON(equipos, `${req.params['tla']}`);
  res.render('editar', {
    layout: 'ui',
    data,
  });
});
app.get('/eliminar/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const equiposRestantes = equipos.filter((equipo) => equipo.tla !== `${req.params['tla']}`);
  fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equiposRestantes));
  res.redirect('/');
});
app.get('/reiniciar', (req, res)=>{
  const equiposTotales = JSON.parse(fs.readFileSync('./data/equipos.json'));
  fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equiposTotales));
  res.redirect('/');
});
app.post('/form', upload.single('imagen'), (req, res) => {

});
app.listen(PUERTO);
const jugadores = JSON.parse(fs.readFileSync(`./data/equipos/ARS.json`));
console.log(`Escuchando en http://localhost:${PUERTO}`);


//  console.log(obtenerEqipoJSON(equipos, 'ARS'))

/*
  push al array de equipos. Lo remplaza obviamente, agregando el nuevo. Dentro de ese push
  Tiene que estar un objetc. Con todas las caracteristicas.
  funcion crear nuevo equipo. Primero larga un equipo. EL json y el archivo para la imagen..



    "id": 57,
    "area": {
      "id": 2072,
      "name": "England"
    },
    "name": "Arsenal FC",
    "shortName": "Arsenal",
    "tla": "ARS",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "address": "75 Drayton Park London N5 1BU",
    "phone": "+44 (020) 76195003",
    "website": "http://www.arsenal.com",
    "email": "info@arsenal.co.uk",
    "founded": 1886,
    "clubColors": "Red / White",
    "venue": "Emirates Stadium",
    "lastUpdated": "2020-05-14T02:41:34Z"

    app.get('/equipos', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.json'));
  res.render('equipo', {
    layout: 'ui',
    data: {
      mensaje: 'Éxito!',
      nombreArchivo: req.file.filename,
    },
  });
  console.log(equipos);
  res.setHeader('Content-Type', 'application/json');

  res.send(equipos);
});
*/
