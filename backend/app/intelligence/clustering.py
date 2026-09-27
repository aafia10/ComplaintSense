from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans

def cluster_complaints(
    tickets: List[Dict[str, Any]],
    n_clusters: int = 5
) -> List[Dict[str, Any]]:
    """
    Clusters complaints into thematic groups using TF-IDF and KMeans.
    Extracts top keywords for each cluster.
    """
    if len(tickets) < n_clusters:
        n_clusters = max(1, len(tickets))

    texts = [t["message"] + " " + (t.get("subject") or "") for t in tickets]
    
    vec = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        max_features=1000,
        sublinear_tf=True
    )
    
    try:
        X = vec.fit_transform(texts)
        km = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=32, n_init=3)
        km.fit(X)

        order_centroids = km.cluster_centers_.argsort()[:, ::-1]
        terms = vec.get_feature_names_out()

        clusters = []
        for i in range(n_clusters):
            top_terms = [terms[ind] for ind in order_centroids[i, :6]]
            assigned_ticket_indices = [idx for idx, label in enumerate(km.labels_) if label == i]
            cluster_tickets = [tickets[idx] for idx in assigned_ticket_indices]
            
            # Formulate cluster display name based on top 2 terms
            cluster_title = " / ".join(top_terms[:2]).title()
            
            clusters.append({
                "cluster_id": i,
                "title": cluster_title,
                "keywords": top_terms,
                "count": len(cluster_tickets),
                "tickets": cluster_tickets
            })
            
        clusters.sort(key=lambda x: x["count"], reverse=True)
        return clusters
    except Exception:
        return []
