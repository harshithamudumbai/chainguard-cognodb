import { Record as Neo4jRecord, Node, Relationship, Path } from "neo4j-driver";

export type GraphNode = {
  id: string;
  label: string;
  title: string;
  properties: Record<string, any>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export const normalizeGraph = (records: Neo4jRecord[]): GraphResponse => {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

  const processNode = (node: Node) => {
    const idStr = node.elementId;
    if (!nodeMap.has(idStr)) {
      const label = node.labels[0] || "Unknown";
      let title = node.properties.name || node.properties.title || node.properties.id || "Unknown";
      
      // Handle Neo4j Integers in properties
      const properties: Record<string, any> = {};
      for (const [key, value] of Object.entries(node.properties)) {
        if (value && typeof value === 'object' && 'toNumber' in value) {
          properties[key] = (value as any).toNumber();
        } else {
          properties[key] = value;
        }
      }

      nodeMap.set(idStr, {
        id: idStr, // Internal Neo4j ID or property ID? Let's use property ID if available to be deterministic for frontend
        label,
        title,
        properties,
      });
      // Override id with business id if available for stable frontend rendering
      if (properties.id) {
        nodeMap.get(idStr)!.id = properties.id;
      }
    }
  };

  const processRelationship = (rel: Relationship) => {
    const idStr = rel.elementId;
    if (!edgeMap.has(idStr)) {
       const properties: Record<string, any> = {};
       for (const [key, value] of Object.entries(rel.properties)) {
         if (value && typeof value === 'object' && 'toNumber' in value) {
           properties[key] = (value as any).toNumber();
         } else {
           properties[key] = value;
         }
       }

      edgeMap.set(idStr, {
        id: idStr,
        source: rel.startNodeElementId,
        target: rel.endNodeElementId,
        type: rel.type,
        properties,
      });
    }
  };

  records.forEach((record) => {
    record.keys.forEach((key) => {
      const value = record.get(key);
      if (!value) return;

      if (value.labels && value.properties) { // It's a Node
        processNode(value as Node);
      } else if (value.type && value.startNodeElementId && value.endNodeElementId) { // It's a Relationship
        processRelationship(value as Relationship);
      } else if (value.start && value.end && value.segments) { // It's a Path
        const path = value as Path;
        processNode(path.start);
        processNode(path.end);
        path.segments.forEach((segment) => {
          processNode(segment.start);
          processNode(segment.end);
          processRelationship(segment.relationship);
        });
      } else if (Array.isArray(value)) {
         value.forEach(item => {
           if (item && item.labels && item.properties) {
             processNode(item as Node);
           } else if (item && item.type && item.startNodeElementId) {
             processRelationship(item as Relationship);
           }
         });
      }
    });
  });

  // Second pass: map relationship start/end elementIds to business IDs if we swapped them
  const finalEdges = Array.from(edgeMap.values()).map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    return {
      ...edge,
      source: sourceNode ? sourceNode.id : edge.source,
      target: targetNode ? targetNode.id : edge.target,
    };
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: finalEdges,
  };
};

export const normalizeProperties = (properties: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value && typeof value === 'object' && 'toNumber' in value) {
      result[key] = (value as any).toNumber();
    } else {
      result[key] = value;
    }
  }
  return result;
}
