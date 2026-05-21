import logging
import numpy as np
import pandas as pd

logger = logging.getLogger("ml_algorithms")

class CustomSVD:
    """
    Matrix Factorization via Stochastic Gradient Descent.
    Approximates R ≈ P × Q^T where:
      P = user latent factor matrix (n_users × n_factors)
      Q = item latent factor matrix (n_items × n_factors)
    """

    def __init__(self, n_factors=30, n_epochs=20, lr=0.005, reg=0.02):
        self.n_factors = n_factors
        self.n_epochs = n_epochs
        self.lr = lr
        self.reg = reg
        self.P = None  # User factors
        self.Q = None  # Item factors
        self.bu = None  # User biases
        self.bi = None  # Item biases
        self.mu = 0.0  # Global mean rating
        self.user_id_to_idx = {}
        self.item_id_to_idx = {}
        self.idx_to_item_id = {}

    def fit(self, ratings_df: pd.DataFrame):
        """
        ratings_df must have columns: user_id, product_id, rating
        """
        logger.info(f"Training Custom SVD: {len(ratings_df)} ratings, {self.n_factors} factors, {self.n_epochs} epochs...")

        # Build index mappings
        unique_users = ratings_df["user_id"].unique()
        unique_items = ratings_df["product_id"].unique()
        self.user_id_to_idx = {uid: i for i, uid in enumerate(unique_users)}
        self.item_id_to_idx = {iid: i for i, iid in enumerate(unique_items)}
        self.idx_to_item_id = {i: iid for iid, i in self.item_id_to_idx.items()}

        n_users = len(unique_users)
        n_items = len(unique_items)
        self.mu = ratings_df["rating"].mean()

        # Initialize factor matrices with small random values
        np.random.seed(42)
        self.P = np.random.normal(0, 0.1, (n_users, self.n_factors))
        self.Q = np.random.normal(0, 0.1, (n_items, self.n_factors))
        self.bu = np.zeros(n_users)
        self.bi = np.zeros(n_items)

        # SGD training loop
        records = ratings_df[["user_id", "product_id", "rating"]].to_records(index=False)
        for epoch in range(self.n_epochs):
            np.random.shuffle(records)
            total_loss = 0.0
            for user_id, item_id, r in records:
                u = self.user_id_to_idx.get(user_id)
                i = self.item_id_to_idx.get(item_id)
                if u is None or i is None:
                    continue
                # Predicted rating
                pred = self.mu + self.bu[u] + self.bi[i] + self.P[u].dot(self.Q[i])
                err = r - pred
                total_loss += err ** 2
                # Gradient updates
                self.bu[u] += self.lr * (err - self.reg * self.bu[u])
                self.bi[i] += self.lr * (err - self.reg * self.bi[i])
                p_u = self.P[u].copy()
                self.P[u] += self.lr * (err * self.Q[i] - self.reg * self.P[u])
                self.Q[i] += self.lr * (err * p_u - self.reg * self.Q[i])

            rmse = np.sqrt(total_loss / len(records))
            if (epoch + 1) % 5 == 0:
                logger.info(f"  Epoch {epoch + 1}/{self.n_epochs} — RMSE: {rmse:.4f}")

        logger.info("Custom SVD training complete.")
        return self

    def predict(self, user_id: int, item_id: int) -> float:
        """Predict rating for a (user, item) pair."""
        u = self.user_id_to_idx.get(user_id)
        i = self.item_id_to_idx.get(item_id)
        if u is None or i is None:
            return self.mu  # fallback to global mean
        return float(self.mu + self.bu[u] + self.bi[i] + self.P[u].dot(self.Q[i]))

    def predict_top_n(self, user_id: int, seen_item_ids: set, top_n: int = 10):
        """Return top-N unseen items ranked by predicted rating."""
        u = self.user_id_to_idx.get(user_id)
        if u is None:
            return []
        scores = []
        for i, item_id in self.idx_to_item_id.items():
            if item_id in seen_item_ids:
                continue
            pred = self.mu + self.bu[u] + self.bi[i] + self.P[u].dot(self.Q[i])
            scores.append((item_id, float(pred)))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_n]
