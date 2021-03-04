from flask import Flask, request, render_template, jsonify
import pickle
import pandas as pd
import os
import csv

GET = 'GET'
POST = 'POST'

app = Flask(__name__, template_folder='.')

#chargement du modèle

model = pickle.load(open('model.pkl','rb'))


@app.route('/', methods=[GET])
def home():
    return render_template("index.html")


@app.route('/recognize-digit',methods=[POST])
def results():
    # parse du JSON envoyé via fetch
    data = request.get_json(force=True)
    df = pd.DataFrame([data])
    df.to_csv('result.csv',index=False)
    prediction_digit = model.predict([data])
    
    

    return jsonify(int(prediction_digit[0]))

@app.route('/first', methods=[GET])
def test_first_line():
    df = pd.read_csv('./digit-recognizer/train.csv')
    l = list(df.iloc[4])

    arr = []

    for i in range(0,27):
        arr.append([])
        for j in range(0,27):
            arr[i].append(l.pop(0))


    return jsonify(arr)
