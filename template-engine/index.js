const fs = require('fs');
const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');

const almacenamiento = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/imagenes');
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: almacenamiento });

const PUERTO = 8080;
const app = express();
const hbs = exphbs.create();
const path = require('path');

app.use(express.static(path.join(__dirname, '../public')));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/uploads`));

app.get('/', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  res.render('home_equipos', {
    layout: 'ui',
    equipos,
  });
});
function obtenerEqipoJSON(equiposJSON, value) {
  const equipo = equiposJSON.filter((elemento) => elemento.tla === value);
  return equipo[0];
}
app.get('/formulario', (req, res) => {
  res.render('form', {
    layout: 'ui',
  });
});
app.get('/ver/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const jugadores = JSON.parse(fs.readFileSync(`./data/equipos/${req.params.tla}.json`));
  const equipo = jugadores.squad;
  const data = obtenerEqipoJSON(equipos, `${req.params.tla}`);
  res.render('equipo', {
    layout: 'ui',
    data,
    equipo,
  });
});

app.get('/eliminar/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const equiposRestantes = equipos.filter((equipo) => equipo.tla !== `${req.params.tla}`);
  fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equiposRestantes));
  fs.unlinkSync(`./data/equipos/${req.params.tla}.json`);
  res.redirect('/');
});
app.get('/reiniciar', (req, res) => {
  const equiposTotales = JSON.parse(fs.readFileSync('./data/equipos.json'));
  fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equiposTotales));
  res.redirect('/');
});
function crearNuevoEquipo(equipo, file) {
  const nuevoEquipo = {
    //  id: equipo. No tiene.
    name: equipo.nombre,
    shortName: equipo.nombreAbreviado,
    tla: equipo.tla,
    email: equipo.email,
    area: {
      //    id: equipo.area.id, // NO se usa
      name: equipo.paisNombre,
    },
    phone: equipo.telefono,
    website: equipo.paginaWeb,
    founded: equipo.fundacion,
    address: equipo.direccion,
    clubColors: equipo.colores,
    venue: equipo.estadio,
    crestUrl: equipo.imagenURL,
    crestLocal: file === 'escudo' ? equipo.crestLocal : `/imagenes/${file}`,
  };
  return nuevoEquipo;
}
function guardarTlaEquipos(equipos) {
  const equiposTla = [];
  equipos.forEach((equipo) => {
    equiposTla.push(equipo.tla);
  });
  return equiposTla;
}
app.post('/form', upload.single('imagen'), (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const comrpobarTla = guardarTlaEquipos(equipos);
  if (comrpobarTla.find((elemento) => elemento === req.body.tla) !== undefined) {
    res.render('form', {
      layout: 'ui',
      data: {
        error: `El tla ${req.body.tla} ya fue usado.`,
      },
    });
  } else if (req.file !== undefined) {
    equipos.push(crearNuevoEquipo(req.body, req.file.originalname));
    fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file.originalname)),
    );
    res.redirect('/');
  } else {
    equipos.push(crearNuevoEquipo(req.body, req.file !== undefined));
    fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file !== undefined)),
    );
    res.redirect('/');
  }
});
app.get('/editar/:tla', (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const data = obtenerEqipoJSON(equipos, `${req.params.tla}`);
  res.render('editar', {
    layout: 'ui',
    data,
  });
});
app.post('/editar/:tla', upload.single('imagen'), (req, res) => {
  const equipos = JSON.parse(fs.readFileSync('./data/equipos.db.json'));
  const equiposRestantes = equipos.filter((equipo) => equipo.tla !== `${req.params.tla}`);
  if (req.file !== undefined) {
    equiposRestantes.push(crearNuevoEquipo(req.body, req.file.originalname));
  } else {
    equiposRestantes.push(crearNuevoEquipo(req.body, req.file !== undefined));
  }
  fs.writeFileSync('./data/equipos.db.json', JSON.stringify(equiposRestantes));
  res.redirect('/');
});
app.listen(PUERTO);
