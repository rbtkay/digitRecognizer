# Digit Recognizer

## Sujet
L'objectif du projet est reconnaitre des chiffres dessinés par un utilisateur. Pour ce faire une IA est implémentée. Les chiffres sont identifiables à partir de leurs pixels grâce à un modèle entrainé au préalable sur l'arbre decitionnel classification. Celui-ci va pouvoir à ce moment-là prédire le chiffre voulu.


## CSV

- Créer un dossier data-csv.
- Telecharger les fichiers train.csv et test.csv depuis [Kaggle](https://www.kaggle.com/c/digit-recognizer/data).
- Déposer les dans le dossier.


## venv

### Créer le venv : <br/>
    
    python3 -m venv venv

### Lancer le venv

#### Widows : 

    venv\Scripts\activate

#### Unix : 

    venv/bin/activate

### Installer les packages requis : <br/>

    pip install -r requirements.txt

### Mettre à jour la liste des package : <br/>

    pip freeze > requirements.txt


## Lancer les notebooks

    jupyter notebook

- Le script de modélisation permet de définir le modèle d'entrainement en limitant au mieux le taux d'erreur.
- Le script de test sert lui à appliquer le modèle sur un autre jeu de données contenant uniquement les pixels et non les labels associés.

## Entrainer l'IA depuis un script Python

    python ./training.py


## Lancer l'API python via flask

    flask run

