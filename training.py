import pandas as pd 
from sklearn import tree
from sklearn.model_selection import train_test_split
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
from datetime import date
import csv
import os

digits = pd.read_csv("./data-csv/train.csv")
digits.head()

y = digits["label"]
x = digits[digits.columns.drop("label")]

# reparti le set entre un set de train et un set de test
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, stratify=y, random_state=42)

# entrainement optimal du modèle 
OPTIMUM_DEPTH = 12
OPTIMUM_ESTIMATORS = 73

model = RandomForestClassifier(n_estimators=OPTIMUM_ESTIMATORS)
model.fit(x_train, y_train)

# prediction sur x_test
y_prediction = model.predict(x_test)

# calcule du taux d'erreur
conf_mat = confusion_matrix(y_test, y_prediction)
acc = conf_mat.diagonal().sum()/conf_mat.sum()
err = (1 - acc) * 100

# sauvegarde du progres d'un entrainement a un autre
progress_dict = digits['label'].value_counts().to_dict()

arr = list()
for key,value in progress_dict.items():
    arr.insert(key, value)

arr.append(err)
arr.append(date.today().strftime('%Y-%m-%d'))

# ecriture dans le fichier progress.csv
with open('progress.csv','a') as file:
    if os.stat("./progress.csv").st_size == 0:
        file.write("0,1,2,3,4,5,6,7,8,9,error_percentage,execution_date\n")
    file.write((','.join([str(i) for i in arr]) + '\n'))

# sauvegarde du modèle sous forme binaire
filename = "./model.pkl"
pickle.dump(model, open(filename, 'wb'))