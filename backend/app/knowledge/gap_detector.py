from typing import List, Dict, Any
from app.models.knowledge import KnowledgeDocument
from app.knowledge.retriever import retrieve_relevant_policies

def detect_knowledge_gaps(
    clusters: List[Dict[str, Any]],
    documents: List[KnowledgeDocument],
    threshold: float = 0.35
) -> List[Dict[str, Any]]:
    """
    Compares recurring complaint clusters against knowledge base documents.
    If a cluster has no policy document with retrieval score >= threshold,
    it is flagged as a Knowledge Gap.
    """
    gaps = []

    if not clusters:
        return gaps

    for cluster in clusters:
        cluster_text = f"{cluster.get('cluster_title', '')} {cluster.get('common_intent', '')} {cluster.get('summary', '')}"
        
        # Test against existing documents
        matches = retrieve_relevant_policies(cluster_text, documents, top_k=2)
        top_match = matches[0] if matches else None
        max_score = top_match["similarity_score"] if top_match else 0.0

        if max_score < threshold:
            category = cluster.get("dominant_category", "General")
            title = cluster.get("cluster_title", "Unclassified Issue")
            gaps.append({
                "cluster_id": cluster.get("cluster_id"),
                "cluster_title": title,
                "dominant_category": category,
                "complaint_count": cluster.get("ticket_count", 0),
                "urgency_level": cluster.get("average_urgency_level", "medium"),
                "max_kb_similarity": round(max_score, 4),
                "closest_policy": top_match["document_title"] if top_match else "None found",
                "gap_severity": "High" if cluster.get("ticket_count", 0) > 5 or cluster.get("average_urgency_level") == "critical" else "Medium",
                "suggested_policy_title": f"Standard Operating Procedure: {title}",
                "actionable_guidance": f"Customer complaints regarding '{title}' lack dedicated policy guidelines in the Knowledge Base. Agents currently respond without official documentation. We recommend drafting a formal SOP covering resolution steps, refund eligibility, and SLA commitments for {category}."
            })

    # Sort gaps by complaint_count descending
    gaps.sort(key=lambda x: x["complaint_count"], reverse=True)
    return gaps
