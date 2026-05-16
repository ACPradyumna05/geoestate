from flask import Flask, request, jsonify, make_response
import pandas as pd
import joblib
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEX_PATH = os.path.join(BASE_DIR, "data", "hex_clusters.json")

model = joblib.load(os.path.join(BASE_DIR, "xgboost_house_price_model.pkl"))

app = Flask(__name__)


@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/")
def home():
    return jsonify({"message": "GeoEstate API running"})


@app.route("/hexes", methods=["GET"])
def get_hexes():
    with open(HEX_PATH, "r", encoding="utf-8") as f:
        hexes = json.load(f)
    return jsonify(hexes)


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return make_response("", 204)
    try:
        data = request.json
        sample_house = pd.DataFrame([data])
        prediction = model.predict(sample_house)
        return jsonify({
            "status": "success",
            "predicted_price_per_sqft": float(prediction[0]),
            "input": data,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
