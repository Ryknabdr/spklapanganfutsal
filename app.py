from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
from models import db, Kriteria, Alternatif, Hasil
from saw import calculate_saw

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

@app.before_request
def create_tables():
    db.create_all()
    # Initialize criteria if not exists
    criteria_names = ['harga', 'jarak', 'fasilitas', 'kenyamanan', 'pencahayaan']
    for name in criteria_names:
        if not Kriteria.query.filter_by(nama=name).first():
            k = Kriteria(nama=name, bobot=0.0)
            db.session.add(k)
    db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/kriteria', methods=['GET', 'POST'])
def kriteria():
    if request.method == 'GET':
        kriteria = Kriteria.query.all()
        return jsonify([{ 'id': k.id, 'nama': k.nama, 'bobot': k.bobot } for k in kriteria])
    elif request.method == 'POST':
        data = request.json
        for item in data:
            k = Kriteria.query.filter_by(nama=item['nama']).first()
            if k:
                k.bobot = float(item['bobot'])
        db.session.commit()
        return jsonify({'message': 'Bobot kriteria berhasil diperbarui'})

@app.route('/api/alternatif', methods=['GET', 'POST'])
def alternatif():
    if request.method == 'GET':
        alternatif = Alternatif.query.all()
        return jsonify([{
            'id': a.id,
            'nama': a.nama,
            'harga': a.harga,
            'jarak': a.jarak,
            'fasilitas': a.fasilitas,
            'kenyamanan': a.kenyamanan,
            'pencahayaan': a.pencahayaan
        } for a in alternatif])
    elif request.method == 'POST':
        data = request.json
        a = Alternatif(
            nama=data['nama'],
            harga=float(data['harga']),
            jarak=float(data['jarak']),
            fasilitas=float(data['fasilitas']),
            kenyamanan=float(data['kenyamanan']),
            pencahayaan=float(data['pencahayaan'])
        )
        db.session.add(a)
        db.session.commit()
        return jsonify({'message': 'Alternatif berhasil ditambahkan'})

@app.route('/api/hitung', methods=['GET'])
def hitung():
    kriteria = Kriteria.query.all()
    weights = {k.nama: k.bobot for k in kriteria}
    alternatif = Alternatif.query.all()
    alternatives = []
    for a in alternatif:
        alternatives.append({
            'nama': a.nama,
            'harga': a.harga,
            'jarak': a.jarak,
            'fasilitas': a.fasilitas,
            'kenyamanan': a.kenyamanan,
            'pencahayaan': a.pencahayaan
        })
    results = calculate_saw(alternatives, weights)
    # Clear previous results
    Hasil.query.delete()
    db.session.commit()
    # Save new results
    for res in results:
        alt = Alternatif.query.filter_by(nama=res['nama']).first()
        h = Hasil(
            alternatif_id=alt.id,
            skor_normalisasi=sum(res['normalisasi'].values()),
            total_skor=res['total_skor'],
            peringkat=res['peringkat']
        )
        db.session.add(h)
    db.session.commit()
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
