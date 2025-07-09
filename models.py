from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Kriteria(db.Model):
    __tablename__ = 'kriteria'
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(50), nullable=False, unique=True)
    bobot = db.Column(db.Float, nullable=False)

class Alternatif(db.Model):
    __tablename__ = 'alternatif'
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False, unique=True)
    harga = db.Column(db.Float, nullable=False)
    jarak = db.Column(db.Float, nullable=False)
    fasilitas = db.Column(db.Float, nullable=False)
    kenyamanan = db.Column(db.Float, nullable=False)
    pencahayaan = db.Column(db.Float, nullable=False)

class Hasil(db.Model):
    __tablename__ = 'hasil'
    id = db.Column(db.Integer, primary_key=True)
    alternatif_id = db.Column(db.Integer, db.ForeignKey('alternatif.id'), nullable=False)
    skor_normalisasi = db.Column(db.Float, nullable=False)
    total_skor = db.Column(db.Float, nullable=False)
    peringkat = db.Column(db.Integer, nullable=False)

    alternatif = db.relationship('Alternatif', backref=db.backref('hasil', uselist=False))
