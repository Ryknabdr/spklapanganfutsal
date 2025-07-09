def calculate_saw(alternatives, weights):
    """
    Calculate SAW scores for alternatives.
    :param alternatives: List of dicts with criteria values for each alternative.
    :param weights: Dict of criteria weights.
    :return: List of dicts with normalized scores, total scores, and rankings.
    """
    # Extract criteria names
    criteria = list(weights.keys())

    # Prepare matrix of criteria values
    matrix = {c: [alt[c] for alt in alternatives] for c in criteria}

    # Determine benefit or cost criteria
    # Assuming harga and jarak are cost criteria (lower is better)
    # fasilitas, kenyamanan, pencahayaan are benefit criteria (higher is better)
    cost_criteria = ['harga', 'jarak']
    benefit_criteria = ['fasilitas', 'kenyamanan', 'pencahayaan']

    # Normalize matrix
    normalized = []
    for alt in alternatives:
        norm_alt = {}
        for c in criteria:
            if c in benefit_criteria:
                max_val = max(matrix[c])
                norm_val = alt[c] / max_val if max_val != 0 else 0
            elif c in cost_criteria:
                min_val = min(matrix[c])
                norm_val = min_val / alt[c] if alt[c] != 0 else 0
            else:
                norm_val = 0
            norm_alt[c] = norm_val
        normalized.append(norm_alt)

    # Calculate total scores
    results = []
    for i, alt in enumerate(alternatives):
        total_score = 0
        for c in criteria:
            total_score += normalized[i][c] * weights[c]
        results.append({
            'nama': alt.get('nama', f'Alternatif {i+1}'),
            'normalisasi': normalized[i],
            'total_skor': total_score
        })

    # Rank results
    results = sorted(results, key=lambda x: x['total_skor'], reverse=True)
    for rank, res in enumerate(results, start=1):
        res['peringkat'] = rank

    return results
