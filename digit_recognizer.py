from sklearn import tree
import pandas as pd 

digits = pd.read_csv("./digit-recognizer/train.csv")

result_set = digits["label"]
train_set = digits[digits.columns.drop("label")]


from sklearn.model_selection import train_test_split
x_train, x_test, y_train, y_test = train_test_split(train_set, result_set, 
    test_size=0.33, stratify=result_set, random_state=42)


decisionTreeClassifier = tree.DecisionTreeClassifier()
decisionTreeClassifier = decisionTreeClassifier.fit(x_train, y_train)

predictions = decisionTreeClassifier.predict(x_test)
print("LA PREDICTION")
print(predictions)

print("LA REALITE")
print(list(y_test))

from sklearn.metrics import confusion_matrix
conf_mat = confusion_matrix(y_test, predictions)
conf_mat

acc = conf_mat.diagonal().sum()/conf_mat.sum()

err = 1 - acc
print('taux d''errer:', err * 100)