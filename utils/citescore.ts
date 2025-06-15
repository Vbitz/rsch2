import { Paper } from '@/types/paper';

/**
 * Calculate citescore for a paper based on connections to other papers in the library
 * Citescore = number of edges (connections) to other papers in the library
 */
export function calculateCitescore(paper: Paper, allPapers: Paper[]): number {
  // All papers in the library contribute to citescore
  const allPaperIds = new Set(allPapers.map(p => p.paperId));
  
  let connections = 0;
  
  // Count connections through referencedBy (papers in library that reference this paper)
  if (paper.referencedBy) {
    connections += paper.referencedBy.filter(paperId => 
      allPaperIds.has(paperId) && paperId !== paper.paperId
    ).length;
  }
  
  // Count connections through citedBy (papers in library that cite this paper)
  if (paper.citedBy) {
    connections += paper.citedBy.filter(paperId => 
      allPaperIds.has(paperId) && paperId !== paper.paperId
    ).length;
  }
  
  // Count connections through references (papers this paper cites that are in library)
  if (paper.references) {
    connections += paper.references.filter(ref => 
      allPaperIds.has(ref.paperId) && ref.paperId !== paper.paperId
    ).length;
  }
  
  // Count connections through citations (papers that cite this paper that are in library)
  if (paper.citations) {
    connections += paper.citations.filter(cit => 
      allPaperIds.has(cit.paperId) && cit.paperId !== paper.paperId
    ).length;
  }
  
  return connections;
}

/**
 * Calculate citescores for all papers in the library
 */
export function calculateAllCitescores(papers: Paper[]): Paper[] {
  return papers.map(paper => ({
    ...paper,
    citescore: calculateCitescore(paper, papers)
  }));
}

/**
 * Sort papers by citescore (highest first)
 */
export function sortByCitescore(papers: Paper[]): Paper[] {
  return [...papers].sort((a, b) => (b.citescore || 0) - (a.citescore || 0));
}