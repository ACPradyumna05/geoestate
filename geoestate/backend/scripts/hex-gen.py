import pandas as pd
import json


# ====================================
# LOAD FILES
# ====================================

housing_df = pd.read_csv(
    r"C:\Users\Prady\Desktop\HouseMapper\geoestate\backend\data\housing_data.csv"
)

coords_df = pd.read_csv(
    r"C:\Users\Prady\Desktop\HouseMapper\geoestate\backend\data\indian_cities_coordinates.csv"
)


# ====================================
# CLEAN COLUMN NAMES
# ====================================

housing_df.columns = (
    housing_df.columns
    .str.strip()
)

coords_df.columns = (
    coords_df.columns
    .str.strip()
)


# ====================================
# CLEAN CITY VALUES
# ====================================

housing_df["City"] = (
    housing_df["City"]
    .astype(str)
    .str.strip()
)

coords_df["City"] = (
    coords_df["City"]
    .astype(str)
    .str.strip()
)


# ====================================
# AGGREGATE BY CITY
# ====================================

city_stats = (
    housing_df
    .groupby("City")
    .agg({
        "Price_per_SqFt": "mean",
        "City": "count"
    })
    .rename(columns={
        "Price_per_SqFt": "avg_price",
        "City": "listing_count"
    })
    .reset_index()
)


# ====================================
# MERGE WITH COORDINATES
# ====================================

merged_df = city_stats.merge(
    coords_df,
    on="City",
    how="inner"
)


# ====================================
# BUILD HEX JSON
# ====================================

hex_clusters = []

for _, row in merged_df.iterrows():

    cluster = {

        "id": (
            row["City"]
            .lower()
            .replace(" ", "_")
        ),

        "city": row["City"],

        "lat": float(
            row["Latitude"]
        ),

        "lng": float(
            row["Longitude"]
        ),

        "avg_price": round(
            float(row["avg_price"]),
            2
        ),

        "listing_count": int(
            row["listing_count"]
        )
    }

    hex_clusters.append(cluster)


# ====================================
# SAVE
# ====================================

with open(
    "hex_clusters.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        hex_clusters,
        f,
        indent=2
    )


print(
    f"Generated {len(hex_clusters)} city clusters."
)