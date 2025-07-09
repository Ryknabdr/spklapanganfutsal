import os

class Config:
    # MySQL database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root@localhost/spk_futsal')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
