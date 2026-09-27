import os
import sys
import json
from collections import defaultdict
import numpy as np

# Add project root and backend to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

from scripts.train_classifier import TRAINING_DATA

EVAL_DIR = os.path.join(BASE_DIR, "evaluation")
os.makedirs(EVAL_DIR, exist_ok=True)
METRICS_PATH = os.path.join(EVAL_DIR, "metrics.json")

def evaluate():
    print(f"Running cross-validated evaluation on {len(TRAINING_DATA)} complaint samples...")
    X_texts = [t[0] for t in TRAINING_DATA]
    y_labels = [t[1] for t in TRAINING_DATA]

    classes = sorted(list(set(y_labels)))
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

    model_metrics = {
        "Naive Bayes": {"acc": [], "prec": [], "rec": [], "f1": [], "y_true": [], "y_pred": []},
        "Logistic Regression": {"acc": [], "prec": [], "rec": [], "f1": [], "y_true": [], "y_pred": []},
        "Linear SVM": {"acc": [], "prec": [], "rec": [], "f1": [], "y_true": [], "y_pred": []}
    }

    for train_idx, test_idx in skf.split(X_texts, y_labels):
        X_train = [X_texts[i] for i in train_idx]
        y_train = [y_labels[i] for i in train_idx]
        X_test = [X_texts[i] for i in test_idx]
        y_test = [y_labels[i] for i in test_idx]

        vec = TfidfVectorizer(ngram_range=(1, 2), max_features=3000, sublinear_tf=True, stop_words="english")
        X_train_vec = vec.fit_transform(X_train)
        X_test_vec = vec.transform(X_test)

        # 1. Naive Bayes
        nb = MultinomialNB(alpha=0.1)
        nb.fit(X_train_vec, y_train)
        nb_pred = nb.predict(X_test_vec)
        p, r, f, _ = precision_recall_fscore_support(y_test, nb_pred, average="weighted", zero_division=0)
        model_metrics["Naive Bayes"]["acc"].append(accuracy_score(y_test, nb_pred))
        model_metrics["Naive Bayes"]["prec"].append(p)
        model_metrics["Naive Bayes"]["rec"].append(r)
        model_metrics["Naive Bayes"]["f1"].append(f)
        model_metrics["Naive Bayes"]["y_true"].extend(y_test)
        model_metrics["Naive Bayes"]["y_pred"].extend(nb_pred)

        # 2. Logistic Regression
        logreg = LogisticRegression(max_iter=500, C=1.0, random_state=42)
        logreg.fit(X_train_vec, y_train)
        logreg_pred = logreg.predict(X_test_vec)
        p, r, f, _ = precision_recall_fscore_support(y_test, logreg_pred, average="weighted", zero_division=0)
        model_metrics["Logistic Regression"]["acc"].append(accuracy_score(y_test, logreg_pred))
        model_metrics["Logistic Regression"]["prec"].append(p)
        model_metrics["Logistic Regression"]["rec"].append(r)
        model_metrics["Logistic Regression"]["f1"].append(f)
        model_metrics["Logistic Regression"]["y_true"].extend(y_test)
        model_metrics["Logistic Regression"]["y_pred"].extend(logreg_pred)

        # 3. Linear SVM
        svm = LinearSVC(C=1.0, random_state=42, dual=False)
        svm.fit(X_train_vec, y_train)
        svm_pred = svm.predict(X_test_vec)
        p, r, f, _ = precision_recall_fscore_support(y_test, svm_pred, average="weighted", zero_division=0)
        model_metrics["Linear SVM"]["acc"].append(accuracy_score(y_test, svm_pred))
        model_metrics["Linear SVM"]["prec"].append(p)
        model_metrics["Linear SVM"]["rec"].append(r)
        model_metrics["Linear SVM"]["f1"].append(f)
        model_metrics["Linear SVM"]["y_true"].extend(y_test)
        model_metrics["Linear SVM"]["y_pred"].extend(svm_pred)

    # Compute aggregate summary
    summary_models = {}
    for name, m in model_metrics.items():
        summary_models[name] = {
            "accuracy": round(float(np.mean(m["acc"])), 4),
            "precision": round(float(np.mean(m["prec"])), 4),
            "recall": round(float(np.mean(m["rec"])), 4),
            "f1_score": round(float(np.mean(m["f1"])), 4)
        }
        print(f"[{name}] Acc: {summary_models[name]['accuracy']} | Prec: {summary_models[name]['precision']} | Rec: {summary_models[name]['recall']} | F1: {summary_models[name]['f1_score']}")

    # Generate Confusion Matrix from Linear SVM
    best_y_true = model_metrics["Linear SVM"]["y_true"]
    best_y_pred = model_metrics["Linear SVM"]["y_pred"]
    cm = confusion_matrix(best_y_true, best_y_pred, labels=classes)

    class_report = classification_report(best_y_true, best_y_pred, labels=classes, output_dict=True, zero_division=0)

    output_payload = {
        "status": "evaluated",
        "sample_count": len(TRAINING_DATA),
        "models": summary_models,
        "classes": classes,
        "confusion_matrix": {
            "classes": [c.split()[0] for c in classes],
            "full_classes": classes,
            "matrix": cm.tolist()
        },
        "classification_report": {
            k: {
                "precision": round(v.get("precision", 0.0), 3),
                "recall": round(v.get("recall", 0.0), 3),
                "f1_score": round(v.get("f1-score", 0.0), 3),
                "support": v.get("support", 0)
            }
            for k, v in class_report.items() if isinstance(v, dict)
        }
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    print(f"Metrics saved to {METRICS_PATH}")

if __name__ == "__main__":
    evaluate()
