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
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/spk')
def spk():
    return render_template('spk.html')

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

@app.route('/api/kriteria/<int:id>', methods=['DELETE', 'PUT'])
def kriteria_detail(id):
    k = Kriteria.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(k)
        db.session.commit()
        return jsonify({'message': 'Kriteria berhasil dihapus'})
    elif request.method == 'PUT':
        data = request.json
        k.nama = data.get('nama', k.nama)
        db.session.commit()
        return jsonify({'message': 'Kriteria berhasil diupdate'})

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

@app.route('/api/alternatif/<nama>', methods=['DELETE', 'PUT'])
def alternatif_detail(nama):
    try:
        # Decode URL jika ada encoding
        nama_decoded = nama.replace('%20', ' ').replace('+', ' ')
        print(f"Trying to find alternatif with nama: '{nama_decoded}'")
        
        a = Alternatif.query.filter_by(nama=nama_decoded).first()
        
        if not a:
            print(f"Alternatif '{nama_decoded}' not found")
            # List all alternatif for debugging
            all_alternatif = Alternatif.query.all()
            print("All alternatif in database:")
            for alt in all_alternatif:
                print(f"  - '{alt.nama}'")
            return jsonify({'error': 'Alternatif tidak ditemukan'}), 404
            
        print(f"Found alternatif: {a.nama}")
            
        if request.method == 'DELETE':
            # Hapus data hasil yang terkait terlebih dahulu
            hasil_terkait = Hasil.query.filter_by(alternatif_id=a.id).all()
            for hasil in hasil_terkait:
                db.session.delete(hasil)
            
            # Kemudian hapus alternatif
            db.session.delete(a)
            db.session.commit()
            print(f"Successfully deleted alternatif: {a.nama}")
            return jsonify({'message': 'Alternatif berhasil dihapus'})
        elif request.method == 'PUT':
            data = request.json
            a.nama = data.get('nama', a.nama)
            db.session.commit()
            return jsonify({'message': 'Alternatif berhasil diupdate'})
    except Exception as e:
        print(f"Error in alternatif_detail: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
