import express from 'express';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database("quotes.db");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


app.get("/", (req, res) => {
    db.all('SELECT * FROM quotes', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Citat");
        }
        res.render('index', { quotes: rows });
    });
});


app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/api/quote', (req, res) => {
    const { quote, author } = req.body;

    if (!quote || !author) {
        return res.status(400).send("Citat och författare måste fyllas i");
    }

    db.run('INSERT INTO quotes (text, author) VALUES (?, ?)', [quote, author], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Fel vid sparande av citat");
        }
        res.redirect('/');
    });
});


app.delete('/api/quote/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM quotes WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: "Fel vid borttagning av citat" });
        }
        res.status(200).send({ id });
    });
});

app.get('/update/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM quotes WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Fel vid hämtning av citat");
        }

        if (!row) {
            return res.status(404).send("Citatet hittades inte");
        }

        res.render('update', { quote: row });
    });
});


app.put('/api/quote', express.json(), (req, res) => {
    const { id, text, author } = req.body;

    if (!id || !text || !author) {
        return res.status(400).json({ success: false, message: 'Alla fält måste fyllas i!' });
    }

    db.run('UPDATE quotes SET text = ?, author = ? WHERE id = ?', [text, author, id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Fel vid uppdatering av citat' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Citatet hittades inte' });
        }

        res.json({ success: true, message: 'Citatet har uppdaterats!' });
    });
});

app.listen(3000, err => {
    if (err)
        console.error(err);
});
