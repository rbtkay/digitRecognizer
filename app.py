from flask import Flask, request, render_template, jsonify
import pickle
import pandas as pd
import numpy as np
import os
from PIL import Image
import csv

GET = 'GET'
POST = 'POST'

app = Flask(__name__, template_folder='.')

#chargement du modèle

model = pickle.load(open('model.pkl','rb'))


@app.route('/', methods=[GET])
def home():
    return render_template("index.html")


@app.route('/recognize-digit', methods=[POST])
def recognize():
    # parse du JSON envoyé via fetch
    matrix = request.get_json(force=True)['matrix']
    
    im = Image.new('RGB', (116, 116))
    array = [(px,px,px) for px in matrix]
       
    im.putdata(array)

    im.thumbnail((28,28))
    im.save('resized.png')
    matrix = list(im.getdata())
    
    result = [rgb[0] for rgb in matrix]

    prediction_digit = model.predict([result])    

    return jsonify({
        'digit': int(prediction_digit[0]), 
        'matrix': result
    })
    
@app.route('/register-digit', methods=[POST])
def register():
    # parse du JSON envoyé via fetch
    digit, matrix = request.get_json(force=True).values() 
    matrix.insert(0, digit)
    
    with open('data-csv/train.csv','a') as file:
        file.write((','.join([str(i) for i in matrix]) + '\n'))
        
    return jsonify('success')

# run debug
if __name__ == "__main__":
    app.run(debug=True)